const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { extname, join } = require('node:path');
const mysql = require('mysql2/promise');
const { searchReports } = require('./reports.cjs');
const { categories, readSubmission, saveSubmission, SubmissionError } = require('./submission.cjs');

const webRoot = join(__dirname, '..', 'web');
const pages = new Set([
  'index.html', 'cari.html', 'detail.html', 'masuk.html', 'daftar.html',
  'lapor-hilang.html', 'lapor-temuan.html', 'klaim.html', 'notifikasi.html', 'dashboard.html',
  'lapor.html', 'laporan-saya.html', 'tentang.html',
]);
const assets = new Set(['assets/css/style.css', 'assets/js/app.js', 'assets/js/cari.js', 'assets/js/beranda.js', 'assets/js/lapor.js']);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function createLoFoServer({ db, uploadsDir = join(__dirname, '..', 'uploads') } = {}) {
  let activeSubmissions = 0;
  return createServer({ requestTimeout: 60000 }, async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');

    let url;
    try {
      url = new URL(request.url, 'http://localhost');
    } catch {
      return sendJson(response, 400, { error: 'Alamat permintaan tidak valid.' });
    }

    if (url.pathname === '/api/reports' && request.method === 'POST') {
      response.setHeader('Cache-Control', 'no-store');
      const reject = (status, error) => {
        if (!request.readableEnded) response.setHeader('Connection', 'close');
        return sendJson(response, status, { error });
      };
      const { origin, host, 'sec-fetch-site': site } = request.headers;
      const protocol = request.socket.encrypted ? 'https' : 'http';
      if (site === 'cross-site' || (origin && origin !== `${protocol}://${host}`)) {
        return reject(403, 'Kirim laporan dari halaman LoFo.');
      }
      if (activeSubmissions >= 4) {
        response.setHeader('Retry-After', '5');
        return reject(503, 'Server sedang sibuk. Tunggu beberapa detik lalu coba lagi.');
      }
      activeSubmissions++;
      try {
        const report = await saveSubmission(db, uploadsDir, await readSubmission(request));
        return sendJson(response, 201, { report });
      } catch (error) {
        if (error instanceof SubmissionError) return reject(error.status, error.message);
        console.error('LoFo submission:', error.code ?? error.message);
        return reject(500, 'Penyimpanan laporan belum dapat dikonfirmasi.');
      } finally {
        activeSubmissions--;
      }
    }
    if (request.method !== 'GET') {
      response.setHeader('Allow', url.pathname === '/api/reports' ? 'GET, POST' : 'GET');
      return sendJson(response, 405, { error: 'Metode tidak didukung.' });
    }

    try {
      if (url.pathname === '/api/reports') {
        const { searchParams } = url;
        const q = (searchParams.get('q') ?? '').trim();
        const type = searchParams.get('type') ?? '';
        const category = searchParams.get('category') ?? '';
        const location = searchParams.get('location') ?? '';
        const sort = searchParams.get('sort') ?? 'newest';
        if (q.length > 100 || location.length > 100 ||
            !['', 'hilang', 'temuan'].includes(type) ||
            (category && !categories.includes(category)) ||
            !['newest', 'oldest'].includes(sort)) {
          return sendJson(response, 400, { error: 'Filter pencarian tidak valid.' });
        }
        response.setHeader('Cache-Control', 'no-store');
        const reports = await searchReports(db, { q, type, category, location, sort });
        return sendJson(response, 200, { reports });
      }

      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      if (!pages.has(file) && !assets.has(file)) {
        return sendJson(response, 404, { error: 'Halaman tidak ditemukan.' });
      }

      const body = await readFile(join(webRoot, file));
      response.writeHead(200, { 'Content-Type': contentTypes[extname(file)] });
      response.end(body);
    } catch (error) {
      if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Halaman tidak ditemukan.' });
      console.error('LoFo:', error.code ?? error.message);
      sendJson(response, 500, { error: 'Terjadi kesalahan pada server.' });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST || '127.0.0.1';
  const db = mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? 'lofo',
    user: process.env.DB_USER ?? 'lofo_app',
    password: process.env.DB_PASSWORD ?? '',
    charset: 'utf8mb4_unicode_ci',
    connectionLimit: 5,
  });
  const server = createLoFoServer({ db });
  server.once('close', () => db.end().catch((error) => console.error('LoFo:', error.code ?? error.message)));
  server.listen(port, host, () => {
    const { address, port } = server.address();
    console.log(`LoFo berjalan di http://${address.includes(':') ? `[${address}]` : address}:${port}`);
  });
}

module.exports = { createLoFoServer };
