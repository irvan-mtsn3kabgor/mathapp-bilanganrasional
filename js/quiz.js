import { f } from "./fractions.js";
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
export async function loadQuestions(){
  try{return await (await fetch("data/questions.json")).json()}catch{return []}
}
export function createQuiz(questions){
  const cats=["concept","conversion","numberLine","comparison"];
  const selected=[];
  for(const c of cats) selected.push(...shuffle(questions.filter(q=>q.category===c)).slice(0,c==="conversion"||c==="comparison"?3:2));
  return shuffle(selected).slice(0,10);
}
export function renderQuestion(q,index,total){
  const visual=q.fraction?`<div class="big-math">${f(q.fraction.n,q.fraction.d,"xl")}</div>`:"";
  return `<div class="card fade-up">
   <div class="quiz-head"><b>Soal ${index+1} dari ${total}</b><span class="small">${q.category}</span></div>
   ${visual}<h2>${q.prompt}</h2>
   <div class="option-grid" id="quizOptions">${q.options.map(o=>`<button class="option" data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div>
   <div id="quizFeedback" class="feedback"></div>
   <div id="quizHint" class="hint hidden">${q.hint}</div>
   <div class="actions"><button id="hintBtn" class="btn btn-secondary">Petunjuk</button><button id="nextQ" class="btn btn-primary" disabled>Lanjut</button></div>
  </div>`;
}
function escapeHtml(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
