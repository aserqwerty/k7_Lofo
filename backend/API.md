# API laporan LoFo

## `GET /api/reports`

Mengembalikan `{"reports":[]}` jika tidak ada laporan **terverifikasi** yang cocok. Filter opsional: `q` (kata kunci), `type`, `category`, `location` (teks persis), dan `sort` (`newest` atau `oldest`). Tidak mengembalikan foto, status penitipan, atau laporan yang menunggu verifikasi.

## `POST /api/reports`

Kirim `multipart/form-data` dari halaman LoFo. Belum memakai akun; jalankan hanya secara lokal atau di jaringan privat untuk tes.

| Kolom | Isi |
| --- | --- |
| `type` | `hilang` atau `temuan` |
| `title` | Nama barang, maksimal 160 karakter |
| `description` | Ciri barang, maksimal 2.000 karakter |
| `category` | `elektronik`, `dompet`, `kunci`, `dokumen`, `pakaian`, atau `lainnya` |
| `location` | Lokasi, maksimal 100 karakter |
| `occurredAt` | Tanggal valid `YYYY-MM-DD` |
| `dropoff` | Opsional, `pos-satpam` hanya untuk `temuan` |
| `photos` | Opsional, satu berkas per bagian. Maksimal 1 untuk `hilang` atau 3 untuk `temuan`. Format JPG, PNG, atau WebP, maksimal 5 MiB dan 32 megapiksel per berkas. |

Setelah laporan, foto, dan referensi foto tersimpan: HTTP `201`, contoh `{"report":{"id":24,"status":"pending"}}`. Foto dinormalisasi ke JPEG tanpa metadata dan tidak disajikan lewat HTTP. Verifikasi Admin dan riwayat akun belum terhubung.

Kesalahan memakai bentuk `{"error":"…"}`. `400` multipart rusak, `403` asal browser ditolak, `413` ukuran melampaui batas, `415` bukan multipart, `422` isi tidak valid, `503` server sibuk. `500` atau koneksi terputus berarti penyimpanan belum dapat dikonfirmasi; jangan anggap laporan pasti gagal karena pengiriman ulang bisa membuat duplikat.
