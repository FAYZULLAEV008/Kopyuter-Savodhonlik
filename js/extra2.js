/* Qo‘shimcha funksiyalar: tezkor mashq (hamma uchun), xatcho‘plar, “davom etish”, yutuqlar va kunlik seriya,
   matn o‘lchami, chop etish, ← → tugmalari. Hammasi brauzerda (localStorage) saqlanadi, bazani o‘zgartirmaydi. portal.js dan keyin yuklanadi. */
const ukey=()=>DB.session||'guest',LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const QALL=[...L20,...L20B];

/* ---- kunlik seriya va oxirgi mavzu ---- */
const dayStr=d=>d.toISOString().slice(0,10);
function touchDay(){const k='kl_days_'+ukey(),a=LS.get(k,[]),t=dayStr(new Date());if(!a.includes(t)){a.push(t);LS.set(k,a.slice(-90))}}
function streak(){const a=new Set(LS.get('kl_days_'+ukey(),[]));let d=new Date(),n=0;if(!a.has(dayStr(d)))d.setDate(d.getDate()-1);while(a.has(dayStr(d))){n++;d.setDate(d.getDate()-1)}return n}
const _x2mr=markRead;markRead=function(n){_x2mr(n);touchDay();LS.set('kl_last_'+ukey(),n)};

/* ---- xatcho‘plar ---- */
const bmSet=()=>new Set(LS.get('kl_bm_'+ukey(),[]));
function bmToggle(n){const s=bmSet();s.has(n)?s.delete(n):s.add(n);LS.set('kl_bm_'+ukey(),[...s].sort((a,b)=>a-b));render();toast(s.has(n)?'Xatcho‘pga qo‘shildi':'Xatcho‘pdan olindi')}

/* ---- matn o‘lchami ---- */
function fontStep(d){const v=Math.max(.85,Math.min(1.4,Math.round(((LS.get('kl_fs',1))+d*.1)*10)/10));LS.set('kl_fs',v);document.documentElement.style.setProperty('--fs',v)}
document.documentElement.style.setProperty('--fs',LS.get('kl_fs',1));

/* ---- tezkor mashq: savollar statik ma’lumotdan, shuning uchun mehmon ham ishlata oladi ---- */
const PQ={},pcGet=()=>LS.get('kl_pc_'+ukey(),0),pcInc=()=>LS.set('kl_pc_'+ukey(),pcGet()+1);
function pracQs(n){if(!PQ[n]){const qs=QALL[n-1][2].map(([q,c,...w])=>({q,c,o:shuf([c,...w])}));PQ[n]={qs:shuf(qs).slice(0,5),a:{}}}return PQ[n]}
function pracInner(n){const p=pracQs(n),done=Object.keys(p.a).length;
 return p.qs.map((q,i)=>`<div class="pq"><b>${i+1}. ${esc(q.q)}</b>${q.o.map((o,k)=>{const a=p.a[i],c=a==null?'':o===q.c?'good':o===a?'bad':'';
  return`<button class="opt ${c}" ${a!=null?'disabled':''} onclick="pracPick(${n},${i},${k})">${esc(o)}</button>`}).join('')}</div>`).join('')
 +(done===p.qs.length?`<div class="row"><b>Natija: ${p.qs.filter((q,i)=>p.a[i]===q.c).length} / ${p.qs.length}</b><button class="b2" onclick="pracReset(${n})">↻ Yangi savollar</button></div>`:`<div class="mu">Javob berilgan: ${done} / ${p.qs.length}</div>`)}
function pracPick(n,i,k){const p=pracQs(n);if(p.a[i]!=null)return;const o=p.qs[i].o[k];p.a[i]=o;if(o===p.qs[i].c)pcInc();$('#prac').innerHTML=pracInner(n)}
function pracReset(n){delete PQ[n];$('#prac').innerHTML=pracInner(n)}

/* ---- yutuqlar ---- */
function badges(){const u=me(),rd=readSet().size,att=u?DB.att.filter(a=>a.u===u.id):[],ps=u?BOOK.map((_,i)=>i+1).filter(passed).length:0;
 return[['📖','Birinchi qadam','1 ta mavzuni o‘qing',rd>=1],['📚','10 mavzu','10 ta mavzuni o‘qing',rd>=10],['🎓','Darslik tugadi','40 mavzuning hammasini o‘qing',rd>=40],
 ['✅','Birinchi g‘alaba','Birinchi testdan o‘ting',ps>=1],['🏅','10 ta test','10 ta testdan o‘ting',ps>=10],['💯','Mukammal','Testda 100% oling',att.some(a=>a.pct===100)],
 ['🔥','3 kunlik seriya','3 kun ketma-ket o‘qing',streak()>=3],['🎯','Mashq ustasi','Mashqda 20 ta to‘g‘ri javob bering',pcGet()>=20]]}
function extrasHTML(){const last=LS.get('kl_last_'+ukey(),0),bm=[...bmSet()],b=badges(),st=streak();
 return`${last?`<div class="card cta"><div><b>▶ Davom eting</b><div class="mu">${last}-mavzu: ${esc(TITLES[last-1])}</div></div><button onclick="openChap(${last})">Davom etish</button></div>`:''}
 <div class="card"><div class="row"><b>Yutuqlar</b><span class="tag">🔥 Seriya: ${st} kun</span></div><div class="bdg">${b.map(([i,t,d,ok])=>`<span class="bd ${ok?'on':''}" title="${esc(d)}">${i} ${esc(t)}</span>`).join('')}</div></div>
 ${bm.length?`<div class="card"><b>⭐ Xatcho‘plarim</b><div class="bdg">${bm.map(n=>`<a class="bd on" tabindex="0" onclick="openChap(${n})" onkeydown="if(event.key==='Enter')openChap(${n})">${n}. ${esc(TITLES[n-1])}</a>`).join('')}</div></div>`:''}`}

/* ---- mavjud sahifalarga ulash ---- */
const _x2cv=chapView;chapView=function(n){let h=_x2cv(n);const on=bmSet().has(n);
 const tools=`<div class="bartools"><button class="b2" onclick="bmToggle(${n})">${on?'⭐ Xatcho‘pda':'☆ Xatcho‘pga'}</button><button class="b2" onclick="fontStep(-1)" aria-label="Matnni kichraytirish">A−</button><button class="b2" onclick="fontStep(1)" aria-label="Matnni kattalashtirish">A+</button><button class="b2" onclick="print()">🖨 Chop etish</button></div>`;
 return h.replace('<h2>',tools+'<h2>').replace('<div class="card cta">',`<div class="card prac"><h3 style="margin-top:0">🎯 Tezkor mashq</h3><p class="mu">Javob darhol tekshiriladi. Natija saqlanmaydi, kirish shart emas.</p><div id="prac">${pracInner(n)}</div></div><div class="card cta">`)};
const _x2bv=bookView;bookView=function(u){const h=_x2bv(u);return S.ch!=null?h:h.replace('<input class="bs"',extrasHTML()+'<input class="bs"')};
const _x2lv=landingView;landingView=function(){return _x2lv().replace('<h2 class="lh">',extrasHTML()+'<h2 class="lh">')};

addEventListener('keydown',e=>{if(S.ch==null||S.view==='test'||(!me()&&S.gp!=='chap')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
 if(e.key==='ArrowRight')openChap(S.ch+1);else if(e.key==='ArrowLeft')openChap(S.ch-1)});
