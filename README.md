# Bilangan Rasional Kelas VII

Aplikasi web statis interaktif untuk materi Bilangan Rasional kelas VII. Siap di-host melalui GitHub Pages dan dapat menyinkronkan progress ke Google Sheets melalui Google Apps Script.

## Fitur utama

- 4 misi belajar: konsep, konversi, garis bilangan, membandingkan & mengurutkan
- pecahan vertikal, bukan slash, pada UI pembelajaran
- animasi bertahap pecahan ke desimal
- latihan interaktif dan evaluasi 10 soal acak
- XP, badge, progress, fullscreen, mobile-first
- penyimpanan lokal dengan `localStorage`
- sinkronisasi checkpoint ke Google Apps Script
- Google Sheets sebagai penyimpanan cloud sederhana
- aplikasi tetap bisa dipakai jika sinkronisasi gagal

## Struktur

```text
index.html
css/
js/
data/
assets/
gas/Code.gs
README.md
```

## 1. Jalankan lokal

Karena aplikasi memakai ES Modules dan mengambil `data/questions.json`, gunakan local web server, bukan membuka `index.html` dengan `file://`.

Contoh dengan Python:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## 2. Buat Google Sheets

1. Buat spreadsheet baru di Google Sheets.
2. Nama file bebas, misalnya `Progress Bilangan Rasional`.
3. Tidak perlu membuat sheet manual. Script akan membuat:
   - `Students`
   - `Progress`
   - `QuizResults`
   - `ActivityLog`

## 3. Pasang Google Apps Script

1. Dari spreadsheet, buka **Extensions > Apps Script**.
2. Hapus kode awal.
3. Salin seluruh isi `gas/Code.gs`.
4. Simpan project.

Script memakai spreadsheet aktif, jadi paling aman Apps Script dibuat dari spreadsheet yang akan menjadi database.

## 4. Deploy sebagai Web App

1. Klik **Deploy > New deployment**.
2. Pilih **Web app**.
3. `Execute as`: **Me**.
4. `Who has access`: pilih opsi yang mengizinkan pengguna aplikasi mengakses endpoint sesuai kebijakan akun Google/Workspace Anda.
5. Klik **Deploy**.
6. Salin URL Web App yang berakhir dengan `/exec`.

Jika deployment diperbarui, pastikan versi deployment yang digunakan memang berisi kode terbaru.

## 5. Hubungkan aplikasi ke Apps Script

Buka:

```text
js/config.js
```

Ubah:

```js
GAS_URL: ""
```

menjadi URL Web App:

```js
GAS_URL: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
```

Jangan menaruh URL ini di banyak file.

## 6. Cara sinkronisasi bekerja

Aplikasi tidak mengirim data setiap kali siswa menekan tombol.

Urutan yang digunakan:

1. perubahan progress disimpan ke `localStorage`
2. UI langsung diperbarui
3. perubahan penting diberi debounce
4. state dikirim ke Apps Script
5. Apps Script melakukan upsert ke Google Sheets

Jika internet atau Apps Script gagal, aplikasi tetap menyimpan state lokal dan menampilkan status sinkronisasi.

## 7. Upload ke GitHub

Buat repository, lalu unggah seluruh isi folder ini ke root repository.

Contoh:

```bash
git init
git add .
git commit -m "Initial Bilangan Rasional app"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## 8. Aktifkan GitHub Pages

1. Buka repository GitHub.
2. Masuk **Settings > Pages**.
3. Pada `Build and deployment`, pilih **Deploy from a branch**.
4. Pilih branch `main`.
5. Pilih folder `/ (root)`.
6. Simpan.
7. Buka URL GitHub Pages setelah deployment selesai.

## 9. Test koneksi Apps Script

Setelah `GAS_URL` diisi:

1. buka aplikasi
2. isi nama dan kelas
3. selesaikan satu aktivitas
4. buka menu Progress
5. tekan **Sinkronkan Sekarang**
6. periksa Google Sheets

Data siswa seharusnya masuk ke `Students` dan progress modul ke `Progress`.

Anda juga dapat membuka URL `/exec` langsung. Respons normal:

```json
{"success":true,"message":"Bilangan Rasional API aktif"}
```

## 10. Catatan penting tentang identitas siswa

Versi ini membuat `studentId` pada perangkat ketika profil pertama kali dibuat. Ini cukup untuk progress per perangkat, tetapi belum merupakan sistem login sekolah.

Jika siswa berpindah perangkat dan harus memperoleh progress yang sama, gunakan salah satu pendekatan berikut pada pengembangan lanjutan:

- kode siswa yang dibagikan guru
- nomor peserta internal
- autentikasi Google Workspace sekolah

Jangan memakai data pribadi sensitif sebagai ID.

## 11. Edit kelas

Daftar kelas berada di `js/app.js` pada bagian profil siswa. Ganti:

```js
["VII A","VII B","VII C","VII D","VII E","VII F","VII G"]
```

sesuai kelas sekolah.

## 12. Edit soal

Edit:

```text
data/questions.json
```

Pertahankan field:

```json
{
  "id": "q1",
  "category": "conversion",
  "type": "mc",
  "prompt": "...",
  "options": ["...", "..."],
  "answer": "...",
  "hint": "..."
}
```

Untuk pecahan visual gunakan:

```json
"fraction": {"n": 3, "d": 4}
```

agar UI dapat merender bentuk pecahan vertikal.

## 13. Reset progress

Menu Progress menyediakan tombol `Reset Progress`.

Reset menghapus data pada perangkat. Versi ini tidak otomatis menghapus data lama di Google Sheets.

## 14. Keamanan

Google Apps Script pada paket ini adalah backend sederhana untuk konteks pembelajaran, bukan sistem autentikasi bernilai tinggi. Jangan menyimpan password, token rahasia, nomor identitas pemerintah, atau data sensitif siswa di endpoint publik.

## 15. Pengembangan lanjutan yang paling berguna

- dashboard guru terpisah
- kode kelas dan kode siswa
- analytics kompetensi per topik
- lebih banyak variasi number line
- animasi pembagian bersusun untuk pecahan ke desimal
- mode guru untuk reset dan ekspor progress
