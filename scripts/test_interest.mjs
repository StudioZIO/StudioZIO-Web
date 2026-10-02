import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,namespace,offer,cookieName} from '../server/interest.mjs';
import {redisFetch,redisCommand} from './redis-test-client.mjs';
const env={VERCEL_ENV:'preview',VERCEL_URL:'test.vercel.app',VERCEL_GIT_COMMIT_REF:'counter-test-'+Date.now(),KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'local-test-only-not-a-credential'};
let clock=Date.now();
function request(handler,method='GET',cookie='',overrides={}){const req={method,headers:{host:'test.vercel.app',origin:'https://test.vercel.app','sec-fetch-site':'same-origin','content-type':'application/json',cookie},body:method==='POST'?offer:undefined,...overrides};return new Promise(resolve=>{const headers={};handler(req,{setHeader:(k,v)=>headers[k]=v,end: function(body){resolve({status:this.statusCode,body:JSON.parse(body),headers});}});});}
const canned=async()=>({ok:true,json:async()=>({result:[0,0,0]})});
test('namespaces separate production, previews and local; production ignores branch',()=>{assert.notEqual(namespace(env),namespace({...env,VERCEL_ENV:'production'}));assert.notEqual(namespace(env),namespace({...env,VERCEL_GIT_COMMIT_REF:'another'}));assert.equal(namespace({VERCEL_ENV:'production'}),namespace({...env,VERCEL_ENV:'production'}));});
test('origin, method, strict offer, size and cookie validation fail closed',async()=>{const h=createHandler({env,fetcher:canned});
 for(const [overrides,code] of [[{method:'DELETE'},405],[{headers:{host:'evil.example'}},403],[{method:'POST',body:{...offer,price:1}},400],[{method:'POST',body:'x'.repeat(1025)},413],[{method:'POST',body:'{'},400],[{method:'POST',body:offer},409]])assert.equal((await request(h,'GET','',overrides)).status,code);
 const get=await request(h);assert.match(get.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict; Path=\//);assert.equal(get.headers['Cache-Control'],'private, no-store');
 assert.equal((await request(h,'POST',cookieName+'=forged')).status,409);
});
test('missing config, upstream timeout/error and malformed results never invent counts',async()=>{for(const [config,f] of [[{},canned],[env,async()=>{throw Error('secret upstream details');}],[env,async()=>({ok:false})],[env,async()=>({ok:true,json:async()=>({result:['wrong']})})]]){const result=await request(createHandler({env:{...env,KV_REST_API_TOKEN:undefined,...config},fetcher:f}));assert.equal(result.status,503);assert.equal(result.body.count,undefined);assert(!JSON.stringify(result).includes('secret upstream'));}});
test('real Redis: atomic concurrency, dedup, reload, rate limits, no PII and preview isolation',{skip:!process.env.REDIS_TEST_PORT},async()=>{
 const h=createHandler({env,fetcher:redisFetch,now:()=>clock});const cookies=[];
 for(let i=0;i<10;i++){const r=await request(h);assert.equal(r.status,200);assert.equal(r.body.count,0);cookies.push(r.headers['Set-Cookie'].split(';')[0]);}
 assert.equal((await request(h,'POST',cookies[0])).status,429);clock+=1100;
 const votes=await Promise.all(cookies.flatMap(c=>[request(h,'POST',c),request(h,'POST',c)]));assert(votes.every(v=>v.status===200));assert.equal(votes.filter(v=>v.body.accepted).length,10);
 const reload=await request(createHandler({env,fetcher:redisFetch,now:()=>clock}),'GET',cookies[0]);assert.equal(reload.body.count,10);assert.equal(reload.body.counted,true);
 const another=createHandler({env:{...env,VERCEL_GIT_COMMIT_REF:'isolated-'+Date.now()},fetcher:redisFetch,now:()=>clock});assert.equal((await request(another)).body.count,0);
 const limited=await Promise.all(Array.from({length:15},()=>request(h,'POST',cookies[0])));assert(limited.some(x=>x.status===429));assert.equal((await redisCommand(['SCARD',namespace(env)+':votes'])),10);
 const members=await redisCommand(['SMEMBERS',namespace(env)+':votes']);assert(members.every(m=>/^[a-f0-9]{64}$/.test(m)));assert(!members.includes(cookies[0]));
});

test('built product is coming soon, demos local, secrets and review material excluded',async()=>{
 const {readFile,readdir}=await import('node:fs/promises');const page=await readFile(new URL('../dist/products/sonavyr/index.html',import.meta.url),'utf8');
 assert.match(page,/Coming soon/);assert.match(page,/<button[^>]*disabled[^>]*>Buy Sonavyr/);assert.match(page,/<button[^>]*disabled[^>]*>Try for 14 days/);
 assert.match(page,/10\.7 ms/);assert.match(page,/22\.8 ms/);assert.match(page,/Plugin latency only/);assert.match(page,/Transpose 0/);
 assert(!/confidential|source PDF|Moonbase|localhost|0\.2\.10|private planning|checkoutUrl/i.test(page));
 const files=await readdir(new URL('../dist/',import.meta.url),{recursive:true});assert(!files.some(f=>/\.sqlite|\.pdf$|private-launch|reference\/|\.env/.test(f)));
 for(const f of files.filter(f=>/\.(js|html|css|json)$/.test(f))){const text=await readFile(new URL('../dist/'+f,import.meta.url),'utf8');assert(!/KV_REST_API_TOKEN|KV_REST_API_URL|local-test-only/.test(text),f+' leaks server configuration');}
});

test('product analytics require production host and explicit consent; no extra page view',async()=>{
 const calls=[];globalThis.window={gtag:(...a)=>calls.push(a)};globalThis.location={hostname:'preview.vercel.app'};let consent='granted';globalThis.localStorage={getItem:()=>consent};
 try{const {track}=await import('../src/sonavyr-measurement.js');track('purchase_intent');assert.equal(calls.length,0);location.hostname='www.studiozio.tech';consent='denied';track('demo_play','mind:dry');assert.equal(calls.length,0);consent='granted';track('demo_play','mind:dry');track('purchase_intent');track('page_view');assert.deepEqual(calls.map(c=>c[1]),['demo_play','purchase_intent']);assert(!JSON.stringify(calls).includes('cookie'));}finally{delete globalThis.window;delete globalThis.location;delete globalThis.localStorage;}
});
