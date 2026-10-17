const PASS=65; // o‘tish bali: 10 tadan 7, 3 tadan 2 ta to‘g‘ri
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;
const fd=d=>new Date(d).toLocaleDateString('uz-UZ');
const okUrl=u=>/^https?:\/\//i.test(u||'');
const val=id=>$('#'+id).value.trim();
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2800)}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function readFile(inp,cb){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>cb(String(r.result));r.readAsText(f)}

let S={nav:'home',view:'home'},TM;
const me=()=>DB.users.find(u=>u.id===DB.session);
const cb=id=>DB.courses.find(c=>c.id===id);
const uname=id=>Array.isArray(id)?id.map(uname).join(', '):(DB.users.find(u=>u.id===id)||{name:'—'}).name;
const myEnr=u=>DB.enr.filter(e=>e.u===u.id).map(e=>cb(e.c)).filter(Boolean);
const isOwn=(c,id)=>c.owner===id||(Array.isArray(c.owner)&&c.owner.includes(id));const myCourses=u=>DB.courses.filter(c=>isOwn(c,u.id));
const pct=(u,c)=>((DB.prog[u+':'+c.id]||[]).length/(c.lessons.length||1)*100)|0;
const bar=p=>`<div class="bar"><i style="width:${p}%"></i></div>`;
const asgOf=id=>DB.courses.flatMap(c=>c.asg).find(a=>a.id===id);
const nQ=c=>c.lessons.reduce((n,l)=>n+l.qs.length,0);
const ROLE={student:'O‘quvchi',teacher:'O‘qituvchi',admin:'Administrator'};

/* ---------- auth ---------- */
function authView(){const r=DB.users.length?S.reg:true;return`<div class="auth"><div class="card"><h2>💻 Kompyuter Savodxonligi</h2><p class="mu">${r?(DB.users.some(x=>x.role==='admin')?'Yangi o‘quvchi hisobi':'Administrator hisobini yarating (birinchi ro‘yxatdan o‘tgan)'):'Hisobingizga kiring'}</p>
${r?'<label for="nm">Ism va familiya</label><input id="nm">':''}
<label for="em">Email</label><input id="em" type="email"><label for="pw">Parol (kamida 6 belgi)</label><input id="pw" type="password">
<label><input type="checkbox" style="width:auto" onchange="$('#pw').type=this.checked?'text':'password'"> Parolni ko‘rsatish</label>
<button style="width:100%;margin-top:8px" onclick="doAuth(${!!r})">${r?'Ro‘yxatdan o‘tish':'Kirish'}</button>
${DB.users.length?`<p class="mu" style="text-align:center;cursor:pointer" onclick="S.reg=!S.reg;render()">${r?'Hisobim bor — kirish':'Hisobim yo‘q — ro‘yxatdan o‘tish'}</p>`:''}
<hr><p class="mu">Ma’lumotlar shu brauzerda saqlanadi: ro‘yxatdan o‘tgan foydalanuvchilar qayta kirganda eslab qolinadi. Boshqa qurilma yoki brauzerda alohida baza bo‘ladi.</p></div></div>`}
async function doAuth(reg){if(SRV)return srvAuth(reg);const e=val('em').toLowerCase(),p=$('#pw').value;
if(!/^\S+@\S+\.\S+$/.test(e)||p.length<6)return toast('To‘g‘ri email va kamida 6 belgili parol kiriting');
const h=await sha(p);
if(reg){const nm=val('nm');if(nm.length<2)return toast('Ismni kiriting');if(DB.users.some(x=>x.email===e))return toast('Bu email band');
const first=!DB.users.some(x=>x.role==='admin'),u={id:uid(),name:nm,email:e,pw:h,role:first?'admin':'student',on:true};DB.users.push(u);if(first)toast('Siz birinchi foydalanuvchisiz: administrator bo‘ldingiz');DB.session=u.id;log('Ro‘yxatdan o‘tdi: '+e)}
else{const u=DB.users.find(x=>x.email===e&&x.pw===h);if(!u)return toast('Email yoki parol noto‘g‘ri');if(!u.on)return toast('Hisobingiz bloklangan');DB.session=u.id;log('Kirdi')}
save();S={nav:'home',view:'home'};render()}
function logout(){if(!leaveOK())return;if(SRV)return srvLogout();DB.session=null;save();S={nav:'home',view:'home'};render()}
function theme(){const r=document.documentElement,d=matchMedia('(prefers-color-scheme:dark)').matches,cur=r.dataset.theme||(d?'dark':'light'),n=cur==='dark'?'light':'dark';r.dataset.theme=n;try{localStorage.setItem('kl_theme',n)}catch(e){}}
function go(k){if(!leaveOK())return;clearInterval(TM);S={nav:k,view:k};render()}

/* ---------- shell ---------- */
const NAV={student:[['home','🏠 Bosh sahifa'],['catalog','📚 Kurslar'],['my','🎓 Mening kurslarim'],['tasks','📝 Topshiriqlar'],['results','📊 Natijalar'],['journal','📒 Jurnal'],['rank','🏆 Reyting']],
teacher:[['home','🏠 Dashboard'],['courses','📚 Kurslarim'],['review','✅ Tekshirish'],['students','👥 O‘quvchilar'],['journal','📒 Jurnal'],['rank','🏆 Reyting']],
admin:[['home','🏠 Umumiy'],['users','👤 Foydalanuvchilar'],['courses','📚 Kurslar'],['data','💾 Ma’lumotlar'],['journal','📒 O‘quvchilar jurnali'],['rank','🏆 Reyting'],['log','🕑 Faoliyat']]};
function render(){const u=me(),app=$('#app');if(!u||!u.on){DB.session=null;app.innerHTML=authView();return}
const V={student:ST,teacher:T,admin:A}[u.role];
app.innerHTML=`<div class="shell"><aside><div class="logo">💻 Kompyuter<br>Savodxonligi</div>${NAV[u.role].map(([k,l])=>`<a tabindex="0" class="${S.nav===k?'on':''}" onclick="go('${k}')" onkeydown="if(event.key==='Enter')go('${k}')">${l}</a>`).join('')}</aside>
<main><div class="top"><span>${esc(u.name)} <span class="tag">${ROLE[u.role]}</span></span><span><button class="b2" onclick="theme()" aria-label="Light/Dark rejim">◐</button> <button class="b2" onclick="chpw()" title="Parolni o‘zgartirish" aria-label="Parol">🔑</button> <button class="b2" onclick="logout()">Chiqish</button></span></div>${V[S.view]?.(u)??'<div class="card">Sahifa topilmadi</div>'}</main></div>`}

/* ---------- student ---------- */
const ST={journal:u=>jrView(u),rank:()=>rankView(),
home(u){const cs=myEnr(u),at=DB.att.filter(a=>a.u===u.id),sb=DB.sub.filter(s=>s.u===u.id&&s.grade!=null);
const lessonsDone=Object.keys(DB.prog).filter(k=>k.startsWith(u.id+':')).reduce((n,k)=>n+DB.prog[k].length,0);
return`<h2>Salom, ${esc(u.name)}!</h2><div class="grid"><div class="card stat"><b>${lessonsDone}</b><span>O‘tilgan darslar</span></div>
<div class="card stat"><b>${cs.filter(c=>pct(u.id,c)===100).length}</b><span>Tugatilgan kurslar</span></div>
<div class="card stat"><b>${avg(at.map(a=>a.pct))}%</b><span>Testlar o‘rtachasi</span></div>
<div class="card stat"><b>${avg(cs.map(c=>pct(u.id,c)))}%</b><span>Umumiy progress</span></div></div>
<h3>Davom eting</h3>${cs.map(c=>`<div class="card"><div class="row"><b>${esc(c.title)}</b><button onclick="openCourse('${c.id}')">Davom etish</button></div>${bar(pct(u.id,c))}<span class="mu">${pct(u.id,c)}%${pct(u.id,c)===100?' — sertifikat tayyor':''}</span></div>`).join('')||'<div class="card mu">Hali kursga yozilmagansiz. “Kurslar” bo‘limidan tanlang.</div>'}`},
catalog(){const cats=[...new Set(DB.courses.filter(c=>c.published).map(c=>c.cat||'Boshqa'))];
return`<h2>Kurslar katalogi</h2><div class="row"><input placeholder="Kurs qidirish…" style="flex:2" oninput="S.q=this.value;$('#cl').innerHTML=catList()"><select style="flex:1" onchange="S.cat=this.value;$('#cl').innerHTML=catList()"><option value="">Barcha kategoriyalar</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></div><div id="cl">${catList()}</div>`},
my(u){const cs=myEnr(u);return`<h2>Mening kurslarim</h2>${cs.map(c=>`<div class="card"><div class="row"><b>${esc(c.title)}</b><button onclick="openCourse('${c.id}')">Ochish</button></div>${bar(pct(u.id,c))}</div>`).join('')||'<div class="card mu">Kurslar yo‘q.</div>'}`},
course(u){const c=cb(S.cid);if(!c)return'<div class="card">Kurs topilmadi</div>';const done=DB.prog[u.id+':'+c.id]||[];const l=c.lessons.find(x=>x.id===S.lid)||c.lessons[0];const i=c.lessons.indexOf(l);
return`<h2>${esc(c.title)}</h2>${bar(pct(u.id,c))}${pct(u.id,c)===100?`<div class="card row"><b>🎉 Kurs tugatildi</b><button onclick="cert('${c.id}')">Sertifikat</button></div>`:''}
<div class="two"><div class="card">${c.lessons.map(x=>`<div class="lesson ${x===l?'on':''}" tabindex="0" onclick="S.lid='${x.id}';render()" onkeydown="if(event.key==='Enter'){S.lid='${x.id}';render()}"><span>${esc(x.title)}</span><span>${done.includes(x.id)?'✅':''}</span></div>`).join('')||'<span class="mu">Darslar yo‘q</span>'}</div>
<div class="card">${l?`<h3>${esc(l.title)}</h3><p>${esc(l.theory)}</p>${okUrl(l.img)?`<img src="${esc(l.img)}" alt="" style="max-width:100%;border-radius:10px">`:''}${okUrl(l.video)?`<p><a href="${esc(l.video)}" target="_blank" rel="noopener">▶ Video darsni ochish</a></p>`:''}
<div class="row"><button class="b2" ${i<1?'disabled':''} onclick="S.lid='${c.lessons[i-1]?.id}';render()">← Oldingi</button><button onclick="markDone('${c.id}','${l.id}')">${done.includes(l.id)?'Tugatilgan ✅':'Tugatdim'}</button><button class="b2" ${i>=c.lessons.length-1?'disabled':''} onclick="S.lid='${c.lessons[i+1]?.id}';render()">Keyingi →</button></div>
<hr><button onclick="startTest('${c.id}','${l.id}')" ${l.qs.length?'':'disabled'}>📝 Dars testi (${l.qs.length} savol)</button>`:'<span class="mu">Darslar yo‘q</span>'}</div></div>`},
test(){const t=S.t,q=t.qs[t.i];return`<h2>Test</h2><div class="card"><div class="row"><span class="mu">Savol ${t.i+1} / ${t.qs.length}</span><span class="tag">⏱ <span id="tm"></span></span></div><div class="${t.warn?'warn':'mu'}">${t.warn?'⚠ Ogohlantirish: '+t.warn+' / 3':'🔒 Test paytida boshqa oynaga o‘tish taqiqlanadi. 3 marta chiqsangiz test yakunlanadi.'}</div>${bar((t.i+1)/t.qs.length*100)}
<h3>${esc(q.q)}</h3>${q.opts.map((o,k)=>`<button class="opt ${t.a[t.i]===o?'sel':''}" onclick="pick(${k})">${esc(o)}</button>`).join('')}
<div class="row"><button class="b2" ${t.i<1?'disabled':''} onclick="S.t.i--;render()">← Oldingi</button><span class="mu">Javob berilgan: ${Object.keys(t.a).length}/${t.qs.length}</span>${t.i<t.qs.length-1?`<button onclick="S.t.i++;render()">Keyingi →</button>`:`<button onclick="finish()">Yakunlash</button>`}</div></div>`},
result(){const r=S.res,t=r.t;return`<h2>Natija</h2><div class="card stat"><b>${r.pct}%</b><span>${r.score} to‘g‘ri, ${t.qs.length-r.score} xato — ${r.pct>=PASS?'✅ O‘tdingiz':`❌ O‘tmadingiz (o‘tish uchun kamida ${Math.ceil(t.qs.length*PASS/100)} ta to‘g‘ri javob kerak)`}</span></div>
${t.qs.map((q,i)=>`<div class="card"><b>${i+1}. ${esc(q.q)}</b><div class="mu">Sizning javobingiz: ${esc(t.a[i]??'—')}</div><div style="color:${t.a[i]===q.correct?'var(--ok)':'var(--er)'}">To‘g‘ri javob: ${esc(q.correct)}</div>${q.exp?`<div class="mu">${esc(q.exp)}</div>`:''}</div>`).join('')}
<div class="row"><button onclick="startTest('${t.cid}','${t.lid}')">Qayta urinish</button><button class="b2" onclick="openCourse('${t.cid}')">Kursga qaytish</button></div>`},
tasks(u){const items=myEnr(u).flatMap(c=>c.asg.map(a=>({c,a})));
return`<h2>Topshiriqlar</h2>${items.map(({c,a})=>{const s=DB.sub.find(x=>x.aid===a.id&&x.u===u.id);
return`<div class="card"><span class="tag">${esc(c.title)}</span><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p>${a.due?`<p class="mu">Muddat: ${esc(a.due)}</p>`:''}${s?`<p class="mu">Yuborilgan: ${fd(s.date)}${s.file?' · Fayl: '+esc(s.file):''}</p><p>${esc(s.text)}</p>${s.grade!=null?`<b style="color:var(--ok)">Baho: ${s.grade}/100</b><p>${esc(s.comment)}</p>`:'<span class="tag">Tekshirilmoqda</span>'}`:`<textarea id="t_${a.id}" placeholder="Javobingizni yozing…"></textarea><input type="file" id="f_${a.id}"><button onclick="submitTask('${c.id}','${a.id}')">Yuborish</button>`}</div>`}).join('')||'<div class="card mu">Topshiriqlar yo‘q.</div>'}`},
results(u){const at=DB.att.filter(a=>a.u===u.id).reverse(),sb=DB.sub.filter(s=>s.u===u.id&&s.grade!=null);
return`<h2>Baholar va natijalar</h2><div class="card"><h3>Testlar tarixi</h3><table><tr><th>Dars</th><th>Sana</th><th>Natija</th></tr>${at.map(a=>`<tr><td>${esc(lesName(a.c,a.l))}</td><td>${fd(a.d)}</td><td>${a.pct}% ${a.pct>=PASS?'✅':'❌'}</td></tr>`).join('')||'<tr><td colspan=3 class="mu">Hali test topshirilmagan</td></tr>'}</table></div>
<div class="card"><h3>Topshiriq baholari</h3><table><tr><th>Topshiriq</th><th>Baho</th><th>Izoh</th></tr>${sb.map(s=>`<tr><td>${esc(asgOf(s.aid)?.title)}</td><td>${s.grade}</td><td>${esc(s.comment)}</td></tr>`).join('')||'<tr><td colspan=3 class="mu">Baholar yo‘q</td></tr>'}</table></div>`}};
const lesName=(c,l)=>(cb(c)?.lessons.find(x=>x.id===l)||{title:'—'}).title;
function catList(){const q=(S.q||'').toLowerCase(),u=me();const cs=DB.courses.filter(c=>c.published&&(c.title+c.desc).toLowerCase().includes(q)&&(!S.cat||(c.cat||'Boshqa')===S.cat));
return cs.map(c=>{const en=DB.enr.some(e=>e.u===u.id&&e.c===c.id);return`<div class="card"><div class="row"><div><b>${esc(c.title)}</b> <span class="tag">${esc(c.cat||'Boshqa')}</span><div class="mu">${esc(c.desc)}</div><div class="mu">${c.lessons.length} dars · ${nQ(c)} savol · ${esc(uname(c.owner))}</div></div>${en?`<button onclick="openCourse('${c.id}')">Ochish</button>`:`<button onclick="enroll('${c.id}')">Yozilish</button>`}</div></div>`}).join('')||'<div class="card mu">Hech narsa topilmadi.</div>'}
function enroll(cid){DB.enr.push({u:me().id,c:cid});save();toast('Kursga yozildingiz');openCourse(cid)}
function openCourse(cid){if(!leaveOK())return;clearInterval(TM);S={nav:'my',view:'course',cid,lid:null};render()}
function markDone(cid,lid){const k=me().id+':'+cid;DB.prog[k]=DB.prog[k]||[];if(!DB.prog[k].includes(lid))DB.prog[k].push(lid);save();render();toast('Dars tugatildi')}
function startTest(cid,lid){const l=cb(cid).lessons.find(x=>x.id===lid);if(!l||!l.qs.length)return toast('Bu darsda test yo‘q');clearInterval(TM);
S.view='test';S.t={cid,lid,i:0,a:{},warn:0,end:Date.now()+l.qs.length*45000,qs:shuf(l.qs).map(q=>({...q,opts:shuf(q.opts)}))};render();guardOn();
TM=setInterval(()=>{if(S.view!=='test'){clearInterval(TM);return}const r=Math.max(0,S.t.end-Date.now()),e=$('#tm');if(e)e.textContent=Math.floor(r/60000)+':'+String(Math.floor(r/1000)%60).padStart(2,'0');if(r<=0)finish(true)},500)}
function pick(k){S.t.a[S.t.i]=S.t.qs[S.t.i].opts[k];render()}
function finish(force){const t=S.t;if(!force&&Object.keys(t.a).length<t.qs.length&&!confirm('Hamma savolga javob berilmagan. Yakunlaymizmi?'))return;
clearInterval(TM);guardOff();const score=t.qs.filter((q,i)=>t.a[i]===q.correct).length,p=Math.round(score/t.qs.length*100),u=me();
DB.att.push({id:uid(),u:u.id,c:t.cid,l:t.lid,pct:p,d:Date.now(),warn:t.warn||0});
if(p>=PASS){const k=u.id+':'+t.cid;DB.prog[k]=DB.prog[k]||[];if(!DB.prog[k].includes(t.lid))DB.prog[k].push(t.lid)}
save();S.res={t,score,pct:p};S.view='result';render()}
function submitTask(cid,aid){const x=val('t_'+aid),f=$('#f_'+aid).files[0];if(!x)return toast('Javob yozing');DB.sub.push({id:uid(),aid,c:cid,u:me().id,text:x,file:f?f.name:'',date:Date.now(),grade:null,comment:''});save();render();toast('Topshiriq yuborildi')}
function cert(cid){const c=cb(cid),w=window.open('','_blank');if(!w)return toast('Oynani ochishga ruxsat bering');
w.document.write(`<title>Sertifikat</title><body style="font-family:Georgia,serif;text-align:center;padding:60px;border:10px double #4f46e5;margin:20px"><h1>SERTIFIKAT</h1><p>Ushbu sertifikat</p><h2>${esc(me().name)}</h2><p>“${esc(c.title)}” kursini muvaffaqiyatli tugatgani uchun beriladi.</p><p>${fd(Date.now())}</p><p style="color:#888">Demo sertifikat · № ${cid}-${me().id}</p><button onclick="print()">Chop etish / PDF</button></body>`)}

/* ---------- teacher ---------- */
const T={journal:u=>jrView(u),rank:()=>rankView(),
home(u){const cs=myCourses(u),ids=cs.map(c=>c.id),en=DB.enr.filter(e=>ids.includes(e.c)),unr=DB.sub.filter(s=>ids.includes(s.c)&&s.grade==null),at=DB.att.filter(a=>ids.includes(a.c));
return`<h2>Dashboard</h2><div class="grid"><div class="card stat"><b>${cs.length}</b><span>Kurslar</span></div><div class="card stat"><b>${new Set(en.map(e=>e.u)).size}</b><span>O‘quvchilar</span></div>
<div class="card stat"><b>${unr.length}</b><span>Tekshirilmagan ishlar</span></div><div class="card stat"><b>${avg(at.map(a=>a.pct))}%</b><span>Testlar o‘rtachasi</span></div></div>
<div class="card"><h3>Oxirgi test natijalari</h3><table>${at.slice(-6).reverse().map(a=>`<tr><td>${esc(uname(a.u))}</td><td>${esc(lesName(a.c,a.l))}</td><td>${a.pct}%${a.warn?' ⚠'+a.warn:''}</td></tr>`).join('')||'<tr><td class="mu">Hali natija yo‘q</td></tr>'}</table></div>`},
courses(u){return`<h2>Kurslarim</h2>${myCourses(u).map(c=>`<div class="card"><div class="row"><div><b>${esc(c.title)}</b> <span class="tag">${c.published?'E’lon qilingan':'Qoralama'}</span><div class="mu">${c.lessons.length} dars · ${nQ(c)} savol · ${c.asg.length} topshiriq</div></div><button onclick="S.view='manage';S.cid='${c.id}';S.ql=null;render()">Boshqarish</button></div></div>`).join('')||'<div class="card mu">Kurslar yo‘q.</div>'}
<div class="card"><h3>Yangi kurs</h3><label for="ct">Nomi</label><input id="ct"><label for="cc">Kategoriya</label><input id="cc"><label for="cd">Tavsif</label><textarea id="cd"></textarea><button onclick="addCourse()">Kurs yaratish</button></div>`},
manage(u){const c=cb(S.cid);if(!c||!isOwn(c,u.id))return'<div class="card">Ruxsat yo‘q</div>';const ql=c.lessons.find(l=>l.id===S.ql)||c.lessons[0];
return`<button class="b2" onclick="go('courses')">← Kurslar</button><h2>${esc(c.title)}</h2>
<div class="card row"><span>Holat: <b>${c.published?'E’lon qilingan':'Qoralama'}</b></span><span><button onclick="togglePub()">${c.published?'Qoralamaga qaytarish':'E’lon qilish'}</button> <button class="er" onclick="delCourse()">O‘chirish</button></span></div>
<div class="card"><h3>Darslar</h3>${c.lessons.map((l,i)=>`<div class="row"><span>${i+1}. ${esc(l.title)} <span class="mu">(${l.qs.length} savol)</span></span><span><button class="b2" onclick="moveL(${i},-1)">↑</button> <button class="b2" onclick="moveL(${i},1)">↓</button> <button class="er" onclick="delLesson('${l.id}')">×</button></span></div>`).join('')||'<span class="mu">Yo‘q</span>'}
<hr><label for="lt">Dars nomi</label><input id="lt"><label for="lx">Dars matni</label><textarea id="lx"></textarea><label for="lv">Video URL (ixtiyoriy)</label><input id="lv" placeholder="https://"><label for="li">Rasm URL (ixtiyoriy)</label><input id="li" placeholder="https://"><button onclick="addLesson()">Dars qo‘shish</button></div>
<div class="card"><h3>Test savollari</h3>${c.lessons.length?`<label for="ql">Dars</label><select id="ql" onchange="S.ql=this.value;render()">${c.lessons.map(l=>`<option value="${l.id}" ${l===ql?'selected':''}>${esc(l.title)}</option>`).join('')}</select>
${ql.qs.map((q,i)=>`<div class="row"><span>${i+1}. ${esc(q.q)}</span><button class="er" onclick="delQ('${q.id}')">×</button></div>`).join('')||'<span class="mu">Savol yo‘q</span>'}<hr>
<label for="qq">Savol</label><input id="qq">${[1,2,3,4].map(n=>`<input id="o${n}" aria-label="${n}-variant" placeholder="${n}-variant">`).join('')}<label for="qc">To‘g‘ri javob</label><select id="qc"><option value="1">1-variant</option><option value="2">2-variant</option><option value="3">3-variant</option><option value="4">4-variant</option></select><label for="qe">Izoh (ixtiyoriy)</label><input id="qe"><button onclick="addQ()">Savol qo‘shish</button>`:'<span class="mu">Avval dars qo‘shing</span>'}</div>
<div class="card"><h3>Topshiriqlar</h3>${c.asg.map(a=>`<div class="row"><span>${esc(a.title)} ${a.due?`<span class="mu">(muddat: ${esc(a.due)})</span>`:''}</span><button class="er" onclick="delAsg('${a.id}')">×</button></div>`).join('')||'<span class="mu">Yo‘q</span>'}
<hr><label for="at">Sarlavha</label><input id="at"><label for="ad">Tavsif</label><textarea id="ad"></textarea><label for="au">Muddat</label><input id="au" type="date"><button onclick="addAsg()">Topshiriq qo‘shish</button></div>`},
review(u){const ids=myCourses(u).map(c=>c.id),ss=DB.sub.filter(s=>ids.includes(s.c)).sort((a,b)=>(a.grade!=null)-(b.grade!=null));
return`<h2>Topshiriqlarni tekshirish</h2><select onchange="S.rf=this.value;render()"><option value="">Hammasi</option><option value="n" ${S.rf==='n'?'selected':''}>Tekshirilmagan</option><option value="y" ${S.rf==='y'?'selected':''}>Tekshirilgan</option></select>
${ss.filter(s=>!S.rf||(S.rf==='n')===(s.grade==null)).map(s=>`<div class="card"><div class="row"><b>${esc(uname(s.u))}</b><span class="tag">${s.grade!=null?'Baholangan':'Kutilmoqda'}</span></div><div class="mu">${esc(asgOf(s.aid)?.title)} · ${fd(s.date)}${s.file?' · Fayl: '+esc(s.file):''}</div><p>${esc(s.text)}</p>
<label for="g_${s.id}">Ball (0–100)</label><input id="g_${s.id}" type="number" min="0" max="100" value="${s.grade??''}"><label for="m_${s.id}">Izoh</label><input id="m_${s.id}" value="${esc(s.comment)}"><button onclick="grade('${s.id}')">Saqlash</button></div>`).join('')||'<div class="card mu">Ishlar yo‘q.</div>'}`},
students(u){const ids=myCourses(u).map(c=>c.id);return`<h2>O‘quvchilar</h2><div class="row"><input placeholder="Ism bo‘yicha qidirish…" style="flex:2" value="${esc(S.sq||'')}" oninput="S.sq=this.value;$('#sl').innerHTML=stuTable()"><button onclick="exportCSV()">CSV eksport</button></div><div id="sl">${stuTable()}</div>`}};
function stuRows(){const u=me(),q=(S.sq||'').toLowerCase();return myCourses(u).flatMap(c=>DB.enr.filter(e=>e.c===c.id&&uname(e.u).toLowerCase().includes(q)).map(e=>{const a=DB.att.filter(x=>x.u===e.u&&x.c===c.id),s=DB.sub.filter(x=>x.u===e.u&&x.c===c.id);return[uname(e.u),c.title,pct(e.u,c),a.length?avg(a.map(x=>x.pct)):'',s.filter(x=>x.grade!=null).length+'/'+s.length]}))}
function stuTable(){const r=stuRows();return`<div class="card"><table><tr><th>Ism</th><th>Kurs</th><th>Progress</th><th>Test o‘rt.</th><th>Topshiriq</th></tr>${r.map(x=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${x[2]}%</td><td>${x[3]===''?'—':x[3]+'%'}</td><td>${x[4]}</td></tr>`).join('')||'<tr><td colspan=5 class="mu">O‘quvchilar yo‘q</td></tr>'}</table></div>`}
function exportCSV(){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';download('oquvchilar.csv','\ufeff'+[['Ism','Kurs','Progress %','Test ortacha %','Topshiriq'],...stuRows()].map(r=>r.map(q).join(',')).join('\n'),'text/csv')}
function addCourse(){const t=val('ct');if(!t)return toast('Kurs nomini yozing');DB.courses.push({id:uid(),owner:me().id,title:t,cat:val('cc')||'Boshqa',desc:val('cd'),published:false,lessons:[],asg:[]});log('Kurs yaratdi: '+t);save();render();toast('Kurs yaratildi')}
function togglePub(){const c=cb(S.cid);c.published=!c.published;save();render()}
function delCourse(){if(!confirm('Kurs o‘chirilsinmi?'))return;DB.courses=DB.courses.filter(c=>c.id!==S.cid);DB.enr=DB.enr.filter(e=>e.c!==S.cid);log('Kurs o‘chirildi');save();go('courses')}
function addLesson(){const t=val('lt'),v=val('lv'),i=val('li');if(!t)return toast('Dars nomini yozing');if((v&&!okUrl(v))||(i&&!okUrl(i)))return toast('URL https:// bilan boshlansin');cb(S.cid).lessons.push({id:uid(),title:t,theory:val('lx'),video:v,img:i,qs:[]});save();render();toast('Dars qo‘shildi')}
function delLesson(id){const c=cb(S.cid);c.lessons=c.lessons.filter(l=>l.id!==id);save();render()}
function moveL(i,d){const a=cb(S.cid).lessons,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save();render()}
function addQ(){const c=cb(S.cid),l=c.lessons.find(x=>x.id===$('#ql').value);const q=val('qq'),o=[1,2,3,4].map(n=>val('o'+n)),cor=o[+$('#qc').value-1],opts=o.filter(Boolean);
if(!q||opts.length<2||!cor)return toast('Savol, kamida 2 variant va to‘g‘ri javobni kiriting');if(new Set(opts).size<opts.length)return toast('Variantlar bir xil bo‘lmasin');
l.qs.push({id:uid(),q,opts,correct:cor,exp:val('qe')});S.ql=l.id;save();render();toast('Savol qo‘shildi')}
function delQ(id){const c=cb(S.cid),l=c.lessons.find(x=>x.qs.some(q=>q.id===id));l.qs=l.qs.filter(q=>q.id!==id);save();render()}
function addAsg(){const t=val('at');if(!t)return toast('Sarlavha yozing');cb(S.cid).asg.push({id:uid(),title:t,desc:val('ad'),due:val('au')});save();render();toast('Topshiriq qo‘shildi')}
function delAsg(id){const c=cb(S.cid);c.asg=c.asg.filter(a=>a.id!==id);save();render()}
function grade(id){const s=DB.sub.find(x=>x.id===id),r=val('g_'+id),g=+r;if(r===''||isNaN(g)||g<0||g>100)return toast('Ball 0 dan 100 gacha bo‘lsin');s.grade=g;s.comment=val('m_'+id);save();render();toast('Baho saqlandi')}

/* ---------- admin ---------- */
const A={journal:u=>jrView(u),rank:()=>rankView(),
home(){return`<h2>Platforma statistikasi</h2><div class="grid">${[['Foydalanuvchilar',DB.users.length],['Kurslar',DB.courses.length],['Test urinishlari',DB.att.length],['Topshiriqlar',DB.sub.length]].map(([l,n])=>`<div class="card stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
<div class="card"><h3>Rollar</h3>${Object.keys(ROLE).map(r=>`<p>${ROLE[r]}: <b>${DB.users.filter(u=>u.role===r).length}</b></p>`).join('')}</div>`},
users(me){return`<h2>Foydalanuvchilar</h2><div class="card"><table><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Holat</th></tr>${DB.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td><select style="margin:0" ${u.id===me.id?'disabled':''} onchange="setRole('${u.id}',this.value)">${Object.keys(ROLE).map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${ROLE[r]}</option>`).join('')}</select></td><td><button class="${u.on?'er':'b2'}" ${u.id===me.id?'disabled':''} onclick="toggleUser('${u.id}')">${u.on?'Bloklash':'Faollashtirish'}</button> <button class="b2" onclick="admReset('${u.id}')" title="Parolni almashtirish">🔑</button></td></tr>`).join('')}</table></div>`},
courses(){return`<h2>Kurslar</h2>${DB.courses.map(c=>`<div class="card row"><div><b>${esc(c.title)}</b> <span class="tag">${c.published?'E’lon qilingan':'Qoralama'}</span><div class="mu">${esc(uname(c.owner))} · ${c.lessons.length} dars · ${nQ(c)} savol</div></div><span><button class="b2" onclick="admPub('${c.id}')">${c.published?'Yashirish':'E’lon qilish'}</button> <button class="er" onclick="admDel('${c.id}')">O‘chirish</button></span></div>`).join('')}`},
data(){return`<h2>Ma’lumotlar</h2><div class="card"><h3>Eski testlarni import qilish</h3><p class="mu">Eski HTML faylni (20 dars, 200 savol) tanlang. Darslar va savollar o‘zgarishsiz ko‘chiriladi, to‘g‘ri javob javob matni bilan bog‘lanadi, shuning uchun aralashtirganda xato bo‘lmaydi.</p><input type="file" accept=".html,.js,.json,.txt" onchange="readFile(this,importOld)"></div>
<div class="card"><h3>JSON eksport / import</h3><div class="row"><button onclick="download('kompyuter-savodxonligi.json',JSON.stringify(DB,null,1),'application/json')">Eksport</button><input type="file" accept=".json" style="flex:1" onchange="readFile(this,importJSON)"></div></div>
<div class="card"><h3>Darslikni qayta tiklash</h3><p class="mu">Tasodifan o‘chirilgan 40 darslik kursni qaytaradi (o‘quvchilar natijalari saqlanib qoladi).</p><button onclick="restoreCourse()">Kursni tiklash</button></div>
<div class="card"><h3>Demo ma’lumotlarni tiklash</h3><button class="er" onclick="if(confirm('Barcha ma’lumotlar o‘chiriladi. Davom etasizmi?'))resetDB()">Tiklash (reset)</button></div>`},
log(){return`<h2>Faoliyat tarixi</h2><div class="card"><table>${DB.log.map(l=>`<tr><td>${new Date(l.d).toLocaleString('uz-UZ')}</td><td>${esc(uname(l.u))}</td><td>${esc(l.t)}</td></tr>`).join('')||'<tr><td class="mu">Bo‘sh</td></tr>'}</table></div>`}};
function setRole(id,r){DB.users.find(u=>u.id===id).role=r;if(r==='teacher')DB.courses.forEach(c=>{if(!c.owner)c.owner=id});log('Rol o‘zgardi: '+uname(id)+' → '+ROLE[r]);save();render();toast('Rol yangilandi')}
function toggleUser(id){const u=DB.users.find(x=>x.id===id);u.on=!u.on;log((u.on?'Faollashtirildi: ':'Bloklandi: ')+u.name);save();render()}
function admPub(id){const c=cb(id);c.published=!c.published;save();render()}
function admDel(id){if(!confirm('Kurs o‘chirilsinmi?'))return;DB.courses=DB.courses.filter(c=>c.id!==id);DB.enr=DB.enr.filter(e=>e.c!==id);log('Admin kursni o‘chirdi');save();render()}
function importOld(txt){try{let s=txt.trim();if(s[0]!=='['){const k=s.indexOf('testsData');const a=s.indexOf('[',k);const b=s.indexOf('];',a);s=s.slice(a,b+1)}
const arr=JSON.parse(s),r=convertOld(arr),owner=DB.users.find(u=>u.role==='teacher')?.id||null;
DB.courses.push({id:uid(),owner,title:'Kompyuter savodxonligi',cat:'Asoslar',desc:'20 ta dars va test savollari (import qilingan).',published:true,lessons:r.lessons,asg:[]});
log('Eski testlar import qilindi: '+r.lessons.length+' dars');save();render();toast(r.lessons.length+' dars, '+r.lessons.reduce((n,l)=>n+l.qs.length,0)+' savol yuklandi'+(r.bad?`, ${r.bad} ta noto‘g‘ri savol o‘tkazib yuborildi`:''))}
catch(e){toast('Faylni o‘qib bo‘lmadi: testsData topilmadi')}}
function importJSON(txt){try{const d=JSON.parse(txt);if(d.v!==VER||!Array.isArray(d.users)||!d.users.some(u=>u.role==='admin'))throw 0;if(!confirm('Joriy ma’lumotlar almashtiriladi. Davom etasizmi?'))return;DB=d;save();render();toast('Import qilindi')}catch(e){toast('JSON noto‘g‘ri yoki versiya mos emas')}}

(async()=>{try{const t=localStorage.getItem('kl_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}await initDB();render()})();

/* ---------- test paytida himoya ---------- */
let GW=0;
function leaveOK(){if(S.view!=='test'||!S.t)return true;if(!confirm('Testdan chiqsangiz, natija hozirgi javoblar bilan yakunlanadi. Chiqasizmi?'))return false;finish(true);return true}
function strike(){if(S.view!=='test'||!S.t)return;const n=Date.now();if(n-GW<1500)return;GW=n;S.t.warn++;S.t.pend=true;
if(S.t.warn>=3){finish(true);toast('3 marta oynadan chiqdingiz: test yakunlandi');return}render()}
const gh={vis:()=>{if(document.hidden)strike()},blur:()=>strike(),fs:()=>{if(!document.fullscreenElement)strike()},
foc:()=>{if(S.view==='test'&&S.t&&S.t.pend){S.t.pend=false;alert('⚠ Test paytida boshqa oynaga o‘tish mumkin emas! Ogohlantirish: '+S.t.warn+' / 3')}},
blk:e=>{if(S.view==='test')e.preventDefault()}};
const BLK=['contextmenu','copy','cut','paste','selectstart','dragstart'];
function guardOn(){GW=Date.now();document.addEventListener('visibilitychange',gh.vis);addEventListener('blur',gh.blur);addEventListener('focus',gh.foc);document.addEventListener('fullscreenchange',gh.fs);BLK.forEach(e=>document.addEventListener(e,gh.blk));
try{document.documentElement.requestFullscreen?.().catch(()=>{})}catch(e){}}
function guardOff(){document.removeEventListener('visibilitychange',gh.vis);removeEventListener('blur',gh.blur);removeEventListener('focus',gh.foc);document.removeEventListener('fullscreenchange',gh.fs);BLK.forEach(e=>document.removeEventListener(e,gh.blk));
try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}}
