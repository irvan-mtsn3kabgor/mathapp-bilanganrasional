const SHEETS = {
  STUDENTS: "Students",
  PROGRESS: "Progress",
  QUIZ: "QuizResults",
  LOG: "ActivityLog"
};

function setupApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Spreadsheet aktif tidak ditemukan. Buat Apps Script dari Extensions > Apps Script pada Google Sheet yang akan digunakan.");
  ensureSheets_(ss);
  return {success:true, spreadsheetId:ss.getId(), spreadsheetName:ss.getName(), sheets:Object.values(SHEETS)};
}

function testApp() {
  const result = setupApp();
  Logger.log(JSON.stringify(result));
  return result;
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || "status").trim();
    if (action === "getProgress") return json_(getProgress_(String(e.parameter.studentId || "")));
    if (action === "setup") {
      const result = setupApp();
      return json_({success:true,message:"Setup berhasil",spreadsheetName:result.spreadsheetName,sheets:result.sheets});
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return json_({success:true,message:"Bilangan Rasional API aktif",spreadsheetName:ss?ss.getName():null,spreadsheetId:ss?ss.getId():null});
  } catch (err) {
    return json_({success:false,message:String(err && err.message ? err.message : err)});
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({success:false,message:"Body request kosong"});
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === "saveProgress") return json_(saveProgress_(payload.data || {}));
    return json_({success:false,message:"Action tidak dikenal"});
  } catch (err) {
    return json_({success:false,message:String(err && err.message ? err.message : err)});
  }
}

function saveProgress_(data) {
  if (!data.student || !data.student.id) return {success:false,message:"studentId tidak tersedia"};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return {success:false,message:"Spreadsheet aktif tidak ditemukan. Pastikan Apps Script dibuat dari Google Sheet melalui Extensions > Apps Script."};
  ensureSheets_(ss);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    upsertStudent_(ss.getSheetByName(SHEETS.STUDENTS), data.student);
    const progressSheet = ss.getSheetByName(SHEETS.PROGRESS);
    Object.keys(data.modules || {}).forEach(function(moduleKey) {
      upsertProgress_(progressSheet,{studentId:data.student.id,module:moduleKey,progress:Number(data.modules[moduleKey]||0),status:Number(data.modules[moduleKey]||0)>=100?"completed":"active",xp:Number(data.xp||0),badges:JSON.stringify(data.badges||[]),updatedAt:new Date()});
    });
    const quiz = data.quiz || {};
    if (Number(quiz.attempts || 0) > 0) upsertQuizSummary_(ss.getSheetByName(SHEETS.QUIZ), data.student.id, quiz);
    return {success:true,message:"Progress saved",spreadsheetName:ss.getName(),serverTime:new Date().toISOString()};
  } finally { lock.releaseLock(); }
}

function getProgress_(studentId) {
  if (!studentId) return {success:false,message:"studentId wajib diisi"};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return {success:false,message:"Spreadsheet aktif tidak ditemukan"};
  ensureSheets_(ss);
  const rows = ss.getSheetByName(SHEETS.PROGRESS).getDataRange().getValues();
  const modules = {}; let xp = 0, badges = [];
  for (let i=1;i<rows.length;i++) if (String(rows[i][0])===String(studentId)) {
    modules[String(rows[i][1])] = Number(rows[i][2]||0); xp=Math.max(xp,Number(rows[i][4]||0));
    try { badges=JSON.parse(rows[i][5]||"[]"); } catch (_) {}
  }
  const qrows=ss.getSheetByName(SHEETS.QUIZ).getDataRange().getValues();
  let quiz={bestScore:0,lastScore:0,attempts:0};
  for (let i=1;i<qrows.length;i++) if (String(qrows[i][0])===String(studentId)) { quiz={bestScore:Number(qrows[i][1]||0),lastScore:Number(qrows[i][2]||0),attempts:Number(qrows[i][3]||0)}; break; }
  return {success:true,data:{modules:modules,xp:xp,badges:badges,quiz:quiz}};
}

function ensureSheets_(ss) {
  ensureSheet_(ss,SHEETS.STUDENTS,["studentId","name","className","createdAt","lastActive"]);
  ensureSheet_(ss,SHEETS.PROGRESS,["studentId","module","progress","status","xp","badges","updatedAt"]);
  ensureSheet_(ss,SHEETS.QUIZ,["studentId","bestScore","lastScore","attempts","updatedAt"]);
  ensureSheet_(ss,SHEETS.LOG,["studentId","activity","action","value","timestamp"]);
}

function ensureSheet_(ss,name,headers) {
  let sh=ss.getSheetByName(name);
  if (!sh) sh=ss.insertSheet(name);
  if (sh.getLastRow()===0) {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1); sh.getRange(1,1,1,headers.length).setFontWeight("bold"); sh.autoResizeColumns(1,headers.length);
  }
}

function upsertStudent_(sh,s) {
  const rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][0])===String(s.id)) { sh.getRange(i+1,2,1,4).setValues([[s.name||"",s.className||"",s.createdAt||"",new Date()]]); return; }
  sh.appendRow([s.id,s.name||"",s.className||"",s.createdAt||new Date(),new Date()]);
}

function upsertProgress_(sh,r) {
  const rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][0])===String(r.studentId)&&String(rows[i][1])===String(r.module)) { sh.getRange(i+1,3,1,5).setValues([[r.progress,r.status,r.xp,r.badges,r.updatedAt]]); return; }
  sh.appendRow([r.studentId,r.module,r.progress,r.status,r.xp,r.badges,r.updatedAt]);
}

function upsertQuizSummary_(sh,studentId,q) {
  const rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][0])===String(studentId)) { sh.getRange(i+1,2,1,4).setValues([[Number(q.bestScore||0),Number(q.lastScore||0),Number(q.attempts||0),new Date()]]); return; }
  sh.appendRow([studentId,Number(q.bestScore||0),Number(q.lastScore||0),Number(q.attempts||0),new Date()]);
}

function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
