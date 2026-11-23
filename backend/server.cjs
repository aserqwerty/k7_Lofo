const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { extname, join } = require('node:path');
const mysql = require('mysql2/promise');
const { searchReports } = require('./reports.cjs');

const webRoot = join(__dirname, '..', 'web');
const pages = new Set([
  'index.html', 'cari.html', 'detail.html', 'masuk.html', 'daftar.html',
  'lapor-hilang.html', 'lapor-temuan.html', 'klaim.html', 'notifikasi.html', 'dashboard.html',
  'lapor.html', 'laporan-saya.html', 'tentang.html',
]);
const assets = new Set(['assets/css/style.css', 'assets/js/app.js', 'assets/js/cari.js', 'assets/js/beranda.js']);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function createLoFoServer({ db } = {}) {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return sendJson(response, 405, { error: 'Metode tidak didukung.' });
    }

    let url;
    try {
      url = new URL(request.url, 'http://localhost');
    } catch {
      return sendJson(response, 400, { error: 'Alamat permintaan tidak valid.' });
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
            !['', 'elektronik', 'dompet', 'kunci', 'dokumen'].includes(category) ||
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
  server.listen(port, '127.0.0.1', () => {
    console.log(`LoFo berjalan di http://127.0.0.1:${server.address().port}`);
  });
}

module.exports = { createLoFoServer };
