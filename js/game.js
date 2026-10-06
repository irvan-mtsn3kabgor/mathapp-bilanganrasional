export function burstConfetti(){
  const layer=document.getElementById("confetti"); if(!layer)return;
  for(let i=0;i<26;i++){
    const x=document.createElement("i");x.className="confetti-piece";
    x.style.left=`${Math.random()*100}%`;x.style.animationDelay=`${Math.random()*.35}s`;
    x.style.transform=`rotate(${Math.random()*120}deg)`;layer.appendChild(x);
    setTimeout(()=>x.remove(),1900);
  }
}
export function toast(text){
  const el=document.getElementById("toast");el.textContent=text;el.classList.add("show");
  clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}
