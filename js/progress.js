const order=["concept","conversion","numberLine","comparison"];
export function totalProgress(state){
  return Math.round(order.reduce((s,k)=>s+(state.modules[k]||0),0)/order.length);
}
export function unlocked(state,key){
  const i=order.indexOf(key);
  return i<=0 || (state.modules[order[i-1]]||0)>=100;
}
export function addXP(state,amount){state.xp=Math.max(0,(state.xp||0)+amount)}
export function completeModule(state,key,badge){
  if((state.modules[key]||0)<100) addXP(state,50);
  state.modules[key]=100;
  if(badge&&!state.badges.includes(badge)) state.badges.push(badge);
}
