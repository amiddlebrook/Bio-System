import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const call=(path,options={},env={})=>worker.fetch(new Request('https://test.example'+path,options),{ASSETS:{fetch:()=>new Response('asset')},...env});
test('assets served without API',async()=>assert.equal(await(await call('/')).text(),'asset'));
test('health does not leak secrets',async()=>assert.deepEqual(await(await call('/api/health')).json(),{service:'bio-system',configured:false}));
test('backend fails closed before setup',async()=>assert.equal((await call('/api/state')).status,503));
test('token is required',async()=>assert.equal((await call('/api/state',{}, {DB:{},APP_ACCESS_TOKEN:'secret'})).status,401));
test('invalid token is rejected',async()=>assert.equal((await call('/api/state',{headers:{authorization:'Bearer wrong'}},{DB:{},APP_ACCESS_TOKEN:'secret'})).status,401));
test('authenticated state succeeds',async()=>{
 const env={APP_ACCESS_TOKEN:'secret',DB:{prepare:()=>({all:async()=>({results:[]})})}};
 const res=await call('/api/state',{headers:{authorization:'Bearer secret'}},env);
 assert.equal(res.status,200);assert.deepEqual(await res.json(),{specimens:[],observations:[]});
});
test('invalid specimen fails validation',async()=>{
 const res=await call('/api/specimens',{method:'POST',headers:{authorization:'Bearer secret'},body:JSON.stringify({kingdom:'Flora',status:'Active'})},{DB:{},APP_ACCESS_TOKEN:'secret'});
 assert.equal(res.status,400);
});
