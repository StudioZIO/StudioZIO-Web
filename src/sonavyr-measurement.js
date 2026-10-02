// The shared Google tag owns page_view and Consent Mode. These additional
// product events require an explicit analytics choice and carry no browser ID.
export function track(name,variant=''){
 if(!['demo_play','purchase_intent'].includes(name))return;
 try{if(localStorage.getItem(window.STUDIOZIO_CONSENT_KEY||'studiozio-consent')!=='granted')return;}catch{return;}
 if(typeof window.gtag==='function')window.gtag('event',name,{product_id:'sonavyr',product_version:'1.0.0',price:99,currency:'USD',demo_variant:variant,send_to:'G-VL8Z542XMP'});
}
