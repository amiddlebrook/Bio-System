const respond=(payload,status=200)=>new Response(JSON.stringify(payload),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const safe=(value,max=120)=>typeof value==="string"?value.trim().slice(0,max):"";
const invalid=message=>respond({error:message},400);
const equal=(a,b)=>{const x=new TextEncoder().encode(a),y=new TextEncoder().encode(b);let diff=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);return diff===0;};
async function bodyOf(request){if(Number(request.headers.get("content-length")||0)>16384)throw Error("Payload too large");const raw=await request.text();if(raw.length>16384)throw Error("Payload too large");const body=JSON.parse(raw);if(!body||typeof body!=="object"||Array.isArray(body))throw Error("Invalid object");return body;}
const kingdoms=["Flora","Fauna","Fungi","Microbe","Other"],statuses=["Active","Dormant","Critical"],types=["Temperature","Humidity","pH","Growth","Note"];
async function api(request,env,path){
  if(path==="/api/health"&&request.method==="GET")return respond({service:"bio-system",configured:Boolean(env.DB&&env.APP_ACCESS_TOKEN)});
  if(!env.DB||!env.APP_ACCESS_TOKEN)return respond({error:"Backend is not provisioned. See README for Cloudflare setup."},503);
  const auth=request.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer ")||!equal(auth.slice(7),env.APP_ACCESS_TOKEN))return respond({error:"Invalid access token"},401);
  const parts=path.split("/").filter(Boolean);
  if(path==="/api/state"&&request.method==="GET"){
    const [s,o]=await Promise.all([env.DB.prepare("SELECT * FROM specimens ORDER BY created_at DESC, id DESC LIMIT 1000").all(),env.DB.prepare("SELECT * FROM observations ORDER BY observed_at DESC, id DESC LIMIT 2000").all()]);
    return respond({specimens:s.results||[],observations:o.results||[]});
  }
  if(path==="/api/specimens"&&request.method==="POST"){
    const b=await bodyOf(request),name=safe(b.name),kingdom=safe(b.kingdom,30),status=safe(b.status,30);
    if(!name||!kingdoms.includes(kingdom)||!statuses.includes(status))return invalid("Invalid name, kingdom, or status");
    const id=crypto.randomUUID(),created_at=new Date().toISOString();
    await env.DB.prepare("INSERT INTO specimens (id,name,scientific_name,kingdom,status,zone,created_at) VALUES (?,?,?,?,?,?,?)").bind(id,name,safe(b.scientific_name),kingdom,status,safe(b.zone,80),created_at).run();
    return respond({id,created_at},201);
  }
  if(parts.length===3&&parts[0]==="api"&&parts[1]==="specimens"){
    if(request.method==="PATCH"){
      const b=await bodyOf(request),status=safe(b.status,30);
      if(!statuses.includes(status))return invalid("Invalid status");
      const r=await env.DB.prepare("UPDATE specimens SET status = ? WHERE id = ?").bind(status,parts[2]).run();
      return r.meta?.changes?respond({ok:true}):respond({error:"Not found"},404);
    }
    if(request.method==="DELETE"){
      const r=await env.DB.prepare("DELETE FROM specimens WHERE id = ?").bind(parts[2]).run();
      return r.meta?.changes?respond({ok:true}):respond({error:"Not found"},404);
    }
  }
  if(path==="/api/observations"&&request.method==="POST"){
    const b=await bodyOf(request),specimen_id=safe(b.specimen_id,100),type=safe(b.type,30);
    if(!specimen_id||!types.includes(type))return invalid("Invalid observation type or specimen");
    if(!await env.DB.prepare("SELECT id FROM specimens WHERE id = ?").bind(specimen_id).first())return invalid("Specimen not found");
    const id=crypto.randomUUID(),observed_at=new Date().toISOString();
    await env.DB.prepare("INSERT INTO observations (id,specimen_id,type,value,unit,notes,observed_at) VALUES (?,?,?,?,?,?,?)").bind(id,specimen_id,type,safe(b.value,50),safe(b.unit,20),safe(b.notes,500),observed_at).run();
    return respond({id,observed_at},201);
  }
  if(parts.length===3&&parts[0]==="api"&&parts[1]==="observations"&&request.method==="DELETE"){
    const r=await env.DB.prepare("DELETE FROM observations WHERE id = ?").bind(parts[2]).run();
    return r.meta?.changes?respond({ok:true}):respond({error:"Not found"},404);
  }
  return respond({error:"Not found"},404);
}
export default{async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(!path.startsWith("/api/"))return env.ASSETS.fetch(request);
  try{return await api(request,env,path);}
  catch(error){
    if(error instanceof SyntaxError||/Payload too large|Invalid object/.test(String(error)))return invalid("Malformed or oversized request");
    console.error("Bio-System API error",error instanceof Error?error.message:"Unknown");
    return respond({error:"Database operation failed"},500);
  }
}};
