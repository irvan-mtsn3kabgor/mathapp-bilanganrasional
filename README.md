# Bilangan Rasional Kelas VII - v7

Perbaikan v7:

- Bilangan bulat langsung ke bentuk pecahan, tanpa pictorial.
- Pecahan biasa: fraction bar → perkalian 25/25 type-in → 75/100.
- Pecahan campuran memberi label “1 bagian penuh” pada bar penuh.
- Desimal berhenti: 0,6 → 6/10 karena satu angka di belakang koma → fraction bar → 3/5 → fraction bar senilai.
- Desimal berulang menggunakan animasi proses pembagian yang menghasilkan angka berulang, tanpa pictorial tambahan.
- Pecahan biasa ke desimal memakai kisi 100 kotak yang dibagi 4 blok 5×5 dan diwarnai kiri atas, kanan atas, lalu kiri bawah.
- Membandingkan dan mengurutkan memakai fraction bar vertikal interaktif yang mengisi dari bawah.
- Pengguna dapat mengubah pembilang dan penyebut.
- Tombol pecahan senilai menyamakan penyebut dua pecahan yang dibandingkan.
- Evaluasi tetap 10 soal acak dari 50 bank soal.

## Google Apps Script
Gunakan `gas/Code.gs` dan isi URL `/exec` pada `js/config.js` seperti versi sebelumnya.


## Perbaikan v8

- Tinggi fraction bar vertikal dihitung langsung dari nilai pembilang/penyebut, sehingga pecahan senilai seperti 2/5 dan 4/10 memiliki tinggi warna yang sama persis.
- Fraction bar kiri dan kanan menggunakan warna berbeda.
- Bentuk fraction bar tidak rounded.
- Label setiap bagian menyesuaikan ukuran layar desktop dan mobile.
