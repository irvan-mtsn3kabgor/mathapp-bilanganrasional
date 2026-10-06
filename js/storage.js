import { CONFIG } from "./config.js";

const initial = {
  student:{id:"",name:"",className:"VII A",createdAt:""},
  modules:{concept:0,conversion:0,numberLine:0,comparison:0},
  xp:0,badges:[],quiz:{bestScore:0,lastScore:0,attempts:0},
  sync:{pending:false,lastSyncedAt:""},settings:{sound:false}
};

export function loadState(){
  try{
    const raw=localStorage.getItem(CONFIG.STORAGE_KEY);
    return raw?merge(structuredClone(initial),JSON.parse(raw)):structuredClone(initial);
  }catch{return structuredClone(initial)}
}
function merge(base,extra){
  for(const [k,v] of Object.entries(extra||{})){
    if(v && typeof v==="object" && !Array.isArray(v) && typeof base[k]==="object") base[k]=merge(base[k],v);
    else base[k]=v;
  } return base;
}
export function saveState(state){localStorage.setItem(CONFIG.STORAGE_KEY,JSON.stringify(state))}
export function resetState(){localStorage.removeItem(CONFIG.STORAGE_KEY)}
