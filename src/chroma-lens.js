export function noteStates(step){return Array.from({length:12},(_,i)=>step<0?false:step<12?i<=step:i>step-12);}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.chroma-panel').forEach(panel=>{
 const notes=[...panel.querySelectorAll('.lens-note')],button=panel.querySelector('.lens-toggle');let step=-1,paused=false;
 const paint=()=>notes.forEach((note,i)=>note.classList.toggle('is-lit',reduced.matches?i===6:noteStates(step)[i]));
 const preference=()=>{button.disabled=reduced.matches;button.setAttribute('aria-label',reduced.matches?'Static illustration · reduced motion':paused?'Resume animation':'Pause animation');button.querySelector('span').textContent=paused?'▶':'Ⅱ';paint();};
 button.addEventListener('click',()=>{paused=!paused;button.setAttribute('aria-pressed',String(paused));preference();});reduced.addEventListener('change',preference);preference();
 setInterval(()=>{if(reduced.matches||paused||document.hidden)return;step=(step+1)%24;paint();},450);
});
