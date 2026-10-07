# TROUBLESHOOTING GOOGLE APPS SCRIPT

## Gejala
Tombol **Sinkronkan Sekarang** menampilkan pesan untuk memeriksa GAS/URL, padahal URL sudah diisi.

## Penyebab yang paling umum
Google Apps Script Web App menggunakan redirect ke domain Google lain. Pada aplikasi yang berjalan dari GitHub Pages, browser dapat memblokir JavaScript saat mencoba membaca respons tersebut karena kebijakan lintas-origin (CORS).

Versi v3 menghindari masalah ini saat **menyimpan data** dengan `fetch(..., {mode:"no-cors"})`.

Artinya:
- aplikasi mengirim POST ke Apps Script;
- browser tidak mencoba membaca respons JSON;
- Apps Script tetap dapat menjalankan `doPost`;
- keberhasilan akhir diperiksa dari Google Sheets.

## Langkah wajib

### A. Pastikan sheet dibuat
Di Apps Script:
1. pilih fungsi `setupApp`
2. klik **Run**
3. berikan izin
4. refresh Google Sheet

Harus ada:
- Students
- Progress
- QuizResults
- ActivityLog

### B. Pastikan Web App aktif
Deploy > Manage deployments > Web app

Gunakan:
- Execute as: **Me**
- Who has access: pilih opsi yang memungkinkan pengguna aplikasi mengakses Web App sesuai jenis akun Anda.

Setelah perubahan kode:
- Edit deployment
- New version
- Deploy

### C. Pastikan URL benar
Di `js/config.js`, URL harus berakhir `/exec`.

Contoh:

```js
GAS_URL: "https://script.google.com/macros/s/AKfycbXXXXXXXXXXXX/exec"
```

Jangan gunakan:
- URL editor Apps Script
- URL Google Sheet
- URL yang berakhir `/dev`

### D. Tes endpoint langsung
Buka URL `/exec` di browser.

Harus muncul JSON dengan:

```json
{"success":true,"message":"Bilangan Rasional API aktif"}
```

Jika bukan JSON, perbaiki deployment lebih dulu.

### E. Tes penyimpanan
1. Buka aplikasi GitHub Pages.
2. Isi profil siswa.
3. Selesaikan satu aktivitas.
4. Tekan `Sinkronkan Sekarang`.
5. Tunggu beberapa detik lalu refresh Google Sheet.
6. Periksa:
   - Students
   - Progress
   - ActivityLog

Jika `ActivityLog` bertambah, POST dari GitHub Pages sudah sampai.

## Catatan
Pada mode `no-cors`, browser memang tidak dapat memastikan isi respons server. Karena itu pesan aplikasi menyatakan bahwa request telah dikirim, bukan menjamin data sudah tersimpan. Verifikasi akhir dilakukan di Google Sheets.
