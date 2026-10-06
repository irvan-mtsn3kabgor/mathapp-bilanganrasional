export function fraction(n,d,cls=""){
  return `<span class="fraction ${cls}" aria-label="${n} per ${d}">
    <span class="numerator">${n}</span><span class="fraction-line"></span><span class="denominator">${d}</span>
  </span>`;
}
export const f=fraction;
export function decimalID(n){return String(n).replace(".",",")}
