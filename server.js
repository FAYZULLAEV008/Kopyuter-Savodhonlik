#!/usr/bin/env node
/* Kompyuter Savodxonligi serveri — tashqi kutubxonasiz (Node 18+). Ishga tushirish: node server.js */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const PORT=+process.env.PORT||3000,ROOT=__dirname,DD=path.join(ROOT,'data'),DBF=path.join(DD,'db.json'),SF=path.join(DD,'secret'),KEY=process.env.ANTHROPIC_API_KEY||'';
fs.mkdirSync(DD,{recursive:true});
const SECRET=fs.existsSync(SF)?fs.readFileSync(SF,'utf8'):(()=>{const s=crypto.randomBytes(32).toString('hex');fs.writeFileSync(SF,s,{mode:0o600});return s})();
const ctx=()=>{const c={};vm.createContext(c);['course20.js','seed.js','course40.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f),'utf8'),c));return c};
const patched=d=>{const c=ctx();c.DB=d;vm.runInContext('patchDB()',c);return JSON.parse(JSON.stringify(c.DB))}; // eski bazani yangi versiyaga o‘tkazadi
function initial(){const c=ctx();vm.runInContext("DB={v:4,session:null,log:[],prog:{},enr:[],att:[],sub:[],jr:{},users:[],courses:[buildCourse20()]};patchDB();",c);return JSON.parse(JSON.stringify(c.DB))}
let DB=fs.existsSync(DBF)?patched(JSON.parse(fs.readFileSync(DBF,'utf8'))):initial();
const flush=()=>{const t=DBF+'.tmp';fs.writeFileSync(t,JSON.stringify(DB));fs.renameSync(t,DBF)};flush();
const hash=(p,s=crypto.randomBytes(16).toString('hex'))=>s+':'+crypto.scryptSync(p,s,32).toString('hex');
const chk=(p,h)=>h.includes(':')?crypto.timingSafeEqual(Buffer.from(h.split(':')[1],'hex'),crypto.scryptSync(p,h.split(':')[0],32)):crypto.createHash('sha256').update(p).digest('hex')===h; // eski sha256 hashlar ham qabul qilinadi va kirishda yangilanadi
const hm=p=>crypto.createHmac('sha256',SECRET).update(p).digest('hex');
const sign=id=>{const p=id+'.'+(Date.now()+7*864e5);return p+'.'+hm(p)};
const who=req=>{const a=(req.headers.authorization||'').slice(7).split('.');if(a.length!==3||hm(a[0]+'.'+a[1])!==a[2]||+a[1]<Date.now())return null;const u=DB.users.find(x=>x.id===a[0]);return u&&u.on?u:null};
const hits=new Map();const limit=(k,n,ms)=>{const t=Date.now(),a=(hits.get(k)||[]).filter(x=>t-x<ms);a.push(t);hits.set(k,a);return a.length>n};
const send=(res,c,o)=>{res.writeHead(c,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(o))};
const body=req=>new Promise((ok,no)=>{let b='';req.on('data',d=>{b+=d;if(b.length>5e6){no(new Error('big'));req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(e){no(e)}})});
const isOwn=(c,id)=>c.owner===id||(Array.isArray(c.owner)&&c.owner.includes(id));
const ROLES=['student','teacher','admin'];
function view(u){const id=u.id,st=u.role==='student',own=k=>k.startsWith(id+':'),pick=o=>Object.fromEntries(Object.entries(o).filter(([k])=>own(k)));
return{v:4,session:id,log:u.role==='admin'?DB.log:[],courses:st?DB.courses.filter(c=>c.published):DB.courses,
users:DB.users.filter(x=>!st||x.id===id||x.role!=='student').map(({pw,...r})=>r),
prog:st?pick(DB.prog):DB.prog,enr:st?DB.enr.filter(e=>e.u===id):DB.enr,att:st?DB.att.filter(a=>a.u===id):DB.att,sub:st?DB.sub.filter(s=>s.u===id):DB.sub,
jr:st?Object.fromEntries(Object.entries(DB.jr||{}).filter(([k])=>k.includes(':'+id+':'))):DB.jr||{}}}
function merge(u,b){const id=u.id,own=k=>k.startsWith(id+':');
if(u.role==='student'){for(const k in DB.prog)if(own(k))delete DB.prog[k];for(const k in b.prog||{})if(own(k)&&Array.isArray(b.prog[k]))DB.prog[k]=b.prog[k];
DB.enr=DB.enr.filter(e=>e.u!==id).concat((b.enr||[]).filter(e=>e.u===id&&DB.courses.some(c=>c.id===e.c&&c.published)));
const ha=new Set(DB.att.map(a=>a.id));DB.att.push(...(b.att||[]).filter(a=>a.u===id&&!ha.has(a.id)).map(a=>({...a,pct:Math.max(0,Math.min(100,+a.pct||0))})));
const hs=new Set(DB.sub.map(s=>s.id));DB.sub.push(...(b.sub||[]).filter(s=>s.u===id&&!hs.has(s.id)).map(s=>({...s,grade:null,comment:''})));return}
if(!Array.isArray(b.courses))return;
if(u.role==='admin'){DB.courses=b.courses;DB.jr=b.jr||{};DB.log=b.log||DB.log;DB.sub=b.sub||DB.sub;DB.enr=b.enr||DB.enr;
for(const x of b.users||[]){const y=DB.users.find(z=>z.id===x.id);if(y&&y.id!==id){if(ROLES.includes(x.role))y.role=x.role;y.on=!!x.on}}return}
const ex=new Map(DB.courses.map(c=>[c.id,c])),mine=new Set(DB.courses.filter(c=>isOwn(c,id)).map(c=>c.id)),okc=b.courses.filter(c=>ex.has(c.id)?isOwn(ex.get(c.id),id):c.owner===id).map(c=>ex.has(c.id)?{...c,owner:ex.get(c.id).owner}:c);
DB.courses=DB.courses.filter(c=>!isOwn(c,id)).concat(okc);okc.forEach(c=>mine.add(c.id));
for(const s of b.sub||[]){const x=DB.sub.find(y=>y.id===s.id);if(x&&mine.has(x.c)){x.grade=s.grade;x.comment=String(s.comment||'')}}
for(const k in DB.jr)if(mine.has(k.split(':')[0])&&!(k in(b.jr||{})))delete DB.jr[k];for(const k in b.jr||{})if(mine.has(k.split(':')[0]))DB.jr[k]=b.jr[k]}
function rank(){return DB.users.filter(u=>u.role==='student'&&u.on).map(u=>{const d=Object.keys(DB.prog).filter(k=>k.startsWith(u.id+':')).reduce((n,k)=>n+DB.prog[k].length,0),a=DB.att.filter(x=>x.u===u.id),avg=a.length?Math.round(a.reduce((s,x)=>s+x.pct,0)/a.length):0;return{name:u.name,done:d,avg}}).sort((a,b)=>b.done*10+b.avg-a.done*10-a.avg).slice(0,20)}
async function api(req,res,url){const m=req.method,ip=req.socket.remoteAddress;
if(url==='/api/ping')return send(res,200,{ok:true,admin:DB.users.some(u=>u.role==='admin')});
if(url==='/api/auth'&&m==='POST'){const b=await body(req),e=String(b.email||'').trim().toLowerCase(),p=String(b.password||'');
if(limit('a'+ip+e,10,6e5))return send(res,429,{error:'Juda ko‘p urinish. Biroz kuting'});
if(!/^\S+@\S+\.\S+$/.test(e)||p.length<6)return send(res,400,{error:'To‘g‘ri email va kamida 6 belgili parol kiriting'});
if(b.register){const nm=String(b.name||'').trim().slice(0,80);if(nm.length<2)return send(res,400,{error:'Ismni kiriting'});if(DB.users.some(x=>x.email===e))return send(res,409,{error:'Bu email band'});
const u={id:crypto.randomBytes(5).toString('hex'),name:nm,email:e,pw:hash(p),role:DB.users.some(x=>x.role==='admin')?'student':'admin',on:true};DB.users.push(u);flush();return send(res,200,{token:sign(u.id)})}
const u=DB.users.find(x=>x.email===e);if(!u||!chk(p,u.pw))return send(res,401,{error:'Email yoki parol noto‘g‘ri'});if(!u.on)return send(res,403,{error:'Hisobingiz bloklangan'});
if(!u.pw.includes(':')){u.pw=hash(p);flush()}return send(res,200,{token:sign(u.id)})}
const u=who(req);if(!u)return send(res,401,{error:'Qayta kiring'});
if(url==='/api/db'&&m==='GET')return send(res,200,view(u));
if(url==='/api/db'&&m==='PUT'){merge(u,await body(req));flush();return send(res,200,{ok:true})}
if(url==='/api/rank')return send(res,200,rank());
if(url==='/api/passwd'&&m==='POST'){const b=await body(req);if(limit('p'+u.id,10,6e5))return send(res,429,{error:'Juda ko‘p urinish'});if(!chk(String(b.old||''),u.pw))return send(res,400,{error:'Joriy parol noto‘g‘ri'});if(String(b.new||'').length<6)return send(res,400,{error:'Parol kamida 6 belgi'});u.pw=hash(String(b.new));flush();return send(res,200,{ok:true})}
if(url==='/api/reset'&&m==='POST'){if(u.role!=='admin')return send(res,403,{error:'Ruxsat yo‘q'});const b=await body(req),t=DB.users.find(x=>x.id===b.id);if(!t||String(b.password||'').length<6)return send(res,400,{error:'Noto‘g‘ri so‘rov'});t.pw=hash(String(b.password));flush();return send(res,200,{ok:true})}
if(url==='/api/chat'&&m==='POST'){if(!KEY)return send(res,503,{error:'AI serverda yoqilmagan (ANTHROPIC_API_KEY)'});if(limit('c'+u.id,30,36e5))return send(res,429,{error:'Soatiga 30 ta savol limiti'});
const b=await body(req),r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:Math.min(+b.max_tokens||700,800),system:String(b.system||'').slice(0,4000),messages:(b.messages||[]).slice(-10)})});return send(res,r.status,await r.json())}
send(res,404,{error:'Topilmadi'})}
const MT={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{try{const url=decodeURIComponent(req.url.split('?')[0]);if(url.startsWith('/api/'))return await api(req,res,url);
const f=path.normalize(path.join(ROOT,url==='/'?'index.html':url));
if(!f.startsWith(ROOT+path.sep)||/[\\/](data|node_modules)[\\/]|server\.js$|package\.json$/.test(f)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end('Topilmadi')}
res.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream','x-content-type-options':'nosniff'});fs.createReadStream(f).pipe(res)}catch(e){send(res,500,{error:'Server xatosi'})}}).listen(PORT,()=>console.log('Server: http://localhost:'+PORT+(KEY?' (AI yoqilgan)':' (AI o‘chiq: ANTHROPIC_API_KEY yo‘q)')));
