# Bilangan Rasional Kelas VII - Versi Interaksi Baru

Paket ini adalah aplikasi web statis interaktif untuk materi Bilangan Rasional kelas VII. Siap di-host melalui GitHub Pages dan dapat mengirim progress ke Google Sheets melalui Google Apps Script.

## Fitur versi ini

- definisi bilangan rasional muncul sebagai teks animatif
- pecahan ditampilkan besar dan jelas dengan garis pecahan
- eksplorasi bilangan melalui kartu yang membuka layar/animasi baru
- konversi desimal, pecahan, dan persen dengan visual kotak
- pembedaan animasi penyebut 10 dan penyebut 100
- garis bilangan interaktif menggunakan slider
- evaluasi 10 soal acak dari 50 bank soal
- tipe soal: pilihan jawaban, benar-salah, dan memasangkan
- urutan soal acak setiap percobaan
- localStorage + sinkronisasi ke Apps Script

## Struktur

```text
index.html
css/style.css
js/config.js
js/storage.js
js/api.js
js/app.js
data/questions.json
gas/Code.gs
README.md
```

## Menjalankan lokal

Gunakan server lokal sederhana, misalnya:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Setup Google Sheets dan Apps Script

1. Buat Google Sheet baru.
2. Dari sheet tersebut buka **Extensions > Apps Script**.
3. Ganti isi script dengan file `gas/Code.gs`.
4. Jalankan fungsi `setupApp()` satu kali.
5. Berikan izin akses yang diminta.
6. Refresh Google Sheets.

Sheet yang akan dibuat otomatis:

- `Students`
- `Progress`
- `QuizResults`
- `ActivityLog`

## Deploy Apps Script

1. Klik **Deploy > New deployment**.
2. Pilih **Web app**.
3. `Execute as`: **Me**.
4. `Who has access`: sesuaikan agar aplikasi dapat mengakses endpoint.
5. Klik **Deploy**.
6. Salin URL yang berakhir dengan `/exec`.

## Hubungkan ke aplikasi

Buka `js/config.js`, lalu isi:

```js
GAS_URL: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
```

## Sinkronisasi

Aplikasi menyimpan progress lebih dulu di `localStorage`, lalu mengirim request ke Apps Script. Pada GitHub Pages, proses simpan memakai mode `no-cors`, jadi verifikasi akhirnya dilakukan dengan melihat data pada Google Sheets.

## Upload ke GitHub Pages

1. Upload seluruh isi folder ini ke repository GitHub.
2. Buka **Settings > Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`.
5. Simpan.

## Edit bank soal

Edit file `data/questions.json`. Versi ini berisi 50 soal.

## Catatan

- Untuk pecahan di teks soal, file JSON menggunakan token seperti `[[3/4]]`, lalu dirender sebagai pecahan vertikal oleh aplikasi.
- Untuk mengecek sinkronisasi, lihat sheet `ActivityLog` setelah menekan tombol **Sinkronkan Sekarang**.
