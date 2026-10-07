import { loadState, saveState, resetState, cloneState } from "./storage.js";
import { pushProgress, testConnection } from "./api.js";

let state = loadState();
let route = "home";
let quizSession = null;
let currentExplore = null;

const app = document.getElementById("app");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");

const moduleInfo = {
  concept:{title:"Kenali Bilangan Rasional", badge:"Penjelajah Rasional", icon:"🧭"},
  conversion:{title:"Pecahan, Desimal, dan Persen", badge:"Ahli Konversi", icon:"🔄"},
  numberline:{title:"Garis Bilangan Interaktif", badge:"Navigator Angka", icon:"📍"},
  comparison:{title:"Membandingkan & Mengurutkan", badge:"Sang Pembanding", icon:"⚖️"}
};
const moduleOrder = Object.keys(moduleInfo);

const exploreMap = {
  integer3:{title:"Mengubah bilangan bulat 3 menjadi bilangan rasional", stages:[
    {kind:"html", html:`<p class="center">Bilangan <b>3</b> adalah bilangan bulat.</p><div class="math-stage"><div class="math-box" style="font-size:2.4rem"><b>3</b></div></div>`},
    {kind:"html", html:`<p class="center">Setiap bilangan bulat dapat ditulis sebagai pecahan dengan penyebut 1.</p><div class="math-stage"><div class="math-box">${fraction(3,1,'huge')}</div></div>`},
    {kind:"html", html:`<div class="math-stage"><div class="math-box">3 = ${fraction(3,1,'huge')}</div><div class="hint">Karena dapat ditulis dalam bentuk a/b dengan b ≠ 0, maka 3 adalah bilangan rasional.</div></div>`}
  ]},
  decimal05:{title:"Dari 0,5 menjadi pecahan rasional", stages:[
    {kind:"html", html:`<p>Bilangan <b>0,5</b> dibaca <b>lima per sepuluh</b>.</p><div class="math-stage"><div class="math-box" style="font-size:2.2rem"><b>0,5</b></div></div>`},
    {kind:"grid10", count:5, label:`0,5 berarti 5 bagian dari 10 bagian yang sama besar.`, after:`${fraction(5,10,'big')}`},
    {kind:"html", html:`<p class="center">Pecahan tersebut dapat disederhanakan.</p><div class="math-stage"><div class="math-box">${fraction(5,10,'big')}</div><div class="arrow">↓</div><div class="math-box">${fraction(1,2,'big')}</div></div><div class="hint">Jadi 0,5 adalah bilangan rasional karena sama dengan ${fraction(1,2)}.</div>`}
  ]},
  decimal025:{title:"Dari 0,25 menjadi pecahan rasional", stages:[
    {kind:"html", html:`<p>Bilangan <b>0,25</b> memiliki dua angka di belakang koma, sehingga mudah ditulis sebagai <b>dua puluh lima per seratus</b>.</p><div class="math-stage"><div class="math-box" style="font-size:2.2rem"><b>0,25</b></div></div>`},
    {kind:"grid100", count:25, label:`0,25 = 25/100. Lihat 100 kotak berikut, 25 kotak berwarna.`, after:`${fraction(25,100,'big')}`},
    {kind:"html", html:`<p class="center">Sederhanakan dengan membagi pembilang dan penyebut dengan 25.</p><div class="math-stage"><div class="math-box">${fraction(25,100,'big')}</div><div class="arrow">↓</div><div class="math-box">${fraction(1,4,'big')}</div></div>`}
  ]},
  percent75:{title:"Dari 75% menjadi pecahan dan desimal", stages:[
    {kind:"html", html:`<p>Persen berarti <b>per seratus</b>.</p><div class="math-stage"><div class="math-box" style="font-size:2.2rem"><b>75%</b></div><div class="arrow">↓</div><div class="math-box">${fraction(75,100,'big')}</div></div>`},
    {kind:"grid100", count:75, label:`75% berarti 75 dari 100 kotak diwarnai.`, after:`${fraction(75,100,'big')}`},
    {kind:"html", html:`<div class="math-stage"><div class="math-box">${fraction(75,100,'big')}</div><div class="arrow">↓</div><div class="math-box">${fraction(3,4,'big')}</div><div class="arrow">↓</div><div class="math-box" style="font-size:2rem"><b>0,75</b></div></div><div class="hint">75% = ${fraction(75,100)} = ${fraction(3,4)} = 0,75.</div>`}
  ]},
  fraction34:{title:"Dari pecahan biasa [[3/4]] ke desimal", stages:[
    {kind:"html", html:`<p>Kita mulai dari pecahan biasa.</p><div class="math-stage"><div class="math-box">${fraction(3,4,'huge')}</div></div>`},
    {kind:"html", html:`<p>Agar mudah diubah ke desimal, ubah menjadi pecahan senilai berpenyebut 100.</p><div class="math-stage"><div class="math-box">${fraction(3,4,'big')}</div><div class="arrow">×25/×25</div><div class="math-box">${fraction(75,100,'big')}</div></div>`},
    {kind:"grid100", count:75, label:`Pecahan ${fraction(75,100)} berarti 75 dari 100 kotak berwarna.`, after:`<b style="font-size:2rem">0,75</b>`}
  ]},
  negative125:{title:"Dari −1,25 menjadi bilangan rasional", stages:[
    {kind:"html", html:`<p>Bilangan <b>−1,25</b> memiliki dua angka di belakang koma.</p><div class="math-stage"><div class="math-box" style="font-size:2.2rem"><b>−1,25</b></div></div>`},
    {kind:"html", html:`<p>Tulis dahulu sebagai pecahan berpenyebut 100.</p><div class="math-stage"><div class="math-box">${fraction(-125,100,'big')}</div><div class="arrow">↓</div><div class="math-box">${fraction(-5,4,'big')}</div></div>`},
    {kind:"html", html:`<div class="hint">Karena dapat ditulis sebagai ${fraction(-5,4)}, maka −1,25 adalah bilangan rasional.</div>`}
  ]}
};

function fraction(n,d,size=''){
  return `<span class="fraction ${size}"><span class="numerator">${n}</span><span class="fraction-line"></span><span class="denominator">${d}</span></span>`;
}
function fmtText(text=''){
  return String(text).replace(/\[\[(-?\d+)\/(\d+)\]\]/g, (_,n,d)=>fraction(n,d,'')).replace(/\n/g,'<br>');
}
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>el.classList.remove('show'),2200);
}
function burstConfetti(){
  const layer = document.getElementById('confetti');
  for(let i=0;i<26;i++){
    const x = document.createElement('i'); x.className='confetti-piece';
    x.style.left = `${Math.random()*100}%`; x.style.animationDelay = `${Math.random()*.3}s`;
    layer.appendChild(x); setTimeout(()=>x.remove(),1800);
  }
}
function totalProgress(){ return Math.round(moduleOrder.reduce((s,k)=>s+(state.modules[k]||0),0)/moduleOrder.length); }
function unlocked(key){ const i=moduleOrder.indexOf(key); return i===0 || (state.modules[moduleOrder[i-1]]||0)>=100; }
function addXP(n){ state.xp = Math.max(0,(state.xp||0)+n); }
function persist(sync=true){ saveState(state); updateChrome(); if(sync) scheduleSync(); }
let syncTimer=null;
function scheduleSync(){ state.sync.pending=true; saveState(state); clearTimeout(syncTimer); syncTimer=setTimeout(doSync,900); }
async function doSync(){ const r = await pushProgress(state); if(r?.success){ state.sync.pending=false; state.sync.lastSyncedAt=new Date().toISOString(); saveState(state); updateSyncText(); } }
function updateChrome(){ document.getElementById('globalProgressBar').style.width=`${totalProgress()}%`; document.getElementById('globalProgressText').textContent=`${totalProgress()}%`; document.getElementById('xpValue').textContent = state.xp||0; document.getElementById('soundBtn').textContent = state.settings.sound?'🔊':'🔇'; }
function updateSyncText(){ document.querySelectorAll('[data-sync]').forEach(el=>{ el.textContent = state.sync.pending?'Menunggu sinkronisasi':'Tersimpan'; }); }
function render(){ updateChrome();
  if(!state.student.id){ app.innerHTML = profileView(); bindProfile(); return; }
  if(route==='home') app.innerHTML = homeView();
  else if(route==='learn') app.innerHTML = learnView();
  else if(route==='progress') app.innerHTML = progressView();
  else if(route==='quiz') app.innerHTML = quizHomeView();
  else if(route in moduleInfo) app.innerHTML = moduleView(route);
  else app.innerHTML = homeView();
  bindCommon();
}
function profileView(){
  return `<section class="card" style="max-width:620px;margin:50px auto">
    <p class="eyebrow">PROFIL SISWA</p><h1>Siapa yang belajar hari ini?</h1>
    <p class="lead">Masukkan nama dan kelas. Progress akan disimpan di perangkat dan dapat dikirim ke Google Sheets melalui Apps Script.</p>
    <form id="studentForm">
      <label>Nama</label><input id="studentName" required maxlength="50" placeholder="Masukkan nama siswa">
      <label>Kelas</label><select id="studentClass">${['VII A','VII B','VII C','VII D','VII E','VII F','VII G'].map(x=>`<option>${x}</option>`).join('')}</select>
      <div class="actions"><button class="btn btn-primary">Mulai Belajar</button></div>
    </form>
  </section>`;
}
function bindProfile(){
  const form=document.getElementById('studentForm');
  form.onsubmit=(e)=>{ e.preventDefault(); const name=document.getElementById('studentName').value.trim(); const className=document.getElementById('studentClass').value; state.student={id:`${name.toLowerCase().replace(/\W+/g,'-')}-${className.replace(/\s+/g,'').toLowerCase()}-${Date.now().toString(36)}`,name,className,createdAt:new Date().toISOString()}; persist(); route='home'; render(); };
}
function homeView(){
  return `<section class="hero">
    <div>
      <p class="eyebrow">RATIONAL QUEST</p>
      <h1>Petualangan Bilangan Rasional</h1>
      <p class="lead">Belajar mengenali bilangan rasional, mengubah pecahan, desimal, dan persen, menemukan letak bilangan pada garis bilangan, lalu membandingkan nilainya melalui aktivitas interaktif.</p>
      <div class="actions"><button class="btn btn-primary" data-route="learn">Mulai / Lanjutkan</button><button class="btn btn-secondary" data-route="progress">Lihat Progress</button></div>
      <p class="small" data-sync>${state.sync.pending?'Menunggu sinkronisasi':'Tersimpan'}</p>
    </div>
    <div class="hero-art">
      <div class="floating-card">${fraction(3,4,'big')}</div>
      <div class="floating-card"><b>0,75</b></div>
      <div class="floating-card"><b>75%</b></div>
    </div>
  </section>
  <h2 class="section-title">Peta Perjalanan</h2>
  <section class="grid grid-2">${moduleOrder.map((k,i)=>moduleCard(k,i)).join('')}</section>`;
}
function moduleCard(key,index){ const p=state.modules[key]||0; const lock=!unlocked(key); const info=moduleInfo[key]; return `<article class="card module-card ${lock?'locked':''}"><p class="pill">MISI ${index+1}</p><h3>${info.icon} ${info.title}</h3><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div><span class="status">${p>=100?'Selesai ✓':lock?'Terkunci':p>0?`${p}%`:'Siap dimulai'}</span><div class="actions"><button class="btn btn-secondary" data-module="${key}" ${lock?'disabled':''}>${p>0?'Buka Lagi':'Mulai'}</button></div></article>`; }
function learnView(){ const next = moduleOrder.find(k=>unlocked(k)&&(state.modules[k]||0)<100) || 'comparison'; return `<section><p class="eyebrow">BELAJAR</p><h1>Pilih misi</h1><div class="stepper">${moduleOrder.map((k,i)=>`<div class="step ${(state.modules[k]||0)>=100?'done':k===next?'active':''}">${i+1}. ${moduleInfo[k].title}</div>`).join('')}</div><div class="grid grid-2" style="margin-top:16px">${moduleOrder.map((k,i)=>moduleCard(k,i)).join('')}</div></section>`; }
function progressView(){ return `<section><p class="eyebrow">PROGRESS</p><h1>Progress Belajar</h1><div class="card"><div class="progress-list">${moduleOrder.map(k=>`<div class="progress-row"><b>${moduleInfo[k].title}</b><div class="progress-track"><div class="progress-fill" style="width:${state.modules[k]||0}%"></div></div><span>${state.modules[k]||0}%</span></div>`).join('')}</div></div><div class="grid grid-2" style="margin-top:16px"><div class="card"><h2>⭐ ${state.xp} XP</h2><p>Nilai terbaik: <b>${state.quiz.bestScore||0}/100</b></p><p>Upaya evaluasi: ${state.quiz.attempts||0}</p></div><div class="card"><h2>Badge</h2>${state.badges.length?state.badges.map(x=>`<div class="badge-item">🏅 <b>${x}</b></div>`).join(''):'<p>Belum ada badge.</p>'}</div></div><div class="card" style="margin-top:16px"><h2>Koneksi Apps Script</h2><p class="small" data-sync>${state.sync.pending?'Menunggu sinkronisasi':'Tersimpan'}</p><div id="connectionResult" class="feedback"></div><div class="actions"><button id="testConnection" class="btn btn-secondary">Tes Koneksi</button><button id="syncNow" class="btn btn-secondary">Sinkronkan Sekarang</button><button id="resetProgressBtn" class="btn btn-secondary">Reset Progress</button></div></div></section>`; }
function moduleView(key){ if(key==='concept') return conceptModule(); if(key==='conversion') return conversionModule(); if(key==='numberline') return numberlineModule(); if(key==='comparison') return comparisonModule(); return ''; }
function conceptModule(){ return `<section class="lesson-layout"><div><p class="eyebrow">MISI 1</p><h1>Kenali Bilangan Rasional</h1><div class="definition-box"><div class="reveal-line" style="--d:1"><b>Pengertian bilangan rasional</b></div><div class="reveal-line" style="--d:2">Bilangan rasional adalah bilangan yang dapat ditulis dalam bentuk ${fraction('a','b','big')}.</div><div class="reveal-line" style="--d:3">Bilangan <b>a</b> dan <b>b</b> adalah bilangan bulat.</div><div class="reveal-line" style="--d:4">Penyebut <b>b</b> tidak boleh sama dengan 0.</div><div class="reveal-line" style="--d:5">Contohnya: ${fraction(3,4,'big')}, ${fraction(-5,4,'big')}, 0,5, 75%, dan 3.</div></div><div class="card" style="margin-top:16px"><h2>Eksplorasi bentuk bilangan</h2><p>Tekan kartu untuk melihat perubahan bilangan tersebut menjadi bentuk bilangan rasional.</p><div class="explore-cards"><button class="explore-btn" data-explore="integer3">Bilangan bulat<br><b style="font-size:2rem">3</b></button><button class="explore-btn" data-explore="decimal05">Desimal<br><b style="font-size:2rem">0,5</b></button><button class="explore-btn" data-explore="decimal025">Desimal<br><b style="font-size:2rem">0,25</b></button><button class="explore-btn" data-explore="percent75">Persen<br><b style="font-size:2rem">75%</b></button><button class="explore-btn" data-explore="fraction34">Pecahan biasa<br>${fraction(3,4,'big')}</button><button class="explore-btn" data-explore="negative125">Desimal negatif<br><b style="font-size:2rem">−1,25</b></button></div><div id="exploreProgress" class="feedback"></div></div><div class="card"><h2>Latihan cepat</h2><p>Manakah yang termasuk bilangan rasional?</p><div class="option-grid quick-check" data-answer="0,75"><button class="option">π</button><button class="option">0,75</button><button class="option">√2</button><button class="option">Tidak ada</button></div><div class="feedback"></div></div><div class="actions"><button class="btn btn-primary" id="completeConcept">Selesaikan Misi 1</button></div></div><aside class="sticky-panel"><div class="big-math">${fraction(3,4,'huge')}<br><small>= 0,75 = 75%</small></div></aside></section>`; }
function conversionModule(){ return `<section class="lesson-layout"><div><p class="eyebrow">MISI 2</p><h1>Pecahan, Desimal, dan Persen</h1><div class="card"><h2>Pecahan dengan penyebut 10</h2><p>Untuk satu angka di belakang koma, gunakan penyebut <b>10</b>.</p><div class="math-stage"><div class="math-box" style="font-size:2rem">0,6</div><div class="arrow">↓</div><div class="math-box">${fraction(6,10,'big')}</div><div class="arrow">↓</div><div class="math-box">${fraction(3,5,'big')}</div></div><div class="grid-wrap"><div class="bar10" id="demoBar10">${Array.from({length:10},()=>'<div class="cell10"></div>').join('')}</div><button id="animateBar10" class="btn btn-secondary">Animasi 6 dari 10 kotak</button></div></div><div class="card"><h2>Pecahan dengan penyebut 100</h2><p>Untuk dua angka di belakang koma, gunakan penyebut <b>100</b>.</p><div class="math-stage"><div class="math-box" style="font-size:2rem">0,35</div><div class="arrow">↓</div><div class="math-box">${fraction(35,100,'big')}</div><div class="arrow">↓</div><div class="math-box">35%</div></div><div class="grid-wrap"><div class="grid100" id="demoGrid100">${Array.from({length:100},()=>'<div class="cell100"></div>').join('')}</div><button id="animateGrid100" class="btn btn-secondary">Animasi 35 dari 100 kotak</button></div></div><div class="card"><h2>Latihan cepat</h2><p>0,25 sama dengan ...</p><div class="option-grid quick-check" data-answer="1/4"><button class="option" data-key="1/4">${fraction(1,4,'big')}</button><button class="option" data-key="2/5">${fraction(2,5,'big')}</button><button class="option" data-key="1/2">${fraction(1,2,'big')}</button><button class="option" data-key="25/10">${fraction(25,10,'big')}</button></div><div class="feedback"></div></div><div class="actions"><button class="btn btn-primary" id="completeConversion">Selesaikan Misi 2</button></div></div><aside class="sticky-panel"><div class="big-math">0,6 → ${fraction(6,10)} → ${fraction(3,5)}</div></aside></section>`; }
function numberlineModule(){ return `<section class="lesson-layout"><div><p class="eyebrow">MISI 3</p><h1>Garis Bilangan Interaktif</h1><div class="card"><h2>Geser slider untuk menempatkan bilangan</h2><p>Pilih target, lalu geser slider. Ketika sudah merasa tepat, tekan <b>Periksa</b>.</p><div class="actions"><select id="targetSelect"><option value="0.5">${fraction(1,2)}</option><option value="0.75">${fraction(3,4)}</option><option value="-1.5">${fraction(-3,2)}</option><option value="1.4">1,4</option></select><span class="target-chip">Target: <span id="targetLabel">${fraction(1,2)}</span></span></div><div class="slider-card" style="margin-top:16px"><div class="numberline-wrap"><div class="numberline"><div class="axis"></div>${numberlineTicks()}<button id="markerBtn" class="marker" style="left:${posFromValue(0)}%">0</button></div></div><div class="range-row"><input id="numberSlider" type="range" min="-200" max="200" step="1" value="0"><b id="sliderValue">0,0</b></div><div class="actions"><button id="checkSlider" class="btn btn-primary">Periksa Posisi</button><button id="nextTarget" class="btn btn-secondary">Target Lain</button></div><div id="sliderFeedback" class="feedback"></div><div class="hint">Slider mewakili nilai dari −2 sampai 2. Geser ke kiri atau kanan untuk memindahkan penanda.</div></div></div><div class="actions"><button class="btn btn-primary" id="completeNumberline">Selesaikan Misi 3</button></div></div><aside class="sticky-panel"><div class="big-math">Gunakan slider untuk menempatkan bilangan rasional pada garis bilangan.</div></aside></section>`; }
function numberlineTicks(){ let html=''; for(let i=-2;i<=2;i+=0.5){ const val=Math.round(i*10)/10; const left = posFromValue(val); html += `<div class="tick" style="left:${left}%"><span>${String(val).replace('.',',')}</span></div>`; } return html; }
function posFromValue(value){ return 4 + ((Number(value)+2)/4)*92; }
function comparisonModule(){ return `<section class="lesson-layout"><div><p class="eyebrow">MISI 4</p><h1>Membandingkan & Mengurutkan</h1><div class="card"><h2>Bandingkan nilainya</h2><p class="center" style="font-size:1.5rem">${fraction(3,4,'big')} &nbsp; ? &nbsp; 0,8</p><div class="option-grid quick-check" data-answer="<" data-type="symbol"><button class="option">&lt;</button><button class="option">&gt;</button><button class="option">=</button><button class="option">Tidak tahu</button></div><div class="feedback"></div><div class="hint">Ubah ${fraction(3,4)} menjadi desimal: 0,75. Jadi 0,75 lebih kecil daripada 0,8.</div></div><div class="card"><h2>Urutkan dari kecil ke besar</h2><p>Pilih urutan kartu berikut.</p><div class="option-grid" id="orderButtons"><button class="option order-item" data-value="0.75">0,75</button><button class="option order-item" data-value="0.25">${fraction(1,4,'big')}</button><button class="option order-item" data-value="0.6">0,6</button><button class="option order-item" data-value="0.5">${fraction(1,2,'big')}</button></div><p class="small">Urutan pilihanmu:</p><div id="orderChosen" class="card soft"></div><div id="orderFeedback" class="feedback"></div><div class="actions"><button id="resetOrder" class="btn btn-secondary">Ulangi Urutan</button></div></div><div class="actions"><button class="btn btn-primary" id="completeComparison">Selesaikan Misi 4</button></div></div><aside class="sticky-panel"><div class="big-math">−0,4 &gt; −0,7<br><small>Karena −0,4 lebih kanan pada garis bilangan.</small></div></aside></section>`; }
function quizHomeView(){ return `<section><p class="eyebrow">EVALUASI</p><h1>Uji Pemahaman</h1><div class="card"><p>Akan ditampilkan <b>10 soal acak</b> dari <b>50 bank soal</b>. Bentuk soal berupa pilihan jawaban, benar-salah, dan memasangkan. Urutan soal akan diacak pada setiap percobaan.</p><div class="actions"><button id="startQuiz" class="btn btn-primary">Mulai Evaluasi</button></div></div></section>`; }

function bindCommon(){
  document.querySelectorAll('[data-route]').forEach(btn=>btn.onclick=()=>{ route=btn.dataset.route; render(); });
  document.querySelectorAll('[data-module]').forEach(btn=>btn.onclick=()=>{ route=btn.dataset.module; state.modules[route]=Math.max(state.modules[route],10); persist(false); render(); });
  document.querySelectorAll('[data-close-modal]').forEach(btn=>btn.onclick=closeModal);
  if(route==='concept') bindConcept();
  if(route==='conversion') bindConversion();
  if(route==='numberline') bindNumberline();
  if(route==='comparison') bindComparison();
  if(route==='progress') bindProgress();
  if(route==='quiz') bindQuizHome();
  bindQuickChecks();
}
function bindConcept(){
  let seen = new Set(state.__seenExplore||[]);
  document.querySelectorAll('[data-explore]').forEach(btn=>btn.onclick=()=>{
    openExplore(btn.dataset.explore);
    seen.add(btn.dataset.explore); state.__seenExplore=[...seen]; state.modules.concept=Math.max(state.modules.concept, Math.min(85, 20 + seen.size*10)); addXP(3); persist(false);
    document.getElementById('exploreProgress').textContent = `${seen.size} dari 6 eksplorasi sudah dibuka.`;
  });
  const complete=document.getElementById('completeConcept'); if(complete) complete.onclick=()=>completeModule('concept');
  const info=document.getElementById('exploreProgress'); if(info && seen.size) info.textContent=`${seen.size} dari 6 eksplorasi sudah dibuka.`;
}
function bindConversion(){
  document.getElementById('animateBar10').onclick=()=>{ animateFill(document.querySelectorAll('#demoBar10 .cell10'),6); state.modules.conversion=Math.max(state.modules.conversion,45); addXP(5); persist(false); };
  document.getElementById('animateGrid100').onclick=()=>{ animateFill(document.querySelectorAll('#demoGrid100 .cell100'),35); state.modules.conversion=Math.max(state.modules.conversion,75); addXP(5); persist(false); };
  document.getElementById('completeConversion').onclick=()=>completeModule('conversion');
}
function animateFill(cells,count){ cells.forEach(c=>c.classList.remove('filled')); let i=0; const timer=setInterval(()=>{ if(i>=count){ clearInterval(timer); return; } cells[i].classList.add('filled'); i++; }, 20); }
function bindNumberline(){
  const slider=document.getElementById('numberSlider'), marker=document.getElementById('markerBtn'), valueEl=document.getElementById('sliderValue'), targetSelect=document.getElementById('targetSelect'), targetLabel=document.getElementById('targetLabel'), feedback=document.getElementById('sliderFeedback');
  const setMarker=()=>{ const v=Number(slider.value)/100; valueEl.textContent=String(v.toFixed(2)).replace('.',','); marker.style.left=`${posFromValue(v)}%`; marker.textContent=String(v.toFixed(1)).replace('.',','); };
  slider.oninput=setMarker; setMarker();
  targetSelect.onchange=()=>{ targetLabel.innerHTML = targetSelect.options[targetSelect.selectedIndex].textContent; feedback.textContent=''; };
  document.getElementById('checkSlider').onclick=()=>{ const current=Number(slider.value)/100, target=Number(targetSelect.value); const ok=Math.abs(current-target)<=0.08; feedback.textContent = ok?'✓ Tepat atau sangat dekat!':'Belum tepat. Geser lagi mendekati target.'; feedback.className=`feedback ${ok?'good':'bad'}`; if(ok){ addXP(12); state.modules.numberline=Math.max(state.modules.numberline,85); persist(false); marker.classList.add('pulse'); setTimeout(()=>marker.classList.remove('pulse'),500); } };
  document.getElementById('nextTarget').onclick=()=>{ const options=[...targetSelect.options]; let idx=Math.floor(Math.random()*options.length); targetSelect.selectedIndex=idx; targetSelect.onchange(); };
  document.getElementById('completeNumberline').onclick=()=>completeModule('numberline');
}
function bindComparison(){
  const chosen=[]; const chosenEl=document.getElementById('orderChosen'); const feedback=document.getElementById('orderFeedback');
  const original=[...document.querySelectorAll('.order-item')].map(x=>x.outerHTML).join('');
  const checkOrder=()=>{ if(chosen.length===4){ const values=chosen.map(x=>Number(x.dataset.value)); const ok=values.every((v,i)=>i===0||values[i-1]<=v); feedback.textContent=ok?'✓ Urutan benar: 1/4, 1/2, 0,6, 0,75':'Urutannya belum benar.'; feedback.className=`feedback ${ok?'good':'bad'}`; if(ok){ addXP(15); state.modules.comparison=Math.max(state.modules.comparison,85); persist(false); } } };
  document.querySelectorAll('.order-item').forEach(btn=>btn.onclick=()=>{ if(btn.disabled) return; btn.disabled=true; btn.style.opacity='.45'; chosen.push(btn.cloneNode(true)); chosenEl.append(...[chosen[chosen.length-1]]); checkOrder(); });
  document.getElementById('resetOrder').onclick=()=>{ document.getElementById('orderButtons').innerHTML=original; chosenEl.innerHTML=''; feedback.textContent=''; bindComparison(); };
  document.getElementById('completeComparison').onclick=()=>completeModule('comparison');
}
function bindProgress(){
  document.getElementById('testConnection').onclick=async()=>{ const out=document.getElementById('connectionResult'); out.textContent='Menguji koneksi...'; const r=await testConnection(); out.textContent = r.success?`✓ Terhubung${r.spreadsheetName?` • ${r.spreadsheetName}`:''}`:`Gagal: ${r.message}`; out.className=`feedback ${r.success?'good':'bad'}`; };
  document.getElementById('syncNow').onclick=async()=>{ toast('Mengirim request sinkronisasi...'); const r=await pushProgress(state); if(r.success){ state.sync.pending=false; state.sync.lastSyncedAt=new Date().toISOString(); saveState(state); updateSyncText(); toast('Request sinkronisasi telah dikirim. Cek Google Sheets.'); } else { toast('Gagal mengirim request sinkronisasi.'); } };
  document.getElementById('resetProgressBtn').onclick=()=>{ if(confirm('Semua progress pada perangkat ini akan dihapus. Lanjutkan?')){ resetState(); state=cloneState(); route='home'; render(); } };
}
function bindQuickChecks(){
  document.querySelectorAll('.quick-check').forEach(group=>{
    const answer = group.dataset.answer;
    const feedback = group.nextElementSibling;
    group.querySelectorAll('.option').forEach(btn=>btn.onclick=()=>{
      if(group.dataset.done) return;
      group.dataset.done='1';
      group.querySelectorAll('.option').forEach(x=>x.disabled=true);
      const raw = btn.dataset.key || btn.dataset.value || btn.innerHTML || btn.textContent;
      const normalized = raw.replace(/\s+/g,' ').trim();
      const expected = answer.replace(/\s+/g,' ').trim();
      const ok = normalized === expected || btn.textContent.trim()===expected;
      btn.classList.add(ok?'correct':'wrong');
      feedback.textContent = ok?'✓ Benar!':'Belum tepat.'; feedback.className=`feedback ${ok?'good':'bad'}`;
      if(ok){ addXP(10); persist(false); }
    });
  });
}
function completeModule(key){ if((state.modules[key]||0)<100){ addXP(50); if(!state.badges.includes(moduleInfo[key].badge)) state.badges.push(moduleInfo[key].badge); } state.modules[key]=100; persist(); burstConfetti(); toast(`${moduleInfo[key].badge} diperoleh!`); route='learn'; render(); }

function openExplore(id){
  currentExplore={id,step:0};
  renderExploreModal();
  modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
}
function closeModal(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); modalBody.innerHTML=''; }
function renderExploreModal(){
  const item = exploreMap[currentExplore.id]; const stage = item.stages[currentExplore.step];
  modalTitle.textContent = item.title;
  let content = '';
  if(stage.kind==='html') content = stage.html;
  else if(stage.kind==='grid10') content = `<div class="grid-wrap"><p class="center">${stage.label}</p><div class="bar10" id="modalAnimArea">${Array.from({length:10},()=>'<div class="cell10"></div>').join('')}</div><div class="math-box">${stage.after}</div></div>`;
  else if(stage.kind==='grid100') content = `<div class="grid-wrap"><p class="center">${stage.label}</p><div class="grid100" id="modalAnimArea">${Array.from({length:100},()=>'<div class="cell100"></div>').join('')}</div><div class="math-box">${stage.after}</div></div>`;
  modalBody.innerHTML = `<div class="fade-in">${content}</div><div class="actions"><button class="btn btn-secondary" id="prevExplore" ${currentExplore.step===0?'disabled':''}>Sebelumnya</button><button class="btn btn-primary" id="nextExplore">${currentExplore.step===item.stages.length-1?'Selesai':'Langkah Berikutnya'}</button></div>`;
  document.getElementById('prevExplore').onclick=()=>{ currentExplore.step=Math.max(0,currentExplore.step-1); renderExploreModal(); };
  document.getElementById('nextExplore').onclick=()=>{ if(currentExplore.step===item.stages.length-1){ closeModal(); return; } currentExplore.step++; renderExploreModal(); };
  if(stage.kind==='grid10') animateFill(modalBody.querySelectorAll('#modalAnimArea .cell10'), stage.count);
  if(stage.kind==='grid100') animateFill(modalBody.querySelectorAll('#modalAnimArea .cell100'), stage.count);
}

async function getBankQuestions(){ const res=await fetch('data/questions.json'); return await res.json(); }
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function prepareQuiz(bank){
  const categories=['concept','conversion','numberline','comparison','matching'];
  let selected=[];
  categories.forEach(c=>{ selected.push(...shuffle(bank.filter(q=>q.category===c)).slice(0,2)); });
  return shuffle(selected).map(q=>{
    const copy=JSON.parse(JSON.stringify(q));
    if(copy.options) copy.options=shuffle(copy.options);
    if(copy.pairs){ copy.options=shuffle(copy.pairs.map(p=>p.right)); }
    return copy;
  });
}
function bindQuizHome(){ const btn=document.getElementById('startQuiz'); if(btn) btn.onclick=startQuiz; }
async function startQuiz(){ const bank=await getBankQuestions(); quizSession={questions:prepareQuiz(bank), index:0, score:0}; renderQuizQuestion(); }
function renderQuizQuestion(){ const q=quizSession.questions[quizSession.index]; const progress=((quizSession.index)/quizSession.questions.length)*100; app.innerHTML=`<section><p class="eyebrow">EVALUASI</p><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="card" style="margin-top:16px"><div class="quiz-head"><b>Soal ${quizSession.index+1} dari ${quizSession.questions.length}</b><span class="small">Tipe: ${labelType(q.type)}</span></div><h2>${fmtText(q.prompt)}</h2><div id="quizBody">${renderQuestionBody(q)}</div><div id="quizFeedback" class="feedback"></div><div id="quizHint" class="hint" style="display:none">${fmtText(q.hint||'')}</div><div class="actions"><button id="showHintBtn" class="btn btn-secondary">Petunjuk</button><button id="nextQuestionBtn" class="btn btn-primary" disabled>Lanjut</button></div></div></section>`; bindQuestion(q); }
function labelType(t){ return t==='mcq'?'Pilih jawaban':t==='tf'?'Benar / Salah':'Memasangkan'; }
function renderQuestionBody(q){
  if(q.type==='mcq') return `<div class="option-grid">${q.options.map(o=>`<button class="option q-option" data-value="${escapeHtml(o)}">${fmtText(o)}</button>`).join('')}</div>`;
  if(q.type==='tf') return `<div class="option-grid"><button class="option tf-btn" data-value="true">Benar</button><button class="option tf-btn" data-value="false">Salah</button></div>`;
  if(q.type==='match') return `<div class="match-grid">${q.pairs.map((p,i)=>`<div class="match-row"><div class="match-left">${fmtText(p.left)}</div><select class="match-select" data-answer="${escapeHtml(p.right)}"><option value="">Pilih pasangan...</option>${q.options.map(o=>`<option value="${escapeHtml(o)}">${textOnly(o)}</option>`).join('')}</select></div>`).join('')}</div><div class="actions"><button id="checkMatchBtn" class="btn btn-primary">Periksa Pasangan</button></div>`;
  return '';
}
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function textOnly(s){ const div=document.createElement('div'); div.innerHTML=fmtText(s); return div.textContent; }
function bindQuestion(q){
  document.getElementById('showHintBtn').onclick=()=>{ document.getElementById('quizHint').style.display='block'; };
  const nextBtn=document.getElementById('nextQuestionBtn');
  if(q.type==='mcq') document.querySelectorAll('.q-option').forEach(btn=>btn.onclick=()=>{ if(nextBtn.disabled===false) return; const ok=(btn.dataset.value===q.answer); document.querySelectorAll('.q-option').forEach(b=>{ b.disabled=true; if(b.dataset.value===q.answer) b.classList.add('correct'); }); if(!ok) btn.classList.add('wrong'); showQuestionResult(ok, q.answer); nextBtn.disabled=false; });
  if(q.type==='tf') document.querySelectorAll('.tf-btn').forEach(btn=>btn.onclick=()=>{ if(nextBtn.disabled===false) return; const ok=(btn.dataset.value===String(q.answer)); document.querySelectorAll('.tf-btn').forEach(b=>b.disabled=true); btn.classList.add(ok?'correct':'wrong'); showQuestionResult(ok, q.answer?'Benar':'Salah'); nextBtn.disabled=false; });
  if(q.type==='match'){ document.getElementById('checkMatchBtn').onclick=()=>{ const selects=[...document.querySelectorAll('.match-select')]; const ok = selects.every(s=>s.value===s.dataset.answer); selects.forEach(s=>s.disabled=true); showQuestionResult(ok, 'Lihat pasangan yang benar pada penjelasan dan coba lagi pada percobaan berikutnya.'); nextBtn.disabled=false; }; }
  nextBtn.onclick=()=>{ quizSession.index++; if(quizSession.index<quizSession.questions.length) renderQuizQuestion(); else finishQuiz(); };
}
function showQuestionResult(ok, answerText){ const fb=document.getElementById('quizFeedback'); fb.innerHTML = ok?'✓ Benar!':'Belum tepat. Jawaban yang benar: <b>'+fmtText(answerText)+'</b>'; fb.className=`feedback ${ok?'good':'bad'}`; if(ok){ quizSession.score++; addXP(8); } persist(false); }
function finishQuiz(){ const score=Math.round((quizSession.score/quizSession.questions.length)*100); state.quiz.lastScore=score; state.quiz.bestScore=Math.max(state.quiz.bestScore||0, score); state.quiz.attempts=(state.quiz.attempts||0)+1; if(score>=80 && !state.badges.includes('Rational Master')) state.badges.push('Rational Master'); addXP(score>=80?60:30); persist(); burstConfetti(); app.innerHTML=`<section class="card center" style="max-width:720px;margin:40px auto"><p class="eyebrow">HASIL EVALUASI</p><h1>${score}/100</h1><p>${score>=80?'Sangat baik!':'Terus berlatih, kamu sudah berkembang.'}</p><p>Jawaban benar: ${quizSession.score} dari ${quizSession.questions.length}</p><div class="actions" style="justify-content:center"><button id="retryQuizBtn" class="btn btn-primary">Ulangi Evaluasi</button><button data-route="progress" class="btn btn-secondary">Lihat Progress</button></div></section>`; document.getElementById('retryQuizBtn').onclick=startQuiz; document.querySelector('[data-route="progress"]').onclick=()=>{ route='progress'; render(); }; }

document.getElementById('fullscreenBtn').onclick=()=>{ if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); };
document.getElementById('soundBtn').onclick=()=>{ state.settings.sound=!state.settings.sound; persist(false); updateChrome(); };
render();
