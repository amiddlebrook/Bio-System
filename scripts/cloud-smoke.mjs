import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const base=(process.env.BIO_SYSTEM_URL||'https://bio-system.averymiddlebrook2014.workers.dev').replace(/\/$/,'');
const key=randomBytes(32).toString('hex');
const other=randomBytes(32).toString('hex');
async function api(route,{method='GET',token=key,body}={}){
  const response=await fetch(base+route,{
    method,
    headers:{authorization:'Bearer '+token,...(body?{'content-type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),
    signal:AbortSignal.timeout(20000)
  });
  const json=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(method+' '+route+' returned '+response.status+': '+JSON.stringify(json));
  return json;
}
async function health(){
  for(let attempt=0;attempt<8;attempt++){
    try{
      const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(12000)});
      if(response.ok){
        const data=await response.json();
        if(data.service==='bio-system'&&data.configured===true)return;
      }
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
  throw Error('Cloudflare Worker /api/health did not report the D1 binding.');
}
await health();
console.log('Health check passed.');
let specimenId, observationId;
try{
  const first=await api('/api/state');assert.ok(Array.isArray(first.specimens));
  const created=await api('/api/specimens',{method:'POST',body:{name:'CI verification record',scientific_name:'',kingdom:'Flora',status:'Active',zone:'Smoke test'}});
  specimenId=created.id;assert.ok(specimenId);
  await api('/api/specimens/'+encodeURIComponent(specimenId),{method:'PATCH',body:{status:'Dormant'}});
  const added=await api('/api/observations',{method:'POST',body:{specimen_id:specimenId,type:'Note',value:'',unit:'',notes:'Production CRUD verification'}});
  observationId=added.id;
  const state=await api('/api/state');
  assert.equal(state.specimens.find(row=>row.id===specimenId)?.status,'Dormant');
  assert.ok(state.observations.some(row=>row.id===observationId));
  const isolated=await api('/api/state',{token:other});
  assert.ok(!isolated.specimens.some(row=>row.id===specimenId));
  assert.ok(!isolated.observations.some(row=>row.id===observationId));
  console.log('Production D1 write, read, update and workspace isolation passed.');
}finally{
  if(observationId)await api('/api/observations/'+encodeURIComponent(observationId),{method:'DELETE'});
  if(specimenId)await api('/api/specimens/'+encodeURIComponent(specimenId),{method:'DELETE'});
}
console.log('Production smoke test passed; temporary records removed.');
