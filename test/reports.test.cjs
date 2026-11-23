const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { mkdtemp, readFile, readdir, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { test } = require('node:test');
const mysql = require('mysql2/promise');
const { createLoFoServer } = require('../backend/server.cjs');

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAFElEQVQImWP4v5Th/1IGEP6/lAEAMfoGke+6TYoAAAAASUVORK5CYII=', 'base64');
function reportForm(type, photos = []) {
  const form = new FormData();
  for (const [name, value] of Object.entries({ type, title: 'Botol biru', category: 'lainnya', location: 'Gedung A', description: 'Tutup putih', occurredAt: '2025-05-01' })) form.set(name, value);
  for (const photo of photos) form.append('photos', new Blob([photo], { type: 'image/png' }), 'foto.png');
  return form;
}

async function withServer(t, dependencies) {
  const server = createLoFoServer(dependencies);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('jenis di luar daftar ditolak sebelum membaca database', async (t) => {
  const url = await withServer(t);
  const response = await fetch(`${url}/api/reports?type=lain`);
  assert.equal(response.status, 400);
  assert.equal(typeof (await response.json()).error, 'string');
});

test('pengiriman menolak foto yang bukan gambar, foto terlalu besar, dan jumlah berlebih', async (t) => {
  const url = `${await withServer(t)}/api/reports`;
  for (const [photos, expected] of [[[Buffer.from('bukan gambar')], 422], [[png.subarray(0, 45)], 422], [[Buffer.alloc(5 * 1024 * 1024 + 1)], 413], [[png, png], 422]]) {
    const response = await fetch(url, { method: 'POST', body: reportForm('hilang', photos) });
    assert.equal(response.status, expected);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('pengiriman menolak permintaan browser lintas situs dan tanggal tidak valid', async (t) => {
  const url = `${await withServer(t)}/api/reports`;
  const foreign = await fetch(url, { method: 'POST', body: reportForm('hilang'), headers: { Origin: 'https://example.org' } });
  assert.equal(foreign.status, 403);
  const form = reportForm('hilang');
  form.set('occurredAt', '2025-02-30');
  assert.equal((await fetch(url, { method: 'POST', body: form })).status, 422);
  assert.equal((await fetch(url, { method: 'POST', body: 'bukan multipart' })).status, 415);
  const invalidDropoff = reportForm('hilang');
  invalidDropoff.set('dropoff', 'pos-satpam');
  assert.equal((await fetch(url, { method: 'POST', body: invalidDropoff })).status, 422);
});

test('laporan menerima deskripsi 2.000 karakter dengan baris baru', async (t) => {
  let values;
  const connection = {
    async beginTransaction() {}, async commit() {}, release() {},
    async execute(sql, parameters) { values = parameters; return [{ insertId: 1 }]; },
  };
  const url = await withServer(t, { db: { async getConnection() { return connection; } } });
  const form = reportForm('hilang');
  const description = `${'a'.repeat(1000)}\n${'b'.repeat(999)}`;
  form.set('description', description);
  assert.equal((await fetch(`${url}/api/reports`, { method: 'POST', body: form })).status, 201);
  assert.equal(values[1], description);
});

test('unggahan dibersihkan jika commit dibatalkan karena deadlock, bukan jika hasil commit tidak diketahui', async (t) => {
  for (const known of [true, false]) {
    const uploadsDir = await mkdtemp(join(tmpdir(), 'lofo-commit-test-'));
    t.after(() => rm(uploadsDir, { recursive: true, force: true }));
    const commitError = known ? { code: 'ER_LOCK_DEADLOCK' } : { code: 'PROTOCOL_CONNECTION_LOST' };
    const connection = {
      async beginTransaction() {}, async execute() { return [{ insertId: 1 }]; },
      async commit() { throw Object.assign(new Error('Simulasi commit'), commitError); },
      async rollback() {}, release() {},
    };
    const url = await withServer(t, { uploadsDir, db: { async getConnection() { return connection; } } });
    assert.equal((await fetch(`${url}/api/reports`, { method: 'POST', body: reportForm('hilang', [png]) })).status, 500);
    assert.equal((await readdir(uploadsDir)).length, known ? 0 : 1);
  }
});

test('server menyajikan halaman dan aset tanpa membuka file internal', async (t) => {
  const url = await withServer(t);
  for (const path of ['/', '/cari.html', '/lapor.html', '/lapor-hilang.html', '/lapor-temuan.html', '/laporan-saya.html', '/tentang.html', '/assets/css/style.css', '/assets/js/cari.js', '/assets/js/beranda.js', '/assets/js/lapor.js']) {
    assert.equal((await fetch(url + path)).status, 200, path);
  }
  for (const path of ['/backend/schema.sql', '/backend/lofo.db', '/.env']) {
    assert.equal((await fetch(url + path)).status, 404, path);
  }
});

test('halaman prototipe tidak menampilkan data akun dan laporan contoh', async (t) => {
  const url = await withServer(t);
  for (const path of ['/detail.html', '/dashboard.html', '/klaim.html', '/notifikasi.html', '/masuk.html']) {
    const html = await (await fetch(url + path)).text();
    assert.doesNotMatch(html, /iPhone 13 Pro|Achmad Ghozali|achmad@lofo\.id|lofopassword/, path);
  }
});

test('API membaca database MySQL kosong dan menerapkan filter pada data tes terisolasi', {
  skip: process.env.LOFO_MYSQL_TEST !== '1',
}, async (t) => {
  const options = {
    host: process.env.TEST_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT ?? 3306),
    user: process.env.TEST_DB_USER ?? 'root',
    password: process.env.TEST_DB_PASSWORD ?? '',
  };
  const admin = await mysql.createConnection({ ...options, multipleStatements: true });
  t.after(() => admin.end());
  const schema = `lofo_test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE DATABASE \`${schema}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  try {
    await admin.changeUser({ database: schema });
    await admin.query(await readFile(join(__dirname, '../backend/schema.sql'), 'utf8'));
    const uploadsDir = await mkdtemp(join(tmpdir(), 'lofo-uploads-'));
    const pool = mysql.createPool({ ...options, database: schema });
    t.after(async () => {
      await pool.end();
      await rm(uploadsDir, { recursive: true, force: true });
    });
    const url = await withServer(t, { db: pool, uploadsDir });
    const get = async (query = '') => {
      const response = await fetch(`${url}/api/reports${query}`);
      assert.equal(response.status, 200);
      return (await response.json()).reports;
    };
    assert.deepEqual(await get(), []);

    const submit = async (type, photos, dropoff = '') => {
      const form = reportForm(type, photos);
      if (dropoff) form.set('dropoff', dropoff);
      const response = await fetch(`${url}/api/reports`, { method: 'POST', body: form });
      assert.equal(response.status, 201);
      const { report } = await response.json();
      assert.equal(report.status, 'pending');
      assert.ok(Number.isInteger(report.id));
      return report.id;
    };
    const foundId = await submit('temuan', [png, png, png], 'pos-satpam');
    await submit('hilang', [png]);
    await submit('hilang', []);
    const [[{ count }]] = await admin.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'pending'");
    assert.equal(count, 3);
    const [[found]] = await admin.execute('SELECT dropoff FROM reports WHERE id = ?', [foundId]);
    assert.equal(found.dropoff, 'pos-satpam');
    const [photos] = await admin.execute('SELECT storage_key, byte_size FROM report_photos WHERE report_id = ?', [foundId]);
    assert.equal(photos.length, 3);
    const files = await readdir(uploadsDir);
    assert.equal(files.length, 4);
    for (const { storage_key: key, byte_size: size } of photos) {
      const photo = await readFile(join(uploadsDir, key));
      assert.equal(photo.length, size);
      assert.equal(photo.readUInt16BE(), 0xffd8);
      assert.equal((await fetch(`${url}/uploads/${key}`)).status, 404);
    }
    assert.deepEqual(await get('?q=Botol'), []);

    await admin.query("CREATE TRIGGER reject_test_photo BEFORE INSERT ON report_photos FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Simulasi gagal menyimpan metadata'");
    const failed = await fetch(`${url}/api/reports`, { method: 'POST', body: reportForm('hilang', [png]) });
    assert.equal(failed.status, 500);
    assert.equal((await failed.json()).report, undefined);
    assert.deepEqual(await readdir(uploadsDir), files);
    const [[afterFailure]] = await admin.query('SELECT COUNT(*) AS count FROM reports');
    assert.equal(afterFailure.count, 3);
    await admin.query('DROP TRIGGER reject_test_photo');

    const insert = `INSERT INTO reports (title, description, type, category, location, occurred_at, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'verified')`;
    await admin.execute(insert, ['Ponsel Android', 'Casing gelap', 'temuan', 'elektronik', 'Ruang Baca', '2026-10-06']);
    await admin.execute(insert, ['iPhone 13 Pro', 'Ditemukan di kantin', 'temuan', 'elektronik', 'Kantin Gedung A', '2026-10-10']);
    await admin.execute(insert, ['Dompet Coklat', 'Kulit asli', 'hilang', 'dompet', 'Perpustakaan', '2026-10-12']);
    const [phone] = await get('?q=IPHONE&type=temuan&category=elektronik&location=Kantin+Gedung+A');
    assert.equal(phone.title, 'iPhone 13 Pro');
    assert.equal(phone.occurredAt, '2026-10-10');
    assert.deepEqual(await get('?q=IPHONE&type=hilang'), []);
    assert.deepEqual((await get('?category=elektronik&sort=oldest')).map(({ title }) => title), ['Ponsel Android', 'iPhone 13 Pro']);
    assert.equal((await get())[0].title, 'Dompet Coklat');
    assert.deepEqual(await get('?q=%25'), []);
  } finally {
    await admin.query(`DROP DATABASE \`${schema}\``);
  }
});
