import { f } from "./fractions.js";

export const moduleInfo={
  concept:{title:"Kenali Bilangan Rasional",badge:"Penjelajah Rasional",icon:"🧭"},
  conversion:{title:"Pecahan dan Desimal",badge:"Ahli Konversi",icon:"🔄"},
  numberLine:{title:"Garis Bilangan",badge:"Navigator Angka",icon:"📍"},
  comparison:{title:"Bandingkan & Urutkan",badge:"Sang Pembanding",icon:"⚖️"}
};

export function conceptView(){
 return `
 <section class="lesson-layout fade-up">
   <div>
    <p class="eyebrow">MISI 1</p><h1>Kenali Bilangan Rasional</h1>
    <div class="card soft">
      <h2>Mulai dari situasi nyata</h2>
      <p>Pagi hari suhu sebuah daerah adalah <b>−2°C</b>. Siang hari menjadi <b>1,5°C</b>.</p>
      <p>Bilangan rasional dapat muncul sebagai bilangan bulat, pecahan, maupun desimal.</p>
    </div>
    <div class="card">
      <h2>Eksplorasi bentuk bilangan</h2>
      <p>Tekan kartu untuk melihat bentuk pecahannya.</p>
      <div class="option-grid" id="conceptCards">
        <button class="option" data-r="3">3</button>
        <button class="option" data-r="0.5">0,5</button>
        <button class="option" data-r="-1.25">−1,25</button>
        <button class="option" data-r="0.75">0,75</button>
      </div>
      <div id="conceptExplain" class="feedback"></div>
    </div>
    <div class="card">
      <h2>Kesimpulan</h2>
      <p>Bilangan rasional adalah bilangan yang dapat ditulis dalam bentuk ${f("a","b")} dengan <b>a</b> dan <b>b</b> bilangan bulat serta <b>b ≠ 0</b>.</p>
      <button class="btn btn-primary" data-complete="concept">Selesaikan Misi 1</button>
    </div>
   </div>
   <aside class="sticky-math"><div class="big-math">${f(3,4,"xl")}<br><small>= 0,75</small></div></aside>
 </section>`;
}

export function conversionView(){
 return `
 <section class="lesson-layout fade-up">
 <div>
   <p class="eyebrow">MISI 2</p><h1>Pecahan dan Desimal</h1>
   <div class="card">
    <h2>Dari ${f(3,4)} menjadi 0,75</h2>
    <div class="fraction-bar" aria-label="Tiga dari empat bagian">
      ${[1,2,3,4].map(i=>`<div class="fraction-piece ${i<=3?"filled":""}"></div>`).join("")}
    </div>
    <div class="conversion-stage" id="convStage">
      <div class="math-box">${f(3,4,"xl")}</div>
    </div>
    <button id="nextConv" class="btn btn-primary">Lihat Langkah Berikutnya</button>
    <button id="resetConv" class="btn btn-secondary">Putar Lagi</button>
   </div>
   <div class="card">
    <h2>Balik prosesnya: 0,6 → pecahan</h2>
    <div class="place-value">
      <div class="place-cell">Satuan<b>0</b></div><div class="place-cell">Persepuluhan<b>6</b></div>
    </div>
    <div class="conversion-stage">
      <div class="math-box">0,6</div><div class="arrow">↓</div>
      <div class="math-box">${f(6,10)}</div><div class="arrow">↓</div>
      <div class="math-box">${f(3,5)}</div>
    </div>
   </div>
   <div class="card">
    <h2>Coba sendiri</h2>
    <p>Bentuk desimal dari ${f(1,2)} adalah...</p>
    <div class="option-grid mini-check" data-answer="0,5">
      <button class="option">0,2</button><button class="option">0,5</button><button class="option">1,2</button>
    </div><div class="feedback"></div>
   </div>
   <button class="btn btn-primary" data-complete="conversion">Selesaikan Misi 2</button>
 </div>
 <aside class="sticky-math"><div class="big-math">${f(3,4,"xl")} → 0,75</div></aside>
 </section>`;
}

export function numberLineView(){
 const ticks=[-2,-1,0,1,2].map((v,i)=>`<div class="tick" style="left:${5+i*22.5}%"><label>${v}</label></div>`).join("");
 return `
 <section class="lesson-layout fade-up"><div>
  <p class="eyebrow">MISI 3</p><h1>Temukan Posisinya</h1>
  <div class="card">
   <h2>${f(1,2)} berada di mana?</h2>
   <p>Karena ${f(1,2)} = 0,5, posisinya berada di antara <b>0 dan 1</b>.</p>
   <div class="numberline-wrap"><div class="numberline"><div class="numberline-axis"></div>${ticks}<button class="marker" style="left:61.25%">½</button></div></div>
  </div>
  <div class="card">
   <h2>Parkirkan bilangan</h2>
   <p>Letakkan ${f(7,4)} pada interval yang benar.</p>
   <div class="option-grid mini-check" data-answer="1 dan 2">
     <button class="option">0 dan 1</button><button class="option">1 dan 2</button><button class="option">2 dan 3</button>
   </div><div class="feedback"></div>
   <div class="hint">Petunjuk: ${f(7,4)} = 1,75.</div>
  </div>
  <div class="card">
   <h2>Bilangan negatif</h2>
   <p>${f(-3,2)} = −1,5, sehingga letaknya di antara <b>−2 dan −1</b>.</p>
  </div>
  <button class="btn btn-primary" data-complete="numberLine">Selesaikan Misi 3</button>
 </div><aside class="sticky-math"><div class="big-math">${f(-3,2,"xl")}<br><small>= −1,5</small></div></aside></section>`;
}

export function comparisonView(){
 return `
 <section class="lesson-layout fade-up"><div>
  <p class="eyebrow">MISI 4</p><h1>Bandingkan & Urutkan</h1>
  <div class="card">
   <h2>Mana yang lebih besar?</h2>
   <p class="center" style="font-size:1.5rem">${f(3,4)} &nbsp; ? &nbsp; 0,8</p>
   <div class="choice-row mini-check center" data-answer="&lt;">
     <button class="option symbol-btn">&lt;</button><button class="option symbol-btn">&gt;</button><button class="option symbol-btn">=</button>
   </div><div class="feedback center"></div>
   <div class="hint">${f(3,4)} = 0,75, jadi 0,75 lebih kecil daripada 0,8.</div>
  </div>
  <div class="card">
    <h2>Urutkan dari kecil ke besar</h2>
    <p>Tekan kartu secara berurutan.</p>
    <div id="sortSource" class="sort-zone">
      <button class="sort-card" data-value=".75">0,75</button>
      <button class="sort-card" data-value=".25">${f(1,4)}</button>
      <button class="sort-card" data-value=".6">0,6</button>
      <button class="sort-card" data-value=".5">${f(1,2)}</button>
    </div>
    <p class="small">Urutan pilihanmu:</p><div id="sortTarget" class="sort-zone"></div>
    <div id="sortFeedback" class="feedback"></div>
    <button id="resetSort" class="btn btn-secondary">Ulangi Urutan</button>
  </div>
  <div class="card">
    <h2>Ingat bilangan negatif</h2><p>−0,4 lebih besar daripada −0,7 karena posisinya lebih kanan pada garis bilangan.</p>
  </div>
  <button class="btn btn-primary" data-complete="comparison">Selesaikan Misi 4</button>
 </div><aside class="sticky-math"><div class="big-math">0,75 &lt; 0,8</div></aside></section>`;
}
