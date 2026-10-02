import {track} from './sonavyr-measurement.js';
const button=document.querySelector('#interest-button'),counter=document.querySelector('#interest-count'),status=document.querySelector('#interest-status');
let offer,busy=false;
function show(data){
 if(!Number.isSafeInteger(data.count)||data.count<0||!['production','preview-test'].includes(data.mode)||typeof data.counted!=='boolean')throw Error('Invalid counter response.');
 offer=data.offer;
 counter.textContent=`${data.count} ${data.mode==='preview-test'?'test ':''}${data.count===1?'expression':'expressions'} of interest`;
 button.disabled=data.counted;
 status.textContent=data.counted?'Your interest is recorded for this browser and offer. No purchase or commitment.':'One expression per browser and offer. No purchase or commitment.';
}
async function load(){try{const r=await fetch('/api/interest',{cache:'no-store'});if(!r.ok)throw Error();show(await r.json());}catch{counter.textContent='Counter unavailable';status.textContent='The counter could not load. Press the interest button to retry.';}finally{if(!offer)button.disabled=false;}}
button.addEventListener('click',async()=>{if(busy)return;busy=true;button.disabled=true;try{
 if(!offer){await load();return;}
 const r=await fetch('/api/interest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(offer)});
 const data=await r.json();if(!r.ok)throw Error(data.error);show(data);if(data.accepted)track('purchase_intent');
}catch(error){status.textContent=`Interest not confirmed. ${error.message||'Please retry.'}`;button.disabled=false;}finally{busy=false;}});
load();
