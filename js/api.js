import { CONFIG } from "./config.js";

export async function testConnection(){
  if(!CONFIG.GAS_URL) return {success:false,message:"GAS_URL belum diisi di js/config.js"};
  try{
    const res = await fetch(`${CONFIG.GAS_URL}?action=status&t=${Date.now()}`, {method:"GET", cache:"no-store", redirect:"follow"});
    const text = await res.text();
    try{ return JSON.parse(text); }
    catch{ return {success:false, message:"Endpoint merespons tetapi browser tidak menerima JSON. Buka URL /exec langsung di browser untuk tes manual."}; }
  }catch(e){
    return {success:false, message:`Tidak dapat mengakses Apps Script: ${e.message}`};
  }
}

export async function pushProgress(state){
  if(!CONFIG.GAS_URL) return {success:false,message:"GAS_URL belum diatur"};
  const payload = {
    action:"saveProgress",
    data:{ student:state.student, modules:state.modules, xp:state.xp, badges:state.badges, quiz:state.quiz, appVersion:CONFIG.APP_VERSION }
  };
  try{
    await fetch(CONFIG.GAS_URL, { method:"POST", mode:"no-cors", cache:"no-store", body: JSON.stringify(payload) });
    return {success:true, opaque:true, message:"Request sinkronisasi telah dikirim."};
  }catch(e){
    return {success:false, message:`Request tidak dapat dikirim: ${e.message}`};
  }
}

export async function pullProgress(){ return null; }
