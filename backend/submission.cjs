const { randomUUID } = require('node:crypto');
const { mkdir, unlink, writeFile } = require('node:fs/promises');
const { basename, join } = require('node:path');
const sharp = require('sharp');

const categories = ['elektronik', 'dompet', 'kunci', 'dokumen', 'pakaian', 'lainnya'];
const photoLimit = 5 * 1024 * 1024;
const bodyLimit = 3 * photoLimit + 64 * 1024;

class SubmissionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function parseForm(request) {
  const contentType = request.headers['content-type'] ?? '';
  if (!/^multipart\/form-data(?:;|$)/i.test(contentType)) {
    throw new SubmissionError(415, 'Gunakan formulir unggah foto LoFo.');
  }
  const tooLarge = () => new SubmissionError(413, 'Total unggahan terlalu besar. Maksimal 5 MB per foto.');
  if (Number(request.headers['content-length']) > bodyLimit) throw tooLarge();
  const parts = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > bodyLimit) throw tooLarge();
    parts.push(chunk);
  }

  try {
    return await new Response(Buffer.concat(parts, size), { headers: { 'Content-Type': contentType } }).formData();
  } catch {
    throw new SubmissionError(400, 'Formulir tidak dapat dibaca. Coba kirim ulang.');
  }
}

function text(form, name, label, max, required = true) {
  const entries = form.getAll(name);
  const value = typeof entries[0] === 'string' ? entries[0].replace(/\r\n?/g, '\n').trim() : '';
  if (entries.length > 1 || (entries.length === 1 && typeof entries[0] !== 'string') ||
      (required && !value) || value.length > max) {
    throw new SubmissionError(422, `${label} tidak valid (maksimal ${max} karakter).`);
  }
  return value;
}

async function normalizePhoto(file) {
  if (!(file instanceof File) || !file.size) throw new SubmissionError(422, 'Pilih file foto yang tidak kosong.');
  if (file.size > photoLimit) throw new SubmissionError(413, 'Ukuran setiap foto maksimal 5 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const allowed = (
    (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
  );
  if (allowed) {
    try {
      return await sharp(bytes, { limitInputPixels: 32_000_000, autoOrient: true })
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#fff' })
        .jpeg({ quality: 88 })
        .toBuffer();
    } catch {
      throw new SubmissionError(422, 'Foto rusak atau resolusinya terlalu besar. Coba foto lain.');
    }
  }
  throw new SubmissionError(422, 'Gunakan foto JPG, PNG, atau WebP.');
}

async function readSubmission(request) {
  const form = await parseForm(request);
  const type = text(form, 'type', 'Jenis laporan', 6);
  const title = text(form, 'title', 'Nama barang', 160);
  const description = text(form, 'description', 'Deskripsi', 2000);
  const category = text(form, 'category', 'Kategori', 50);
  const location = text(form, 'location', 'Lokasi', 100);
  const occurredAt = text(form, 'occurredAt', 'Tanggal kejadian', 10);
  const dropoff = text(form, 'dropoff', 'Penitipan', 10, false);
  if (!['hilang', 'temuan'].includes(type) || !categories.includes(category)) {
    throw new SubmissionError(422, 'Pilih jenis dan kategori laporan yang tersedia.');
  }
  const date = new Date(`${occurredAt}T00:00:00Z`);
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(occurredAt) || !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== occurredAt) {
    throw new SubmissionError(422, 'Tanggal kejadian tidak valid.');
  }
  if (dropoff && (type !== 'temuan' || dropoff !== 'pos-satpam')) {
    throw new SubmissionError(422, 'Pilihan penitipan tidak valid.');
  }
  const files = form.getAll('photos');
  const max = type === 'hilang' ? 1 : 3;
  if (files.length > max) throw new SubmissionError(422, `Jenis laporan ini dapat memuat maksimal ${max} foto.`);
  const photos = [];
  for (const [index, file] of files.entries()) {
    try {
      photos.push(await normalizePhoto(file));
    } catch (error) {
      if (error instanceof SubmissionError) error.message = `Foto ${index + 1}: ${error.message}`;
      throw error;
    }
  }
  return { values: [title, description, type, category, location, occurredAt, dropoff || null], photos };
}

async function saveSubmission(db, uploadsDir, { values, photos }) {
  const connection = await db.getConnection();
  const created = [];
  let committing = false;
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      INSERT INTO reports (title, description, type, category, location, occurred_at, dropoff)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, values);
    if (photos.length) await mkdir(uploadsDir, { recursive: true, mode: 0o700 });
    for (const photo of photos) {
      const key = `${randomUUID()}.jpg`;
      const path = join(uploadsDir, key);
      try {
        await writeFile(path, photo, { flag: 'wx', mode: 0o600 });
        created.push(path);
      } catch (error) {
        if (error.code !== 'EEXIST') created.push(path);
        throw error;
      }
      await connection.execute('INSERT INTO report_photos (report_id, storage_key, byte_size) VALUES (?, ?, ?)', [result.insertId, key, photo.length]);
    }
    committing = true;
    await connection.commit();
    return { id: result.insertId, status: 'pending' };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      connection.destroy();
      console.error('LoFo rollback:', rollbackError.code ?? rollbackError.message);
    }
    // Deadlocks roll back the transaction. A lost COMMIT acknowledgement does not prove rollback.
    if (!committing || error.code === 'ER_LOCK_DEADLOCK') {
      for (const path of created) {
        await unlink(path).catch((cleanupError) => {
          if (cleanupError.code !== 'ENOENT') console.error('LoFo cleanup:', cleanupError.code);
        });
      }
    } else if (created.length) {
      console.error('LoFo: hasil commit tidak diketahui. Cocokkan referensi database sebelum menghapus foto:', created.map((path) => basename(path)).join(', '));
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { categories, readSubmission, saveSubmission, SubmissionError };
