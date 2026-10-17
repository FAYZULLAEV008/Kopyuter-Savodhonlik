/* Bosh sahifa (kirishdan oldin), 40 mavzuli onlayn darslik va testga ulanish.
   app.js dan KEYIN yuklanadi: render/authView ni o‘raydi, NAV va ST/T/A ga “Darslik” bo‘limini qo‘shadi. */
const TITLES=[...L20,...L20B].map(l=>l[0]),QN=[...L20,...L20B].map(l=>l[2].length);
const MODS=[['Kompyuter va Windows',1,4,'🖥️'],['Microsoft Word',5,7,'📝'],['Microsoft Excel',8,12,'📊'],['PowerPoint',13,15,'📽️'],
['Internet, xavfsizlik va yakuniy loyiha',16,20,'🌐'],['Internet va onlayn xavfsizlik',21,25,'🔐'],['Fayllar va Google xizmatlari',26,30,'☁️'],
['Muloqot va dizayn',31,36,'💬'],['Qurilmalar, tarmoq va sun’iy intellekt',37,40,'🤖']];
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code class="k">$1</code>');
const modOf=n=>MODS.find(m=>n>=m[1]&&n<=m[2]);
const readMin=n=>Math.max(1,Math.round(JSON.stringify(BOOK[n-1]).split(/\s+/).length/150));

/* “o‘qilgan” belgisi shu brauzerda saqlanadi; ✅ esa testdan o‘tilganini bildiradi (DB.prog) */
const rdKey=()=>'kl_read_'+(DB.session||'guest');
const readSet=()=>{try{return new Set(JSON.parse(localStorage.getItem(rdKey())||'[]'))}catch(e){return new Set()}};
function markRead(n){try{const s=readSet();if(!s.has(n)){s.add(n);localStorage.setItem(rdKey(),JSON.stringify([...s]))}}catch(e){}}
const passed=n=>{const u=me();return !!u&&(DB.prog[u.id+':c20']||[]).includes('l'+n)};

/* ---------- ro‘yxat (landing va ichki bo‘lim uchun umumiy) ---------- */
function modulesHTML(){const rd=readSet(),q=(S.bq||'').toLowerCase();
 return MODS.map(([nm,a,b,ic])=>{const items=[];for(let n=a;n<=b;n++)if(!q||(TITLES[n-1]+' '+n).toLowerCase().includes(q))items.push(n);
  if(!items.length)return'';
  return`<section class="mod"><h3><span class="mi">${ic}</span> ${esc(nm)} <span class="mu">· ${a}–${b}-mavzu</span></h3><div class="chgrid">${items.map(n=>
   `<a class="chc ${passed(n)?'ok':rd.has(n)?'rd':''}" tabindex="0" onclick="openChap(${n})" onkeydown="if(event.key==='Enter')openChap(${n})">
    <span class="cn">${n}</span><span class="ct">${esc(TITLES[n-1])}</span>
    <span class="cm2">${readMin(n)} daq · ${QN[n-1]} savol ${passed(n)?'· ✅ test topshirilgan':rd.has(n)?'· 📖 o‘qilgan':''}</span></a>`).join('')}</div></section>`}).join('')||'<div class="card mu">Hech narsa topilmadi.</div>'}
function bookFilter(v){S.bq=v;const e=$('#mods');if(e)e.innerHTML=modulesHTML()}

function landingView(){const tq=QN.reduce((a,b)=>a+b,0);
 return`<div class="land"><header class="lnav"><b>💻 Kompyuter Savodxonligi</b><span><button class="b2" onclick="theme()" aria-label="Light/Dark rejim">◐</button> <button onclick="S.gp='auth';S.reg=false;render()">Kirish</button></span></header>
 <section class="hero"><span class="tag">📖 Onlayn darslik · test · sertifikat</span><h1>Kompyuter savodxonligi</h1>
 <p>Windows, Word, Excel, PowerPoint, internet va xavfsizlik — ${BOOK.length} ta mavzuni qadamma-qadam o‘qing va har bir mavzudan so‘ng testdan o‘ting.</p>
 <div class="hb"><button onclick="document.getElementById('mods').scrollIntoView({behavior:'smooth'})">📖 Darslikni o‘qish</button><button class="b2" onclick="S.gp='auth';S.reg=true;render()">Ro‘yxatdan o‘tish</button></div>
 <div class="hs"><div><b>${BOOK.length}</b>mavzu</div><div><b>${tq}</b>test savoli</div><div><b>${PASS}%</b>o‘tish bali</div></div></section>
 <section class="steps"><div class="card"><b>1 · O‘qing</b><p class="mu">Har bir mavzu qisqa, tushunarli va misollar bilan yozilgan. Ro‘yxatdan o‘tmasdan ham o‘qiy olasiz.</p></div>
 <div class="card"><b>2 · Test yeching</b><p class="mu">Mavzudan keyin test: ${PASS}% va undan yuqori natija mavzuni “o‘tildi” deb belgilaydi.</p></div>
 <div class="card"><b>3 · Natijangizni ko‘ring</b><p class="mu">Jurnal, reyting va kurs oxirida sertifikat — ro‘yxatdan o‘tgan o‘quvchilar uchun.</p></div></section>
 <h2 class="lh">Darslik mundarijasi</h2><input class="bs" placeholder="🔎 Mavzu qidirish…" value="${esc(S.bq||'')}" oninput="bookFilter(this.value)" aria-label="Mavzu qidirish"><div id="mods">${modulesHTML()}</div>
 <footer class="mu" style="text-align:center;padding:24px 0">© Kompyuter Savodxonligi</footer></div>`}

/* ---------- bob sahifasi ---------- */
function chapView(n){const b=BOOK[n-1],t=TITLES[n-1],u=me(),m=modOf(n),qn=QN[n-1];markRead(n);
 const test=!u?`<button onclick="bookTest(${n})">🔐 Test uchun kirish</button>`:u.role==='student'?`<button onclick="bookTest(${n})">📝 Testni boshlash (${qn} savol)</button>`:`<span class="mu">Test o‘quvchilar uchun</span>`;
 return`<article class="book"><button class="b2" onclick="closeChap()">← Barcha mavzular</button>
 <div class="bh"><span class="tag">${m[3]} ${esc(m[0])}</span><span class="mu">${n} / ${BOOK.length} · ⏱ ${readMin(n)} daqiqa</span></div>${bar(n/BOOK.length*100)}
 <h2>${n}-mavzu. ${esc(t)}</h2>${passed(n)?'<span class="tag">✅ Test topshirilgan</span>':''}
 <p class="lead">${fmt(b.lead)}</p>
 ${b.sec.map(([h,x])=>`<h3>${esc(h)}</h3>${Array.isArray(x)?`<ul>${x.map(i=>`<li>${fmt(i)}</li>`).join('')}</ul>`:`<p>${fmt(x)}</p>`}`).join('')}
 <div class="tipb"><b>💡 Maslahat.</b> ${fmt(b.tip)}</div>
 <div class="card cta"><div><b>Bilimingizni sinab ko‘ring</b><div class="mu">${qn} ta savol · o‘tish bali ${PASS}%</div></div>${test}</div>
 <div class="row"><button class="b2" ${n<2?'disabled':''} onclick="openChap(${n-1})">← ${n>1?esc(TITLES[n-2]):'Oldingi'}</button><button class="b2" ${n>=BOOK.length?'disabled':''} onclick="openChap(${n+1})">${n<BOOK.length?esc(TITLES[n]):'Keyingi'} →</button></div></article>`}

function bookView(u){if(S.ch!=null)return chapView(S.ch);const rd=readSet(),done=BOOK.map((_,i)=>i+1).filter(passed).length;
 return`<h2>📖 Darslik</h2><div class="card"><div class="row"><b>${BOOK.length} ta mavzu · ${rd.size} ta o‘qilgan${u.role==='student'?' · '+done+' ta test topshirilgan':''}</b></div>${bar(rd.size/BOOK.length*100)}</div>
 <input class="bs" placeholder="🔎 Mavzu qidirish…" value="${esc(S.bq||'')}" oninput="bookFilter(this.value)" aria-label="Mavzu qidirish"><div id="mods">${modulesHTML()}</div>`}

function openChap(n){if(n<1||n>BOOK.length)return;const u=me();
 if(!u){S.gp='chap';S.ch=n;render();scrollTo(0,0);return}
 if(!leaveOK())return;clearInterval(TM);S={nav:'book',view:'book',ch:n};render();scrollTo(0,0)}
function closeChap(){if(!me()){S.gp='land';S.ch=null;render();setTimeout(()=>document.getElementById('mods')?.scrollIntoView(),0);return}S.ch=null;render();scrollTo(0,0)}

function bookTest(n){const u=me();
 if(!u){toast('Test topshirish uchun avval kiring yoki ro‘yxatdan o‘ting');S.gp='auth';S.reg=DB.users.length===0;render();return}
 if(u.role!=='student')return toast('Testni faqat o‘quvchilar topshiradi');
 if(!cb('c20'))return toast('40 darslik kurs topilmadi. Administrator “Ma’lumotlar → Kursni tiklash” ni bosishi kerak');
 if(!DB.enr.some(e=>e.u===u.id&&e.c==='c20')){DB.enr.push({u:u.id,c:'c20'});save()}
 S.cid='c20';S.lid='l'+n;startTest('c20','l'+n);scrollTo(0,0)}

/* ---------- ilovaga ulash ---------- */
const _renderBase=render;
render=function(){const u=me();
 if(!u||!u.on){if(S.gp==='auth'){_renderBase();return}
  $('#app').innerHTML=S.gp==='chap'?`<div class="land"><header class="lnav"><b>💻 Kompyuter Savodxonligi</b><span><button class="b2" onclick="theme()" aria-label="Light/Dark rejim">◐</button> <button onclick="S.gp='auth';S.reg=false;render()">Kirish</button></span></header><div class="gwrap">${chapView(S.ch)}</div></div>`:landingView();chatShow();return}
 _renderBase()};
const _av=authView;
authView=function(){return _av().replace('<div class="card"><h2>','<div class="card"><button class="b2" style="margin-bottom:12px" onclick="S.gp=\'land\';render()">← Darslikka qaytish</button><h2>')};

Object.values(NAV).forEach(a=>a.splice(1,0,['book','📖 Darslik']));
ST.book=T.book=A.book=u=>bookView(u);

const _stHome=ST.home;
ST.home=function(u){const rd=readSet();return _stHome.call(this,u)+`<div class="card"><div class="row"><div><b>📖 Darslik</b><div class="mu">${rd.size} / ${BOOK.length} mavzu o‘qilgan</div></div><button onclick="go('book')">Darslikni ochish</button></div>${bar(rd.size/BOOK.length*100)}</div>`};
const _stCourse=ST.course;
ST.course=function(u){let h=_stCourse.call(this,u);const c=cb(S.cid);if(!c||c.id!=='c20')return h;
 const l=c.lessons.find(x=>x.id===S.lid)||c.lessons[0],m=l&&/^l(\d+)$/.exec(l.id);if(!m||!BOOK[m[1]-1])return h;
 return h.replace('<hr><button onclick="startTest',`<hr><button class="b2" onclick="openChap(${m[1]})">📖 To‘liq darslikni o‘qish</button> <button onclick="startTest`)};
const _stResult=ST.result;
ST.result=function(u){const r=S.res,m=r&&/^l(\d+)$/.exec(r.t.lid);return _stResult.call(this,u)+(m&&r.t.cid==='c20'?`<div class="row" style="margin-top:12px"><button class="b2" onclick="openChap(${m[1]})">📖 Mavzuni qayta o‘qish</button>${+m[1]<BOOK.length&&r.pct>=PASS?`<button class="b2" onclick="openChap(${+m[1]+1})">Keyingi mavzu →</button>`:''}</div>`:'')};

/* sahifa yuklanishidagi birinchi render() eskisini ishlatgan bo‘lishi mumkin — yangisi bilan qayta chizamiz */
if(typeof DB!=='undefined'&&DB&&$('#app').innerHTML)render();
