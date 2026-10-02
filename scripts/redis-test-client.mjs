// Test-only RESP client. This can connect only to a disposable loopback Redis.
import net from 'node:net';
export function redisCommand(command){return new Promise((resolve,reject)=>{
 const socket=net.createConnection({host:'127.0.0.1',port:Number(process.env.REDIS_TEST_PORT||6397)});let data=Buffer.alloc(0);
 socket.setTimeout(5000,()=>socket.destroy(Error('Redis test timeout')));socket.on('error',reject);
 function parse(at=0){const end=data.indexOf('\r\n',at);if(end<0)return;const type=String.fromCharCode(data[at]),line=data.toString('utf8',at+1,end);let pos=end+2;
  if(type===':'||type==='+')return [type===':'?Number(line):line,pos];if(type==='-')throw Error(line);
  if(type==='$'){const n=Number(line);if(n===-1)return [null,pos];if(data.length<pos+n+2)return;return [data.toString('utf8',pos,pos+n),pos+n+2];}
  if(type==='*'){const out=[];for(let i=0;i<Number(line);i++){const r=parse(pos);if(!r)return;out.push(r[0]);pos=r[1];}return [out,pos];}
 }
 socket.on('data',chunk=>{data=Buffer.concat([data,chunk]);try{const result=parse();if(result){socket.end();resolve(result[0]);}}catch(e){socket.destroy();reject(e);}});
 socket.on('connect',()=>{socket.write('*'+command.length+'\r\n'+command.map(v=>{const s=String(v);return '$'+Buffer.byteLength(s)+'\r\n'+s+'\r\n';}).join(''));});
});}
export const redisFetch=async(_url,options)=>({ok:true,json:async()=>({result:await redisCommand(JSON.parse(options.body))})});
