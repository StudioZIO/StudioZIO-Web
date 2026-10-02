import {createHash, createHmac, randomBytes, timingSafeEqual} from 'node:crypto';
export const offer=Object.freeze({product:'sonavyr',version:'1.0.0',price:99,currency:'USD'});
export const cookieName='__Host-sz-interest';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function namespace(env){
 if(env.VERCEL_ENV==='production')return 'studiozio:interest:production:sonavyr:1.0.0:USD99:v1';
 if(env.VERCEL_ENV==='preview')return `studiozio:interest:preview:${hash(env.VERCEL_GIT_COMMIT_REF||env.VERCEL_URL||'preview').slice(0,16)}:sonavyr:1.0.0:USD99:v1`;
 return 'studiozio:interest:development:sonavyr:1.0.0:USD99:v1';
}
// A single script serializes limits, deduplication and the aggregate. No IPs,
// user agents, email addresses or raw browser tokens enter Redis.
export const script=`
local function limited(key, maximum)
 local n=redis.call('INCR',key)
 if n==1 then redis.call('EXPIRE',key,60) end
 return n>maximum
end
if limited(KEYS[2],180) then return {-1,0,0} end
if ARGV[3]=='1' and limited(KEYS[3],30) then return {-1,0,0} end
if limited(KEYS[4],12) then return {-1,0,0} end
local accepted=0
if ARGV[1]=='POST' then
 if redis.call('SCARD',KEYS[1])>=100000 and redis.call('SISMEMBER',KEYS[1],ARGV[2])==0 then return {-2,0,0} end
 accepted=redis.call('SADD',KEYS[1],ARGV[2])
end
return {redis.call('SCARD',KEYS[1]),redis.call('SISMEMBER',KEYS[1],ARGV[2]),accepted}
`;
export function createHandler({env=process.env,fetcher=fetch,now=Date.now}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','Cookie');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
  const send=(code,data)=>{res.statusCode=code;res.end(JSON.stringify(data));};
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(405,{error:'Method not allowed.'});}
  const deployed=['preview','production'].includes(env.VERCEL_ENV);
  const allowed=env.VERCEL_ENV==='production'?['www.studiozio.tech','studiozio.tech']:env.VERCEL_ENV==='preview'?[env.VERCEL_URL,env.VERCEL_BRANCH_URL].filter(Boolean):['127.0.0.1:4190'];
  const host=req.headers.host;
  if(!allowed.includes(host)|| (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site']!=='same-origin'))return send(403,{error:'Same-origin requests only.'});
  if(req.method==='POST'&&(req.headers.origin!==`${deployed?'https':'http'}://${host}`||req.headers['content-type']!=='application/json'))return send(403,{error:'Invalid origin or content type.'});
  try{
   if(req.method==='POST'){
    if(Number(req.headers['content-length']||0)>1024)return send(413,{error:'Request too large.'});
    let body=req.body;
    if(body===undefined){let raw='';for await(const part of req){raw+=part;if(Buffer.byteLength(raw)>1024)return send(413,{error:'Request too large.'});}body=raw;}
    if(Buffer.isBuffer(body))body=body.toString();
    if(typeof body==='string'){if(Buffer.byteLength(body)>1024)return send(413,{error:'Request too large.'});try{body=JSON.parse(body);}catch{return send(400,{error:'Invalid JSON.'});}}
    if(!body||Array.isArray(body)||Object.keys(body).sort().join()!==Object.keys(offer).sort().join()||Object.keys(offer).some(k=>body[k]!==offer[k]))return send(400,{error:'Invalid offer.'});
   }
   const url=env.KV_REST_API_URL, secret=env.KV_REST_API_TOKEN;
   if(!url||!secret||!/^https:\/\/[a-z0-9-]+\.upstash\.io\/?$/.test(url))throw Error('Unavailable');
   const prefix=namespace(env),sign=s=>createHmac('sha256',secret).update(prefix+'|'+s).digest('hex');
   let token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
   let fresh=true;
   if(token&&/^[a-f0-9]{64}\.[0-9]{13}\.[a-f0-9]{64}$/.test(token)){
    const [id,time,mac]=token.split('.');const age=now()-Number(time);
    fresh=age<0||age>31536000000||!timingSafeEqual(Buffer.from(mac,'hex'),Buffer.from(sign(id+'.'+time),'hex'));
   }
   if(fresh){if(req.method==='POST')return send(409,{error:'Refresh the counter and enable first-party cookies before retrying.'});const data=randomBytes(32).toString('hex')+'.'+now();token=data+'.'+sign(data);}
   if(req.method==='POST'&&now()-Number(token.split('.')[1])<1000){res.setHeader('Retry-After','1');return send(429,{error:'Please wait a moment and retry.'});}
   const member=hash(token),minute=Math.floor(now()/60000);
   const keys=[prefix+':votes',prefix+':rate:'+minute,prefix+':new:'+minute,prefix+':browser:'+member+':'+minute];
   const response=await fetcher(url,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,4,...keys,req.method,member,fresh?'1':'0']),signal:AbortSignal.timeout(5000)});
   if(!response.ok)throw Error('Unavailable');
   const data=await response.json(),result=data.result;
   if(data.error||!Array.isArray(result)||result.length!==3||!result.every(Number.isSafeInteger))throw Error('Unavailable');
   const [count,counted,accepted]=result;
   if(count===-1){res.setHeader('Retry-After','60');return send(429,{error:'Please wait a minute and retry.'});}
   if(count<0||![0,1].includes(counted)||![0,1].includes(accepted))throw Error('Unavailable');
   if(fresh)res.setHeader('Set-Cookie',`${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`);
   return send(200,{count,counted:!!counted,accepted:!!accepted,offer,mode:env.VERCEL_ENV==='production'?'production':'preview-test'});
  }catch{return send(503,{error:'Counter temporarily unavailable. Please retry.'});}
 };
}
