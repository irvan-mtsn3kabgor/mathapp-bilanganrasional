import { CONFIG } from "./config.js";

export async function pushProgress(state){
  if(!CONFIG.GAS_URL) return {success:false,offline:true,message:"GAS_URL belum diatur"};
  const payload={action:"saveProgress",data:{
    student:state.student,modules:state.modules,xp:state.xp,badges:state.badges,quiz:state.quiz,
    appVersion:CONFIG.APP_VERSION
  }};
  try{
    const res=await fetch(CONFIG.GAS_URL,{method:"POST",body:JSON.stringify(payload)});
    const json=await res.json();
    return json;
  }catch(e){return {success:false,offline:true,message:e.message}}
}

export async function pullProgress(studentId){
  if(!CONFIG.GAS_URL||!studentId) return null;
  try{
    const url=`${CONFIG.GAS_URL}?action=getProgress&studentId=${encodeURIComponent(studentId)}`;
    const res=await fetch(url);
    const json=await res.json();
    return json.success?json.data:null;
  }catch{return null}
}
