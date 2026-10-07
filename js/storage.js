import { CONFIG } from "./config.js";

const initialState = {
  student:{id:"",name:"",className:"VII A",createdAt:""},
  modules:{concept:0,conversion:0,numberline:0,comparison:0},
  xp:0,
  badges:[],
  quiz:{bestScore:0,lastScore:0,attempts:0},
  settings:{sound:false},
  sync:{pending:false,lastSyncedAt:""}
};

export function cloneState(){ return JSON.parse(JSON.stringify(initialState)); }
export function loadState(){
  try{
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if(!raw) return cloneState();
    return deepMerge(cloneState(), JSON.parse(raw));
  }catch{return cloneState();}
}
function deepMerge(base, extra){
  for(const [k,v] of Object.entries(extra||{})){
    if(v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object') base[k] = deepMerge(base[k], v);
    else base[k] = v;
  }
  return base;
}
export function saveState(state){ localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)); }
export function resetState(){ localStorage.removeItem(CONFIG.STORAGE_KEY); }
