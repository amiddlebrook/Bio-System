import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const token='a'.repeat(64);
const call=(path,options={},env={})=>worker.fetch(new Request('https://example.test'+path,options),{ASSETS:{fetch:()=>new Response('asset')},...env});
test('static assets forwarded',async()=>assert.equal(await(await call('/')).text(),'asset'));
test('health status only',async()=>assert.deepEqual(await(await call('/api/health')).json(),{service:'bio-system',configured:false}));
test('D1 required',async()=>assert.equal((await call('/api/state')).status,503));
test('workspace key required',async()=>assert.equal((await call('/api/state',{}, {DB:{}})).status,401));
test('invalid token denied',async()=>assert.equal((await call('/api/state',{headers:{authorization:'Bearer bad'}},{DB:{}})).status,401));
test('authenticated workspaces scoped to hashes',async()=>{
 const bound=[];
 const env={DB:{prepare:()=>({bind:(value)=>{bound.push(value);return{all:async()=>({results:[]})};}})}};
 const response=await call('/api/state',{headers:{authorization:'Bearer '+token}},env);
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{specimens:[],observations:[]});
 assert.equal(bound.length,2);assert.equal(bound[0],bound[1]);assert.equal(bound[0].length,64);assert.notEqual(bound[0],token);
});
test('invalid specimen rejected before insert',async()=>{
 const response=await call('/api/specimens',{method:'POST',headers:{authorization:'Bearer '+token},body:JSON.stringify({name:'',kingdom:'Flora',status:'Active'})},{DB:{}});
 assert.equal(response.status,400);
});
