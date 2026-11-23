const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { test } = require('node:test');
const mysql = require('mysql2/promise');
const { createLoFoServer } = require('../backend/server.cjs');

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

test('server menyajikan halaman dan aset tanpa membuka file internal', async (t) => {
  const url = await withServer(t);
  for (const path of ['/', '/cari.html', '/lapor.html', '/laporan-saya.html', '/tentang.html', '/assets/css/style.css', '/assets/js/cari.js', '/assets/js/beranda.js']) {
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
  const admin = await mysql.createConnection({
    host: process.env.TEST_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT ?? 3306),
    user: process.env.TEST_DB_USER ?? 'root',
    password: process.env.TEST_DB_PASSWORD ?? '',
  });
  t.after(() => admin.end());
  const schema = `lofo_test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE DATABASE \`${schema}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  try {
    await admin.changeUser({ database: schema });
    await admin.query(await readFile(join(__dirname, '../backend/schema.sql'), 'utf8'));
    const url = await withServer(t, { db: admin });
    const get = async (query = '') => {
      const response = await fetch(`${url}/api/reports${query}`);
      assert.equal(response.status, 200);
      return (await response.json()).reports;
    };
    assert.deepEqual(await get(), []);

    const insert = `INSERT INTO reports (title, description, type, category, location, occurred_at)
                    VALUES (?, ?, ?, ?, ?, ?)`;
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
