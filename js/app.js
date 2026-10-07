import { loadState,saveState,resetState } from "./storage.js";
import { pushProgress,pullProgress,testConnection } from "./api.js";
import { totalProgress,unlocked,completeModule,addXP } from "./progress.js";
import { moduleInfo,conceptView,conversionView,numberLineView,comparisonView } from "./lessons.js";
import { loadQuestions,createQuiz,renderQuestion } from "./quiz.js";
import { burstConfetti,toast } from "./game.js";
import { f } from "./fractions.js";

let state=loadState(), route="home", quizSession=null, conversionStep=0, syncTimer=null;
const app=document.getElementById("app");
const views={concept:conceptView,conversion:conversionView,numberLine:numberLineView,comparison:comparisonView};

function updateChrome(){
  const p=totalProgress(state);
  document.getElementById("globalProgressBar").style.width=`${p}%`;
  document.getElementById("globalProgressText").textContent=`${p}%`;
  document.getElementById("xpValue").textContent=state.xp||0;
  document.getElementById("soundBtn").textContent=state.settings.sound?"🔊":"🔇";
}
function persist(sync=true){
  saveState(state);updateChrome();
  if(sync){
    state.sync.pending=true;saveState(state);
    clearTimeout(syncTimer);
    syncTimer=setTimeout(doSync,900);
  }
}
async function doSync(){
  const r=await pushProgress(state);
  if(r?.success){state.sync.pending=false;state.sync.lastSyncedAt=new Date().toISOString();saveState(state);renderSyncOnly()}
}
function renderSyncOnly(){
  const el=document.querySelector("[data-sync]");if(el)el.textContent=state.sync.pending?"Menunggu sinkronisasi":"Tersimpan";
}
function studentGate(){
  return `<section class="card fade-up" style="max-width:620px;margin:50px auto">
  <p class="eyebrow">PROFIL SISWA</p><h1>Siapa yang belajar hari ini?</h1>
  <p class="lead">Nama dan kelas digunakan untuk menyimpan progress pada perangkat dan, setelah Apps Script disiapkan, menyinkronkannya ke Google Sheets.</p>
  <form id="studentForm">
    <label>Nama</label><input id="studentName" required maxlength="50" autocomplete="name" placeholder="Masukkan nama siswa">
    <label>Kelas</label><select id="studentClass">${["VII A","VII B","VII C","VII D","VII E","VII F","VII G"].map(x=>`<option>${x}</option>`).join("")}</select>
    <div class="actions"><button class="btn btn-primary">Mulai Belajar</button></div>
  </form></section>`;
}
function homeView(){
 const cards=Object.entries(moduleInfo).map(([k,m],i)=>{
   const lock=!unlocked(state,k), p=state.modules[k]||0;
   return `<article class="card module-card ${lock?"locked":""}">
     <span class="module-index">MISI ${i+1}</span><h3>${m.icon} ${m.title}</h3>
     <div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div>
     <span class="status">${p>=100?"Selesai ✓":lock?"Terkunci":p>0?`${p}%`:"Siap dimulai"}</span>
     <div class="actions"><button class="btn btn-secondary" data-module="${k}" ${lock?"disabled":""}>${p?"Buka Lagi":"Mulai"}</button></div>
   </article>`
 }).join("");
 return `<section class="hero fade-up"><div class="hero-copy">
   <p class="eyebrow">RATIONAL QUEST</p><h1>Petualangan Bilangan Rasional</h1>
   <p class="lead">Temukan hubungan pecahan, desimal, posisi pada garis bilangan, dan cara membandingkan nilainya melalui eksplorasi visual.</p>
   <div class="actions"><button class="btn btn-primary" data-route="learn">Mulai / Lanjutkan Petualangan</button><button class="btn btn-secondary" data-route="progress">Lihat Progress</button></div>
   <p class="sync" data-sync>${state.sync.pending?"Menunggu sinkronisasi":"Tersimpan lokal"}</p>
 </div><div class="hero-art">
   <div class="float-card a">${f(3,4,"xl")}</div><div class="float-card b">0,75</div><div class="float-card c">−1,5 📍</div>
 </div></section>
 <h2 class="section-title">Peta Perjalanan</h2><section class="grid grid-2">${cards}</section>`;
}
function learnView(){
 const next=Object.keys(moduleInfo).find(k=>unlocked(state,k)&&(state.modules[k]||0)<100)||"comparison";
 return `<section class="fade-up"><p class="eyebrow">BELAJAR</p><h1>Pilih misi</h1>
 <div class="stepper">${Object.entries(moduleInfo).map(([k,m],i)=>`<div class="step ${(state.modules[k]||0)>=100?"done":k===next?"active":""}">${i+1}. ${m.title}</div>`).join("")}</div>
 <div class="grid grid-2">${Object.entries(moduleInfo).map(([k,m])=>`<div class="card ${!unlocked(state,k)?"module-card locked":""}"><h3>${m.icon} ${m.title}</h3><p>${(state.modules[k]||0)}% selesai</p><button class="btn btn-primary" data-module="${k}" ${!unlocked(state,k)?"disabled":""}>Buka</button></div>`).join("")}</div></section>`;
}
function progressView(){
 return `<section class="fade-up"><p class="eyebrow">PROGRESS</p><h1>Progress Belajar</h1>
 <div class="card"><div class="progress-list">${Object.entries(moduleInfo).map(([k,m])=>`<div class="progress-row"><b>${m.title}</b><div class="progress-track"><div class="progress-fill" style="width:${state.modules[k]||0}%"></div></div><span>${state.modules[k]||0}%</span></div>`).join("")}</div></div>
 <div class="grid grid-2" style="margin-top:16px"><div class="card"><h2>⭐ ${state.xp} XP</h2><p>Nilai terbaik: <b>${state.quiz.bestScore||0}/100</b></p><p>Upaya evaluasi: ${state.quiz.attempts||0}</p></div>
 <div class="card"><h2>Badge</h2>${state.badges.length?state.badges.map(b=>`<div class="badge"><span class="badge-icon">🏅</span><b>${b}</b></div>`).join(""):"<p>Belum ada badge. Selesaikan misi pertama.</p>"}</div></div>
 <div class="card" style="margin-top:16px"><h2>Sinkronisasi</h2><p data-sync>${state.sync.pending?"Menunggu sinkronisasi":"Tersimpan"}</p><p class="small">Terakhir sinkron: ${state.sync.lastSyncedAt?new Date(state.sync.lastSyncedAt).toLocaleString("id-ID"):"Belum pernah"}</p>
 <div class="actions"><button id="testConnection" class="btn btn-secondary">Tes Koneksi Apps Script</button><button id="syncNow" class="btn btn-secondary">Sinkronkan Sekarang</button><button id="resetProgress" class="btn btn-secondary">Reset Progress</button></div><div id="connectionResult" class="feedback"></div></div></section>`;
}
function quizHome(){
 const ready=Object.values(state.modules).every(x=>x>=100);
 return `<section class="fade-up"><p class="eyebrow">MISI TERAKHIR</p><h1>Uji Pemahaman</h1>
 <div class="card"><p>10 soal acak mencakup konsep, konversi, garis bilangan, membandingkan, dan mengurutkan.</p>
 ${ready?`<button id="startQuiz" class="btn btn-primary">Mulai Tantangan</button>`:`<div class="hint">Selesaikan 4 misi belajar terlebih dahulu.</div>`}</div></section>`;
}
function render(){
 updateChrome();
 if(!state.student.id){app.innerHTML=studentGate();bind();return}
 if(route==="home") app.innerHTML=homeView();
 else if(route==="learn") app.innerHTML=learnView();
 else if(route==="progress") app.innerHTML=progressView();
 else if(route==="quiz") app.innerHTML=quizHome();
 else if(views[route]) app.innerHTML=views[route]();
 else app.innerHTML=homeView();
 bind();app.focus({preventScroll:true});
}
function complete(key){
 const info=moduleInfo[key];completeModule(state,key,info.badge);persist();burstConfetti();toast(`${info.badge} diperoleh! +50 XP`);
 route="learn";setTimeout(render,450);
}
function bind(){
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{route=b.dataset.route;render()});
 document.querySelectorAll("[data-module]").forEach(b=>b.onclick=()=>{if(!b.disabled){route=b.dataset.module;state.modules[route]=Math.max(state.modules[route],10);persist(false);render()}});
 document.querySelectorAll("[data-complete]").forEach(b=>b.onclick=()=>complete(b.dataset.complete));
 const sf=document.getElementById("studentForm");
 if(sf) sf.onsubmit=async e=>{e.preventDefault();const name=document.getElementById("studentName").value.trim(), cls=document.getElementById("studentClass").value;
   state.student={id:`${name.toLowerCase().replace(/\W+/g,"-")}-${cls.replace(/\s/g,"").toLowerCase()}-${Date.now().toString(36)}`,name,className:cls,createdAt:new Date().toISOString()};
   persist(); const cloud=await pullProgress(state.student.id); if(cloud) Object.assign(state,cloud); render();
 };
 bindConcept();bindConversion();bindMiniChecks();bindSort();
 const tc=document.getElementById("testConnection");if(tc)tc.onclick=async()=>{const out=document.getElementById("connectionResult");out.textContent="Menguji koneksi...";out.className="feedback";const r=await testConnection();out.textContent=r.success?`✓ Terhubung ke Apps Script${r.spreadsheetName?` • ${r.spreadsheetName}`:""}`:`Gagal: ${r.message||"Tidak diketahui"}`;out.className=`feedback ${r.success?"good":"bad"}`};
 const s=document.getElementById("syncNow");if(s)s.onclick=async()=>{toast("Menyinkronkan...");const r=await pushProgress(state);if(r?.success){state.sync.pending=false;state.sync.lastSyncedAt=new Date().toISOString();saveState(state);renderSyncOnly();toast("Progress tersinkron.")}else{state.sync.pending=true;saveState(state);toast(`Gagal sinkron: ${r?.message||"periksa Apps Script"}`)}};
 const r=document.getElementById("resetProgress");if(r)r.onclick=()=>{if(confirm("Semua progress pada perangkat ini akan dihapus. Lanjutkan?")){resetState();state=loadState();route="home";render()}};
 const q=document.getElementById("startQuiz");if(q)q.onclick=startQuiz;
}
function bindConcept(){
 const out=document.getElementById("conceptExplain");if(!out)return;
 const map={"3":`3 dapat ditulis sebagai ${f(3,1)}.`,"0.5":`0,5 = ${f(5,10)} = ${f(1,2)}.`,"-1.25":`−1,25 = ${f(-125,100)} = ${f(-5,4)}.`,"0.75":`0,75 = ${f(75,100)} = ${f(3,4)}.`};
 document.querySelectorAll("#conceptCards [data-r]").forEach(b=>b.onclick=()=>{out.innerHTML=map[b.dataset.r];addXP(state,2);state.modules.concept=Math.max(state.modules.concept,35);persist(false)});
}
function bindConversion(){
 const next=document.getElementById("nextConv"),reset=document.getElementById("resetConv"),stage=document.getElementById("convStage");if(!next)return;
 const steps=[`${f(3,4,"xl")}`,`${f(75,100,"xl")}`,`75 per seratus`,`0,75`];
 const paint=()=>stage.innerHTML=steps.slice(0,conversionStep+1).map((s,i)=>`${i?'<div class="arrow">↓</div>':""}<div class="math-box">${s}</div>`).join("");
 next.onclick=()=>{conversionStep=Math.min(steps.length-1,conversionStep+1);paint();state.modules.conversion=Math.max(state.modules.conversion,35+conversionStep*10);addXP(state,2);persist(false)};
 reset.onclick=()=>{conversionStep=0;paint()};paint();
}
function bindMiniChecks(){
 document.querySelectorAll(".mini-check").forEach(group=>{
   const feedback=group.nextElementSibling;
   group.querySelectorAll(".option").forEach(btn=>btn.onclick=()=>{
     group.querySelectorAll(".option").forEach(x=>x.disabled=true);
     const val=(btn.dataset.value||btn.innerHTML).replaceAll("&lt;","<").trim();
     const answer=group.dataset.answer.replaceAll("&lt;","<");
     if(val===answer || btn.textContent.trim()===answer){btn.classList.add("correct");feedback.textContent="✓ Benar!";feedback.classList.add("good");addXP(state,10)}
     else{btn.classList.add("wrong");feedback.textContent="Belum tepat. Gunakan petunjuk visual lalu coba pada latihan berikutnya.";feedback.classList.add("bad")}
     persist(false);
   })
 })
}
function bindSort(){
 const src=document.getElementById("sortSource"),tar=document.getElementById("sortTarget"),fb=document.getElementById("sortFeedback"),reset=document.getElementById("resetSort");if(!src)return;
 const original=[...src.children].map(x=>x.outerHTML);
 src.onclick=e=>{const b=e.target.closest(".sort-card");if(!b)return;tar.appendChild(b);if(tar.children.length===4){
   const vals=[...tar.children].map(x=>+x.dataset.value),ok=vals.every((v,i)=>i===0||vals[i-1]<=v);
   fb.textContent=ok?"✓ Urutan benar: 0,25 < 0,5 < 0,6 < 0,75":"Belum urut. Bandingkan nilainya dalam bentuk desimal.";fb.className=`feedback ${ok?"good":"bad"}`;if(ok){addXP(state,15);persist(false)}
 }};
 reset.onclick=()=>{src.innerHTML=original.join("");tar.innerHTML="";fb.textContent=""};
}
async function startQuiz(){
 const qs=createQuiz(await loadQuestions());quizSession={qs,i:0,score:0,answered:false};showQuizQuestion();
}
function showQuizQuestion(){
 const {qs,i}=quizSession;if(i>=qs.length){finishQuiz();return}
 app.innerHTML=`<section class="fade-up"><p class="eyebrow">TANTANGAN AKHIR</p><div class="progress-track"><div class="progress-fill" style="width:${(i/qs.length)*100}%"></div></div>${renderQuestion(qs[i],i,qs.length)}</section>`;
 const q=qs[i],feed=document.getElementById("quizFeedback"),next=document.getElementById("nextQ");
 document.querySelectorAll("#quizOptions .option").forEach(btn=>btn.onclick=()=>{
   if(quizSession.answered)return;quizSession.answered=true;const val=btn.dataset.value;
   if(val===q.answer){btn.classList.add("correct");feed.textContent="✓ Benar!";feed.className="feedback good";quizSession.score++}
   else{btn.classList.add("wrong");feed.innerHTML=`Belum tepat. Jawaban yang benar: <b>${q.answer}</b>`;feed.className="feedback bad";
     document.querySelectorAll("#quizOptions .option").forEach(x=>{if(x.dataset.value===q.answer)x.classList.add("correct")});
   } next.disabled=false;
 });
 document.getElementById("hintBtn").onclick=()=>document.getElementById("quizHint").classList.remove("hidden");
 next.onclick=()=>{quizSession.i++;quizSession.answered=false;showQuizQuestion()};
}
function finishQuiz(){
 const score=Math.round(quizSession.score/quizSession.qs.length*100);
 state.quiz.lastScore=score;state.quiz.bestScore=Math.max(state.quiz.bestScore||0,score);state.quiz.attempts=(state.quiz.attempts||0)+1;
 if(score>=80 && !state.badges.includes("Rational Master"))state.badges.push("Rational Master");
 addXP(state,score>=80?80:30);persist();burstConfetti();
 app.innerHTML=`<section class="card center fade-up" style="max-width:700px;margin:50px auto"><p class="eyebrow">HASIL PETUALANGAN</p><h1>${score}/100</h1><h2>${score>=80?"Misi Berhasil!":score>=70?"Sedikit lagi menuju penguasaan penuh.":"Beberapa misi perlu dipelajari kembali."}</h2><p>Jawaban benar: ${quizSession.score} dari ${quizSession.qs.length}</p><div class="actions" style="justify-content:center"><button class="btn btn-primary" id="retryQuiz">Ulangi Tantangan</button><button class="btn btn-secondary" data-route="home">Kembali ke Beranda</button></div></section>`;
 document.getElementById("retryQuiz").onclick=startQuiz;document.querySelector("[data-route='home']").onclick=()=>{route="home";render()};
}
document.getElementById("soundBtn").onclick=()=>{state.settings.sound=!state.settings.sound;persist(false)};
document.getElementById("fullscreenBtn").onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
render();
