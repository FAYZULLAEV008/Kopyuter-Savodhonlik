const KEY='kl_db_v4',VER=4;let DB,SRV=false,TOKEN='';try{TOKEN=localStorage.getItem('kl_tok')||''}catch(e){}
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
/* Server rejimi: sayt `node server.js` orqali ochilsa baza serverda saqlanadi. index.html to‘g‘ridan-to‘g‘ri ochilsa — brauzer rejimi. */
async function api(p,o={}){const r=await fetch('/api/'+p,{...o,headers:{'content-type':'application/json',...(TOKEN?{authorization:'Bearer '+TOKEN}:{})}});const d=await r.json().catch(()=>({}));
if(!r.ok){if(r.status===401&&TOKEN){TOKEN='';try{localStorage.removeItem('kl_tok')}catch(e){}}throw new Error(d.error||('Xato '+r.status))}return d}
const push=()=>api('db',{method:'PUT',body:JSON.stringify(DB)});
async function pull(){if(save.t){clearTimeout(save.t);save.t=0;try{await push()}catch(e){}}
if(TOKEN){try{DB=await api('db');return}catch(e){}}let a=false;try{a=(await api('ping')).admin}catch(e){}
DB={v:VER,session:null,log:[],prog:{},enr:[],att:[],sub:[],jr:{},courses:[],users:a?[{id:'-',role:'admin'}]:[]}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.v===VER)return d}catch(e){}return null}
function save(){if(SRV){clearTimeout(save.t);save.t=setTimeout(()=>{save.t=0;push().catch(()=>toast('Server bilan aloqa yo‘q'))},500);return}
try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){toast('Saqlab bo‘lmadi (xotira to‘lgan bo‘lishi mumkin)')}}
function log(t){DB.log.unshift({t,d:Date.now(),u:DB.session});DB.log=DB.log.slice(0,100)}
async function initDB(){try{const r=await fetch('/api/ping');SRV=r.ok&&(r.headers.get('content-type')||'').includes('json')}catch(e){}
if(SRV){await pull();return}
DB=load();try{navigator.storage?.persist?.()}catch(e){}if(DB){patchDB();save();return}
DB={v:VER,session:null,log:[],prog:{},enr:[],att:[],sub:[],users:[],courses:[buildCourse20()]};patchDB();save()}
function resetDB(){if(SRV)return toast('Server rejimida tiklash o‘chirilgan: data/db.json ni o‘chiring');localStorage.removeItem(KEY);location.reload()}
