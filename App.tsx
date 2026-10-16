import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, CheckCircle2, ChevronDown, CircleAlert, Database, Dna, FlaskConical, GitBranch, LayoutDashboard, Leaf, Lock, LogOut, Menu, Plus, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './styles.css';

type Status = 'Active' | 'Dormant' | 'Critical';
type Kingdom = 'Flora' | 'Fauna' | 'Fungi' | 'Microbe' | 'Other';
type View = 'overview' | 'specimens' | 'observations' | 'analytics' | 'pipeline' | 'settings';
type Specimen = { id:string; name:string; scientific_name:string; kingdom:Kingdom; status:Status; zone:string; created_at:string };
type Observation = { id:string; specimen_id:string; type:string; value:string; unit:string; notes:string; observed_at:string };
type SpecimenDraft = Omit<Specimen, 'id' | 'created_at'>;
type ObservationDraft = Omit<Observation, 'id' | 'observed_at'>;
const nav: {view:View; label:string; icon:React.ElementType}[] = [
  {view:'overview',label:'Overview',icon:LayoutDashboard},
  {view:'specimens',label:'Specimen registry',icon:Dna},
  {view:'observations',label:'Observations',icon:FlaskConical},
  {view:'analytics',label:'Analytics',icon:BarChart3},
  {view:'pipeline',label:'Data pipeline',icon:GitBranch},
  {view:'settings',label:'Settings',icon:Settings2}
];
const startingSpecimens:Specimen[] = [
 {id:'demo-01',name:'Coastal redwood',scientific_name:'Sequoia sempervirens',kingdom:'Flora',status:'Active',zone:'Greenhouse A',created_at:'2026-10-01T11:00:00Z'},
 {id:'demo-02',name:'Blue morpho',scientific_name:'Morpho peleides',kingdom:'Fauna',status:'Active',zone:'Habitat 02',created_at:'2026-10-02T11:00:00Z'},
 {id:'demo-03',name:'Oyster mushroom',scientific_name:'Pleurotus ostreatus',kingdom:'Fungi',status:'Dormant',zone:'Culture Lab',created_at:'2026-10-03T11:00:00Z'},
 {id:'demo-04',name:'Green algae',scientific_name:'Chlorella vulgaris',kingdom:'Microbe',status:'Active',zone:'Aquatic 01',created_at:'2026-10-04T11:00:00Z'},
 {id:'demo-05',name:'Venus flytrap',scientific_name:'Dionaea muscipula',kingdom:'Flora',status:'Critical',zone:'Greenhouse B',created_at:'2026-10-05T11:00:00Z'},
 {id:'demo-06',name:'Axolotl',scientific_name:'Ambystoma mexicanum',kingdom:'Fauna',status:'Active',zone:'Aquatic 02',created_at:'2026-10-06T11:00:00Z'}
];
const startingObservations:Observation[] = [
 {id:'obs-01',specimen_id:'demo-01',type:'Temperature',value:'21.4',unit:'°C',notes:'Stable conditions',observed_at:'2026-10-15T15:00:00Z'},
 {id:'obs-02',specimen_id:'demo-05',type:'Humidity',value:'31',unit:'%',notes:'Humidity needs attention',observed_at:'2026-10-15T13:00:00Z'},
 {id:'obs-03',specimen_id:'demo-04',type:'pH',value:'7.2',unit:'',notes:'Normal culture sample',observed_at:'2026-10-14T12:00:00Z'},
 {id:'obs-04',specimen_id:'demo-02',type:'Note',value:'',unit:'',notes:'Wing condition inspected',observed_at:'2026-10-14T08:30:00Z'}
];
const EMPTY_S:SpecimenDraft = {name:'',scientific_name:'',kingdom:'Flora',status:'Active',zone:''};
const EMPTY_O:ObservationDraft = {specimen_id:'',type:'Temperature',value:'',unit:'°C',notes:''};
const STORE = 'bio-system-local-demo-v3';
const WORKSPACE_KEY = 'bio-system-cloud-workspace-key-v1';
function newWorkspaceKey(){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
function loadLocal():{specimens:Specimen[];observations:Observation[]} {
 try{const raw=localStorage.getItem(STORE);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed.specimens)&&Array.isArray(parsed.observations))return parsed;}}catch{}
 return {specimens:startingSpecimens,observations:startingObservations};
}
function date(value:string){return new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function exportCsv(name:string,rows:string[][]) {
 const escapeCell=(value:string)=>{const safe=/^[=+\-@\t\r]/.test(value)?"'"+value:value;return '"'+safe.replace(/"/g,'""')+'"';};
 const data=rows.map(row=>row.map(v=>escapeCell(String(v))).join(',')).join('\r\n');
 const link=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
 link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Head({eyebrow,title,description,actions}:{eyebrow:string;title:string;description:string;actions?:React.ReactNode}){
 return <div className="heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="actions">{actions}</div></div>;
}
function Empty({message}:{message:string}){return <div className="empty"><FlaskConical size={26}/><strong>No records found</strong><span>{message}</span></div>;}
export default function App(){
 const [initial] = useState(loadLocal);
 const [specimens,setSpecimens]=useState<Specimen[]>(initial.specimens);
 const [observations,setObservations]=useState<Observation[]>(initial.observations);
 const [mode,setMode]=useState<'demo'|'live'>('demo');
 const [backend,setBackend]=useState(false);
 const [token,setToken]=useState('');
 const [tokenInput,setTokenInput]=useState('');
 const [view,setView]=useState<View>('overview');
 const [menuOpen,setMenuOpen]=useState(false);
 const [notice,setNotice]=useState('');
 const [modal,setModal]=useState<null|'specimen'|'observation'>(null);
 const [draftS,setDraftS]=useState<SpecimenDraft>(EMPTY_S);
 const [draftO,setDraftO]=useState<ObservationDraft>(EMPTY_O);
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState('All');
 const [busy,setBusy]=useState(false);
 const byId=useMemo(()=>new Map(specimens.map(s=>[s.id,s.name])),[specimens]);
 const active=specimens.filter(s=>s.status==='Active').length,critical=specimens.filter(s=>s.status==='Critical').length;
 const activePct=specimens.length?Math.round(active/specimens.length*100):0;
 const visible=specimens.filter(s=>(filter==='All'||s.status===filter||s.kingdom===filter)&&[s.name,s.scientific_name,s.id,s.zone].join(' ').toLowerCase().includes(search.toLowerCase()));
 const counts=[{name:'Active',value:active,color:'#a3e7b7'},{name:'Dormant',value:specimens.filter(s=>s.status==='Dormant').length,color:'#e9c47e'},{name:'Critical',value:critical,color:'#f18b82'}].filter(x=>x.value>0);
 const kingdomCounts=(['Flora','Fauna','Fungi','Microbe','Other'] as Kingdom[]).map(name=>({name,count:specimens.filter(s=>s.kingdom===name).length})).filter(x=>x.count>0);
 const weekly=Array.from({length:7},(_,i)=>{const day=new Date();day.setDate(day.getDate()-6+i);return {day:day.toLocaleDateString(undefined,{weekday:'short'}),count:observations.filter(o=>new Date(o.observed_at).toDateString()===day.toDateString()).length};});
 async function api(path:string,method='GET',data?:unknown,secret=token){
  const response=await fetch(path,{method,headers:{Authorization:'Bearer '+secret,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),cache:'no-store'});
  const json=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(json.error||'API request failed');
  return json;
 }
 async function refresh(secret=token){
  const state=await api('/api/state','GET',undefined,secret);
  setSpecimens(state.specimens);setObservations(state.observations);
 }
 async function connect(secret:string){
  if(!/^[a-f0-9]{64}$/i.test(secret.trim())){setNotice('Enter a valid 64-character private workspace recovery key.');return;}
  setBusy(true);
  try{await refresh(secret.trim());localStorage.setItem(WORKSPACE_KEY,secret.trim());sessionStorage.setItem('bio-system-access-token',secret.trim());setToken(secret.trim());setTokenInput('');setMode('live');setView('overview');setNotice('Connected to your private Cloudflare D1 workspace.');}
  catch(error){setNotice(error instanceof Error?error.message:'Connection failed');}
  finally{setBusy(false);}
 }
 useEffect(()=>{
  fetch('/api/health').then(r=>r.json()).then(data=>{
    setBackend(Boolean(data.configured));
    if(data.configured){
      const old=localStorage.getItem(WORKSPACE_KEY)||sessionStorage.getItem('bio-system-access-token');
      const key=old&&/^[a-f0-9]{64}$/i.test(old)?old:newWorkspaceKey();
      void connect(key);
    }
  }).catch(()=>setBackend(false));
 },[]);
 useEffect(()=>{if(mode==='demo'){try{localStorage.setItem(STORE,JSON.stringify({specimens,observations}));}catch{}}},[mode,specimens,observations]);
 function newSpecimen(){setDraftS({...EMPTY_S});setModal('specimen');}
 function newObservation(){if(!specimens.length){setNotice('Create a specimen first.');return;}setDraftO({...EMPTY_O,specimen_id:specimens[0].id});setModal('observation');}
 async function saveSpecimen(event:React.FormEvent){
  event.preventDefault();if(!draftS.name.trim())return;setBusy(true);
  try{if(mode==='live'){await api('/api/specimens','POST',draftS);await refresh();}else setSpecimens(list=>[{...draftS,id:crypto.randomUUID(),created_at:new Date().toISOString()},...list]);setModal(null);setNotice('Specimen saved.');}
  catch(error){setNotice(String(error));}finally{setBusy(false);}
 }
 async function saveObservation(event:React.FormEvent){
  event.preventDefault();setBusy(true);
  try{if(mode==='live'){await api('/api/observations','POST',draftO);await refresh();}else setObservations(list=>[{...draftO,id:crypto.randomUUID(),observed_at:new Date().toISOString()},...list]);setModal(null);setNotice('Observation saved.');}
  catch(error){setNotice(String(error));}finally{setBusy(false);}
 }
 async function changeStatus(id:string,status:Status){
  try{if(mode==='live'){await api('/api/specimens/'+encodeURIComponent(id),'PATCH',{status});await refresh();}else setSpecimens(list=>list.map(s=>s.id===id?{...s,status}:s));}
  catch(error){setNotice(String(error));}
 }
 async function remove(kind:'specimens'|'observations',id:string){
  if(!window.confirm('Delete this record'+(kind==='specimens'?' and its observations':'')+'?'))return;
  try{if(mode==='live'){await api('/api/'+kind+'/'+encodeURIComponent(id),'DELETE');await refresh();}
   else if(kind==='specimens'){setSpecimens(list=>list.filter(s=>s.id!==id));setObservations(list=>list.filter(o=>o.specimen_id!==id));}
   else setObservations(list=>list.filter(o=>o.id!==id));setNotice('Record removed.');}catch(error){setNotice(String(error));}
 }
 function exportSpecimens(){exportCsv('bio-system-specimens.csv',[['ID','Name','Scientific name','Kingdom','Status','Zone','Created'],...specimens.map(s=>[s.id,s.name,s.scientific_name,s.kingdom,s.status,s.zone,s.created_at])]);}
 function exportObservations(){exportCsv('bio-system-observations.csv',[['ID','Specimen','Type','Value','Unit','Notes','Recorded'],...observations.map(o=>[o.id,byId.get(o.specimen_id)||o.specimen_id,o.type,o.value,o.unit,o.notes,o.observed_at])]);}
 function disconnect(){
   if(!window.confirm('Switch to local demo mode? First copy your workspace recovery key to regain access later.'))return;
   localStorage.removeItem(WORKSPACE_KEY);sessionStorage.removeItem('bio-system-access-token');
   setToken('');setMode('demo');const local=loadLocal();setSpecimens(local.specimens);setObservations(local.observations);
   setNotice('Disconnected. Save your recovery key before leaving a cloud workspace.');
 }
 async function copyWorkspaceKey(){
   try{await navigator.clipboard.writeText(token);setNotice('Private recovery key copied. Store it securely to access your records from another device.');}
   catch{setNotice('Could not copy automatically. Check your browser clipboard permissions.');}
 }
 const buttonAdd=<button className="button primary" onClick={newSpecimen}><Plus size={16}/> Add specimen</button>;
 return <div className="shell">
  <aside className={'sidebar '+(menuOpen?'open':'')}>
   <div className="brand"><span className="brand-mark"><Dna size={25}/></span><div><strong>BIO<span> / SYSTEM</span></strong><small>RESEARCH OPERATIONS</small></div></div>
   <div className="workspace"><span className="workspace-logo"><Leaf size={18}/></span><div><strong>Ecology workspace</strong><small>Research environment</small></div><ChevronDown size={15}/></div>
   <span className="nav-label">WORKSPACE</span><nav aria-label="Workspace">{nav.slice(0,5).map(n=><button key={n.view} className={'nav-link '+(view===n.view?'selected':'')} onClick={()=>{setView(n.view);setMenuOpen(false);}}><n.icon size={18}/>{n.label}</button>)}</nav>
   <span className="nav-label secondary-label">PREFERENCES</span><nav><button className={'nav-link '+(view==='settings'?'selected':'')} onClick={()=>{setView('settings');setMenuOpen(false);}}><Settings2 size={18}/>Workspace settings</button></nav>
   <div className="sidebar-bottom"><div className="sidebar-state"><span className="led"/><div><strong>{mode==='live'?'Cloudflare connected':'Demo workspace'}</strong><small>{mode==='live'?'D1 storage active':'Local browser storage'}</small></div></div><div className="version">BIO-SYSTEM <span>v3.0</span></div></div>
  </aside>
  {menuOpen&&<button aria-label="Close navigation" className="shade" onClick={()=>setMenuOpen(false)}/>}
  <main className="main">
   <header className="topbar"><div className="breadcrumbs"><button className="menu-toggle" onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><span>Workspace</span><span className="slash">/</span><strong>{nav.find(n=>n.view===view)?.label}</strong></div><div className="topbar-right"><div className={'environment '+(mode==='demo'?'demo':'')}><span className="led"/>{mode==='live'?'CLOUD CONNECTED':'DEMO DATA'}</div><button className="avatar" title="Open settings" onClick={()=>setView('settings')}>BS</button></div></header>
   {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
   <div className="content">
    {view==='overview'&&<>
     <Head eyebrow="COMMAND CENTER / OVERVIEW" title="A living system, at a glance." description="Organize specimens, record observations, and keep research in view." actions={buttonAdd}/>
     {mode==='demo'&&<div className="banner"><CircleAlert size={18}/><span><strong>Sample workspace.</strong> These records are illustrative, not live sensors. Cloud storage connects automatically when available.</span><button onClick={()=>setView('settings')}>Connect D1 <ArrowRight size={15}/></button></div>}
     <div className="hero"><div className="hero-copy"><span className="eyebrow">● ECOSYSTEM INTELLIGENCE</span><h2>Your ecosystem.<br/><em>Beautifully observed.</em></h2><p>One workspace for biological assets, field notes and habitat health.</p><button onClick={newObservation}>Record an observation <ArrowRight size={17}/></button></div><div className="orbital"><div className="orbit first"/><div className="orbit second"/><div className="orbit third"/><div className="nucleus"><Dna size={55}/></div><span className="orbit-dot dot1"/><span className="orbit-dot dot2"/></div><span className="hero-footer">01 / BIOLOGICAL OBSERVABILITY</span></div>
     <div className="metrics">{[
      {label:'Tracked specimens',value:specimens.length,detail:'Across '+kingdomCounts.length+' groups',icon:Dna,color:'mint'},
      {label:'Active specimens',value:active,detail:activePct+'% marked active',icon:Activity,color:'blue'},
      {label:'Needs attention',value:critical,detail:'Critical specimen status',icon:CircleAlert,color:'amber'},
      {label:'Observations',value:observations.length,detail:'Measurements and field notes',icon:FlaskConical,color:'purple'}
     ].map(m=><div className="metric" key={m.label}><div className="metric-title">{m.label}<span className={'metric-icon '+m.color}><m.icon size={18}/></span></div><strong>{m.value}</strong><p>{m.detail}</p><span className={'metric-underline '+m.color}/></div>)}</div>
     <div className="two-cols"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Observation feed</h3></div><button className="link-button" onClick={()=>setView('observations')}>View all <ArrowRight size={15}/></button></div><div className="feed">{observations.slice(0,5).map(o=><div className="feed-row" key={o.id}><span className="feed-icon"><FlaskConical size={16}/></span><div><strong>{byId.get(o.specimen_id)||'Unknown specimen'}</strong><small>{o.type+(o.value?' · '+o.value+' '+o.unit:'')}</small></div><time>{date(o.observed_at)}</time></div>)}{!observations.length&&<Empty message="Log the first observation."/>}</div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">SYSTEM DISTRIBUTION</span><h3>Specimen status</h3></div><span className="tiny-label">{specimens.length} TOTAL</span></div><div className="status-chart"><div className="donut"><ResponsiveContainer><PieChart><Pie data={counts} dataKey="value" innerRadius={62} outerRadius={82} stroke="none" paddingAngle={3}>{counts.map(c=><Cell key={c.name} fill={c.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="donut-label"><strong>{activePct}%</strong><span>Active</span></div></div><div className="legend">{counts.map(c=><div key={c.name}><i style={{background:c.color}}/>{c.name}<strong>{c.value}</strong></div>)}</div></div></section></div>
    </>}
    {view==='specimens'&&<>
     <Head eyebrow="RESEARCH / INVENTORY" title="Specimen registry" description="A searchable, editable catalogue of everything you're tracking." actions={<><button className="button outline" onClick={exportSpecimens}><ArrowDownToLine size={16}/> Export CSV</button>{buttonAdd}</>}/>
     <section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><input aria-label="Search specimens" placeholder="Search name, zone or ID..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filter"><SlidersHorizontal size={15}/><select aria-label="Filter specimens" value={filter} onChange={e=>setFilter(e.target.value)}>{['All','Active','Dormant','Critical','Flora','Fauna','Fungi','Microbe','Other'].map(s=><option key={s}>{s}</option>)}</select></div><span className="tiny-label">{visible.length} RESULTS</span></div><div className="table-scroll"><table><thead><tr><th>SPECIMEN</th><th>KINGDOM</th><th>ZONE</th><th>STATUS</th><th>ADDED</th><th/></tr></thead><tbody>{visible.map(s=><tr key={s.id}><td><div className="specimen-name"><span><Dna size={18}/></span><div><strong>{s.name}</strong><small>{s.scientific_name||s.id}</small></div></div></td><td>{s.kingdom}</td><td>{s.zone||'Unassigned'}</td><td><select aria-label={'Status of '+s.name} className={'status-choice '+s.status.toLowerCase()} value={s.status} onChange={e=>void changeStatus(s.id,e.target.value as Status)}>{['Active','Dormant','Critical'].map(k=><option key={k}>{k}</option>)}</select></td><td>{date(s.created_at)}</td><td><button className="icon-btn" title={'Delete '+s.name} aria-label={'Delete '+s.name} onClick={()=>void remove('specimens',s.id)}><Trash2 size={17}/></button></td></tr>)}</tbody></table></div>{!visible.length&&<Empty message="Adjust filters or create a specimen."/>}<div className="table-foot">Showing {visible.length} of {specimens.length} specimens <span>{mode==='live'?'Cloudflare D1':'Local demo'}</span></div></section>
    </>}
    {view==='observations'&&<>
     <Head eyebrow="RESEARCH / FIELD NOTES" title="Observation log" description="Measurements and notes tied to tracked specimens." actions={<><button className="button outline" onClick={exportObservations}><ArrowDownToLine size={16}/> Export CSV</button><button className="button primary" onClick={newObservation} disabled={!specimens.length}><Plus size={16}/> New observation</button></>}/>
     <section className="panel"><div className="panel-heading"><div><span className="eyebrow">CHRONOLOGICAL RECORD</span><h3>Recorded observations</h3></div><span className="tiny-label">{observations.length} ENTRIES</span></div><div className="table-scroll"><table><thead><tr><th>SPECIMEN</th><th>TYPE</th><th>READING</th><th>NOTES</th><th>DATE</th><th/></tr></thead><tbody>{observations.map(o=><tr key={o.id}><td><strong>{byId.get(o.specimen_id)||'Unknown'}</strong></td><td><span className="type-chip">{o.type}</span></td><td><strong>{o.value?o.value+' '+o.unit:'—'}</strong></td><td className="notes">{o.notes||'—'}</td><td>{date(o.observed_at)}</td><td><button className="icon-btn" aria-label="Delete observation" onClick={()=>void remove('observations',o.id)}><Trash2 size={17}/></button></td></tr>)}</tbody></table></div>{!observations.length&&<Empty message="Add a new observation to get started."/>}</section>
    </>}
    {view==='analytics'&&<>
     <Head eyebrow="INTELLIGENCE / ANALYTICS" title="Biological insights" description="Charts calculated from your recorded specimens and observations."/>
     <div className="metrics three">{[{label:'SPECIMENS',value:specimens.length},{label:'OBSERVATIONS',value:observations.length},{label:'ACTIVE RATE',value:activePct+'%'}].map(m=><div className="metric" key={m.label}><span className="eyebrow">{m.label}</span><strong>{m.value}</strong></div>)}</div>
     <div className="two-cols charts"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">PAST 7 DAYS</span><h3>Observation activity</h3></div></div><div className="chart"><ResponsiveContainer><AreaChart data={weekly} margin={{top:12,right:18,bottom:8,left:-22}}><defs><linearGradient id="greenarea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#92e6b6" stopOpacity={0.35}/><stop offset="100%" stopColor="#92e6b6" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#284333" strokeDasharray="4 6"/><XAxis dataKey="day" stroke="#8da795" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} stroke="#8da795" tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={{background:'#15251b',border:'1px solid #335742',color:'#eaf3ec'}}/><Area dataKey="count" name="Observations" type="monotone" stroke="#9deabb" fill="url(#greenarea)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">CLASSIFICATION</span><h3>Specimens by kingdom</h3></div></div><div className="chart"><ResponsiveContainer><BarChart data={kingdomCounts} margin={{top:12,right:18,bottom:8,left:-22}}><CartesianGrid vertical={false} stroke="#284333" strokeDasharray="4 6"/><XAxis dataKey="name" stroke="#8da795" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} stroke="#8da795" tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={{background:'#15251b',border:'1px solid #335742',color:'#eaf3ec'}}/><Bar dataKey="count" name="Specimens" fill="#8dddab" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></section></div>
     <div className="hint"><CircleAlert size={17}/> This app logs manual observations, not live sensor telemetry. Trends show recorded activity only.</div>
    </>}
    {view==='pipeline'&&<>
     <Head eyebrow="INFRASTRUCTURE / DATA FLOW" title="Built for the edge" description="A small, free-tier-friendly architecture from browser to Cloudflare."/>
     <div className="pipeline">{[
      {step:'01 / CLIENT',title:'Research workspace',icon:Leaf,description:'Responsive React interface with locally stored demonstration data.'},
      {step:'02 / COMPUTE',title:'Worker API',icon:ShieldCheck,description:'Validated, token-authenticated requests executed on Cloudflare.'},
      {step:'03 / STORAGE',title:'D1 database',icon:Database,description:'Relational records, foreign keys, and versioned schema migrations.'},
      {step:'04 / DELIVERY',title:'GitHub Actions',icon:GitBranch,description:'CI tests pull requests and deploys master after credentials are configured.'}
     ].map(item=><div className="pipeline-card" key={item.step}><span className="eyebrow">{item.step}</span><div className="pipeline-icon"><item.icon size={27}/></div><h3>{item.title}</h3><p>{item.description}</p></div>)}</div>
     <section className="panel pipeline-info"><div><span className="eyebrow">CURRENT MODE</span><h3>{mode==='live'?'Persistent Cloudflare storage':'Local browser demonstration'}</h3><p>{mode==='live'?'Authorized requests are saved in D1.':'Examples and edits stay in browser localStorage until you connect a production backend.'}</p></div><button className="button outline" onClick={()=>setView('settings')}>Connection settings <ArrowRight size={16}/></button></section>
    </>}
    {view==='settings'&&<>
     <Head eyebrow="PREFERENCES / CONNECTION" title="Workspace settings" description="Control storage, session access, exports, and sample data."/>
     <div className="settings-grid"><section className="panel settings-card"><span className="eyebrow">CLOUDFLARE CONNECTION</span><h3>Storage & authentication</h3><p>Cloudflare D1 stores private workspaces protected by unique 256-bit recovery keys automatically generated in your browser.</p><div className="connection"><span><Lock size={22}/></span><div><strong>{mode==='live'?'Cloudflare D1 connected':backend?'Backend available':'Demo only'}</strong><small>{mode==='live'?'Reads and writes are persistent':backend?'Your workspace key is generated automatically':'Configure the Cloudflare Worker and D1 database'}</small></div></div><div className="settings-buttons">{mode==='live'&&<button type="button" onClick={()=>void copyWorkspaceKey()}><ShieldCheck size={17}/> Copy private recovery key <ArrowDownToLine size={16}/></button>}{mode==='live'&&<button type="button" className="danger" onClick={disconnect}><LogOut size={17}/> Switch to local demo <ArrowRight size={16}/></button>}</div><form onSubmit={e=>{e.preventDefault();void connect(tokenInput);}}><label>Restore another workspace using its recovery key<input type="password" className="field" autoComplete="off" value={tokenInput} onChange={e=>setTokenInput(e.target.value)} placeholder="Paste your 64-character workspace key" /></label><small className="helper">Keep your recovery key private. Losing it means losing access to that cloud workspace.</small><button className="button primary full" type="submit" disabled={busy||!tokenInput.trim()}><ShieldCheck size={16}/>{busy?'Connecting…':'Open private workspace'}</button></form></section><section className="panel settings-card"><span className="eyebrow">DATA MANAGEMENT</span><h3>Export & local data</h3><p>Download research records as CSV. Reset only affects the browser demonstration.</p><div className="settings-buttons"><button onClick={exportSpecimens}><Database size={17}/> Export specimens <ArrowDownToLine size={16}/></button><button onClick={exportObservations}><FlaskConical size={17}/> Export observations <ArrowDownToLine size={16}/></button>{mode==='demo'&&<button className="danger" onClick={()=>{if(window.confirm('Reset your local demo data?')){setSpecimens(startingSpecimens);setObservations(startingObservations);setNotice('Local demo reset.');}}}><RefreshCw size={17}/> Reset sample workspace <ArrowRight size={16}/></button>}</div></section></div><div className="hint"><ShieldCheck size={17}/> Free-tier Workers and D1, with GitHub Actions. Workspace keys are stored locally in your browser. This is not a medical diagnostic tool.</div>
    </>}
   </div>
  </main>
  {modal&&<div className="modal-shade" onMouseDown={()=>setModal(null)}><div className="modal" role="dialog" aria-modal="true" aria-label={modal==='specimen'?'Add specimen':'Record observation'} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">BIO-SYSTEM / NEW RECORD</span><h2>{modal==='specimen'?'Add a specimen':'Record an observation'}</h2></div><button className="icon-btn" onClick={()=>setModal(null)} aria-label="Close"><X size={21}/></button></div>{modal==='specimen'?<form onSubmit={e=>void saveSpecimen(e)}><div className="form-grid"><label className="wide">Common name<input required autoFocus maxLength={120} className="field" value={draftS.name} onChange={e=>setDraftS(d=>({...d,name:e.target.value}))} placeholder="Coastal redwood"/></label><label className="wide">Scientific name<input maxLength={120} className="field" value={draftS.scientific_name} onChange={e=>setDraftS(d=>({...d,scientific_name:e.target.value}))} placeholder="Sequoia sempervirens"/></label><label>Kingdom<select className="field" value={draftS.kingdom} onChange={e=>setDraftS(d=>({...d,kingdom:e.target.value as Kingdom}))}>{['Flora','Fauna','Fungi','Microbe','Other'].map(v=><option key={v}>{v}</option>)}</select></label><label>Status<select className="field" value={draftS.status} onChange={e=>setDraftS(d=>({...d,status:e.target.value as Status}))}>{['Active','Dormant','Critical'].map(v=><option key={v}>{v}</option>)}</select></label><label className="wide">Location / zone<input maxLength={80} className="field" value={draftS.zone} onChange={e=>setDraftS(d=>({...d,zone:e.target.value}))} placeholder="Greenhouse A"/></label></div><div className="modal-footer"><button type="button" className="button outline" onClick={()=>setModal(null)}>Cancel</button><button className="button primary" type="submit" disabled={busy}><Plus size={16}/>{busy?'Saving…':'Add specimen'}</button></div></form>:<form onSubmit={e=>void saveObservation(e)}><div className="form-grid"><label className="wide">Specimen<select className="field" required value={draftO.specimen_id} onChange={e=>setDraftO(d=>({...d,specimen_id:e.target.value}))}>{specimens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className="wide">Observation type<select className="field" value={draftO.type} onChange={e=>setDraftO(d=>({...d,type:e.target.value}))}>{['Temperature','Humidity','pH','Growth','Note'].map(v=><option key={v}>{v}</option>)}</select></label><label>Value<input className="field" maxLength={50} value={draftO.value} onChange={e=>setDraftO(d=>({...d,value:e.target.value}))} placeholder="21.4"/></label><label>Unit<input className="field" maxLength={20} value={draftO.unit} onChange={e=>setDraftO(d=>({...d,unit:e.target.value}))} placeholder="°C"/></label><label className="wide">Notes<textarea className="field" rows={4} maxLength={500} value={draftO.notes} onChange={e=>setDraftO(d=>({...d,notes:e.target.value}))} placeholder="Details of the observation..."/></label></div><div className="modal-footer"><button type="button" className="button outline" onClick={()=>setModal(null)}>Cancel</button><button className="button primary" type="submit" disabled={busy}><CheckCircle2 size={16}/>{busy?'Saving…':'Save observation'}</button></div></form>}</div></div>}
 </div>;
}
