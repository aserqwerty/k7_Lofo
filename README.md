<div align="center">

# 🟠 LoFo

### Sistem Informasi Pelaporan & Pengembalian Barang Hilang

Platform *lost & found* berbasis web untuk lingkungan **Politeknik Negeri Padang** — melaporkan, mencari, mencocokkan, dan mengklaim barang hilang dalam satu tempat.

![Status](https://img.shields.io/badge/status-frontend%20prototype-FB923C)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

---

## 📖 Tentang Proyek

**LoFo (Lost & Found)** adalah sistem informasi yang membantu sivitas akademika Politeknik Negeri Padang melaporkan, menelusuri, dan mengambil kembali barang yang hilang di lingkungan kampus.

Sebelumnya, proses ini berjalan manual: laporan tersebar di grup WhatsApp, barang temuan menumpuk di pos satpam tanpa data yang terpusat, dan klaim kepemilikan sering kali tidak dapat diverifikasi. LoFo menyatukan seluruh proses tersebut ke dalam satu platform yang terstruktur, transparan, dan mudah diakses dari HP maupun laptop.

**Masalah yang diselesaikan:**

- Laporan barang hilang/temuan tersebar dan cepat tenggelam di grup chat.
- Tidak ada pencocokan otomatis antara barang hilang dan barang temuan.
- Klaim kepemilikan rawan salah orang karena tidak ada verifikasi bukti.
- Data barang di pos satpam tidak tercatat rapi dan sulit ditelusuri.

**Solusi yang ditawarkan:**

- Satu pusat laporan barang hilang dan temuan kampus.
- Pencarian dengan kata kunci, kategori, dan status.
- Pengajuan klaim dengan bukti kepemilikan yang diverifikasi admin.
- Notifikasi perkembangan laporan dan klaim.
- Rencana pencocokan otomatis (*auto-matching*) dan donasi sukarela QRIS.

---

## ✨ Fitur Utama

### Untuk Pengguna

| Fitur | Deskripsi |
|---|---|
| Registrasi akun | Daftar dengan nama, email, nomor WhatsApp, dan kata sandi. |
| Login & logout | Masuk menggunakan email dan kata sandi. |
| Lapor barang hilang | Terbitkan laporan kehilangan berisi ciri barang, lokasi, waktu, dan foto. |
| Lapor barang temuan | Laporkan barang yang ditemukan beserta pos penitipan (*drop-off*) resmi. |
| Cari & filter barang | Telusuri barang berdasarkan kata kunci, kategori, dan status (hilang/temuan). |
| Detail barang | Lihat foto, deskripsi, lokasi, status, dan data pelapor. |
| Ajukan klaim | Klaim kepemilikan barang temuan dengan deskripsi ciri khusus dan unggah bukti. |
| Kelola laporan saya | Pantau riwayat laporan dan status klaim. |
| Notifikasi | Terima pembaruan status laporan, klaim, dan rekomendasi kecocokan barang. |
| Profil & kata sandi | Perbarui data akun dan ganti kata sandi. |

### Untuk Admin

| Fitur | Deskripsi |
|---|---|
| Dashboard analitik | Ringkasan total laporan, klaim masuk, tren laporan, dan antrean tindakan. |
| Verifikasi klaim | Tinjau bukti kepemilikan lalu setujui atau tolak klaim. |
| Kelola laporan | Moderasi, arsipkan, atau hapus laporan yang usang/melanggar aturan. |
| Kelola pengguna | Tangguhkan (*suspend*) atau pulihkan akun pengguna. |

### Fitur Sistem (rencana pengembangan)

- **Auto-matching** laporan hilang dan temuan berdasarkan kategori, lokasi, waktu, dan kemiripan deskripsi (ambang kecocokan ≥ 70%).
- **Donasi sukarela QRIS** pasca lapor/klaim dengan alur 2-state (scan → terima kasih), sepenuhnya opsional.
- **Verifikasi OTP WhatsApp** 6 digit saat registrasi (berlaku 5 menit).

---

## 🔄 Bagaimana LoFo Bekerja

1. **Laporkan barang** — tulis deskripsi lengkap, ciri khusus, lokasi terakhir, dan lampirkan foto.
2. **Pencocokan otomatis** — sistem membandingkan laporan kehilangan dengan barang temuan yang relevan.
3. **Verifikasi & ambil** — ajukan klaim dengan bukti kepemilikan, tunggu verifikasi admin, lalu ambil barang di pos penitipan.

---

## 🚀 Cara Menjalankan

Proyek ini belum membutuhkan *build tools* atau dependensi. Semua halaman berjalan langsung di browser.

### Opsi 1 — Buka langsung

Buka file `web/index.html` di browser.

### Opsi 2 — Local server (disarankan)

```bash
# dari root repository
cd web

# Python 3
python -m http.server 8000
```

Lalu buka **http://localhost:8000** di browser.

### Opsi 3 — VS Code Live Server

Klik kanan `web/index.html` → **Open with Live Server**.

> Halaman akan terbuka di `http://127.0.0.1:5500/web/index.html`.

---

## 🔐 Cara Login

Buka halaman **`web/masuk.html`** (atau klik tombol **Masuk** pada navbar).

### Akun demo

| Field | Nilai |
|---|---|
| Email | `achmad@lofo.id` |
| Kata sandi | `lofopassword` |

Kredensial di atas sudah terisi otomatis di form. Langkah login:

1. Buka `web/masuk.html`.
2. Pastikan email dan kata sandi terisi (atau masukkan kredensial lain yang valid).
3. Klik **Masuk ke Akun**.
4. Akan muncul notifikasi *"Berhasil masuk. Selamat datang kembali!"*.

> [!IMPORTANT]
> Autentikasi saat ini **masih simulasi frontend**. Form hanya memvalidasi format email dan kolom wajib, lalu menampilkan notifikasi sukses — belum ada sesi, database, atau pengalihan halaman. Jangan gunakan kata sandi asli.

### Login sebagai Admin

Halaman admin saat ini dapat diakses langsung melalui **`web/dashboard.html`**. Belum ada pemisahan hak akses berbasis *role*, sehingga halaman ini belum dilindungi.

### Registrasi akun baru

Buka **`web/daftar.html`**, isi nama, email, nomor WhatsApp, dan kata sandi (minimal 8 karakter). Form sudah dilengkapi indikator kekuatan kata sandi. Alur OTP WhatsApp belum diimplementasikan pada versi frontend ini.

### Lupa kata sandi

Tautan **"Lupa kata sandi?"** pada halaman login masih berupa simulasi dan hanya menampilkan notifikasi.

---

## 🗂️ Halaman Aplikasi

| File | Halaman | Fungsi |
|---|---|---|
| `index.html` | Beranda | Hero, statistik, 3 langkah kerja, kategori populer, laporan terbaru. |
| `masuk.html` | Login | Form masuk pengguna dengan akun demo dan opsi "Ingat saya". |
| `daftar.html` | Registrasi | Form pendaftaran akun + indikator kekuatan kata sandi. |
| `cari.html` | Cari Barang | Pencarian real-time, filter kategori & status, kartu hasil. |
| `detail.html` | Detail Barang | Foto, deskripsi, informasi barang, data pelapor, barang mirip. |
| `lapor-hilang.html` | Lapor Hilang | Formulir pelaporan barang hilang. |
| `lapor-temuan.html` | Lapor Temuan | Formulir pelaporan barang temuan + lokasi drop-off. |
| `klaim.html` | Ajukan Klaim | Form klaim kepemilikan + unggah bukti. |
| `dashboard.html` | Dashboard Admin | Statistik laporan, klaim, tren 7 hari, antrean tindakan. |
| `notifikasi.html` | Notifikasi | Daftar pemberitahuan dan aksi "tandai sudah dibaca". |

---

## 🧰 Teknologi

**Saat ini (frontend):**

- HTML5 semantik
- CSS3 (custom properties, flexbox, grid, responsive)
- JavaScript vanilla (tanpa framework)
- Google Fonts — Inter
- Ikon SVG inline
- Tanpa dependensi, tanpa proses build

**Rencana backend (mengacu pada SRS):**

- Runtime Node.js / PHP
- Basis data PostgreSQL / MySQL
- Web server Nginx
- WhatsApp Gateway (Fonnte/Twilio) untuk OTP
- Autentikasi JWT, enkripsi kata sandi Bcrypt
- Integrasi QRIS untuk donasi sukarela

> Catatan: bagian backend di atas merupakan rancangan pada dokumen SRS dan **belum diimplementasikan** di repository ini.

---

## 📁 Struktur Proyek

```text
k7_Lofo/
├─ web/
│  ├─ index.html          # Beranda
│  ├─ masuk.html          # Login
│  ├─ daftar.html         # Registrasi
│  ├─ cari.html           # Pencarian & filter
│  ├─ detail.html         # Detail barang
│  ├─ lapor-hilang.html   # Form laporan kehilangan
│  ├─ lapor-temuan.html   # Form laporan temuan
│  ├─ klaim.html          # Form klaim kepemilikan
│  ├─ dashboard.html      # Dashboard admin
│  ├─ notifikasi.html     # Pusat notifikasi
│  └─ assets/
│     ├─ css/style.css    # Seluruh styling aplikasi
│     └─ js/app.js        # Header/footer, filter, validasi, toast
├─ .gitignore
└─ README.md
```

---

## 📌 Status Proyek

| Komponen | Status |
|---|---|
| UI 10 halaman (desktop & mobile) | ✅ Selesai |
| Pencarian & filter kategori/status | ✅ Berjalan (data dummy) |
| Validasi form & indikator kata sandi | ✅ Berjalan (client-side) |
| Login & registrasi | 🟡 Simulasi frontend |
| Backend & database | ⬜ Belum |
| OTP WhatsApp | ⬜ Belum |
| Auto-matching | ⬜ Belum |
| Donasi QRIS | ⬜ Belum |
| Proteksi role admin | ⬜ Belum |

---

## 🗺️ Roadmap

- [x] Desain dan implementasi antarmuka 10 halaman
- [x] Navbar, bottom navigation, dan footer responsif
- [x] Pencarian real-time dan filter kategori/status
- [x] Validasi form, toast, dan indikator kekuatan kata sandi
- [ ] API backend dan skema database (`users`, `reports`, `claims`, `dropoff_locations`, `notifications`, `donations`)
- [ ] Autentikasi JWT, Bcrypt, dan OTP WhatsApp 6 digit
- [ ] Unggah foto barang (maks. 5 MB)
- [ ] Auto-matching dengan ambang kecocokan ≥ 70%
- [ ] Verifikasi klaim dan moderasi oleh admin
- [ ] Donasi sukarela QRIS 2-state
- [ ] Proteksi halaman berdasarkan role
- [ ] Pengujian (unit & end-to-end)

---

## 👥 Tim Pengembang

| Nama | NIM |
|---|---|
| Achmad Ghozali | 2411083001 |
| Fadila Aulia | 2411081007 |
| Amelia Amanatul Islam | 2411082002 |

**Mata Kuliah:** Proyek
**Program Studi:** Teknologi Rekayasa Perangkat Lunak
**Jurusan:** Teknologi Informasi — Politeknik Negeri Padang

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik mata kuliah Proyek di Politeknik Negeri Padang. Belum dilisensikan untuk penggunaan komersial.
