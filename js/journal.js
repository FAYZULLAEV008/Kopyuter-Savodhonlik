/* O‘quvchilar jurnali: katakda eng yaxshi test natijasi (%) yoki o‘qituvchi qo‘ygan belgi (2–5 yoki n = qatnashmadi). */
function jrCourses(u){return u.role==='admin'?DB.courses:u.role==='teacher'?myCourses(u):myEnr(u)}
function jrView(u){const cs=jrCourses(u);if(!cs.length)return'<h2>📒 Jurnal</h2><div class="card mu">Kurslar yo‘q.</div>';
const c=cs.find(x=>x.id===S.jc)||cs[0],ed=u.role!=='student',J=DB.jr||{};
const stu=ed?DB.enr.filter(e=>e.c===c.id).map(e=>DB.users.find(x=>x.id===e.u)).filter(Boolean):[u];
const best=(s,l)=>{const a=DB.att.filter(x=>x.u===s.id&&x.c===c.id&&x.l===l.id).map(x=>x.pct);return a.length?Math.max(...a):null};
const rows=stu.map(s=>{const bs=c.lessons.map(l=>best(s,l)).filter(b=>b!=null),ab=c.lessons.filter(l=>J[c.id+':'+s.id+':'+l.id]==='n').length;
return`<tr><td>${esc(s.name)}</td>${c.lessons.map(l=>{const m=J[c.id+':'+s.id+':'+l.id],b=best(s,l),k=m==='n'?'jn':m?'jm':b==null?'':b>=PASS?'jy':'jx';
return`<td class="jc ${k} ${ed?'ed':''}" ${ed?`onclick="jmark('${c.id}','${s.id}','${l.id}')"`:''} title="${esc(l.title)}">${m||(b==null?'·':b)}</td>`}).join('')}<td><b>${avg(bs)}%</b></td><td>${pct(s.id,c)}%</td><td>${ab}</td></tr>`}).join('');
return`<h2>📒 O‘quvchilar jurnali</h2><div class="card"><div class="row"><select style="max-width:360px" onchange="S.jc=this.value;render()">${cs.map(x=>`<option value="${x.id}" ${x===c?'selected':''}>${esc(x.title)}</option>`).join('')}</select>${ed?'<button onclick="jcsv()">CSV eksport</button>':''}</div>
<p class="lg mu"><span class="jy">≥${PASS}% o‘tdi</span><span class="jx">&lt;${PASS}%</span><span class="jm">belgi 2–5</span><span class="jn">n — qatnashmadi</span>${ed?' Katakni bosib belgi qo‘ying (bo‘sh qoldirsangiz o‘chadi).':''}</p>
<div class="jw"><table class="jt"><tr><th>O‘quvchi</th>${c.lessons.map((l,i)=>`<th title="${esc(l.title)}">${i+1}</th>`).join('')}<th>O‘rt.</th><th>Progress</th><th>n</th></tr>${rows||`<tr><td colspan="${c.lessons.length+4}" class="mu">O‘quvchilar yo‘q</td></tr>`}</table></div></div>`}
function jmark(cid,sid,lid){const k=cid+':'+sid+':'+lid;DB.jr=DB.jr||{};const v=prompt('Belgi: 2, 3, 4, 5 yoki n (qatnashmadi). Bo‘sh = o‘chirish',DB.jr[k]||'');if(v===null)return;const t=v.trim().toLowerCase();
if(t&&!/^[2-5n]$/.test(t))return toast('Faqat 2, 3, 4, 5 yoki n');if(t)DB.jr[k]=t;else delete DB.jr[k];log('Jurnal: '+uname(sid)+' · '+lesName(cid,lid)+' → '+(t||'—'));save();render()}
function jcsv(){const c=cb(S.jc)||jrCourses(me())[0],J=DB.jr||{},q=s=>'"'+String(s).replace(/"/g,'""')+'"';
const st=DB.enr.filter(e=>e.c===c.id).map(e=>DB.users.find(x=>x.id===e.u)).filter(Boolean);
download('jurnal.csv','\ufeff'+[['O‘quvchi',...c.lessons.map((l,i)=>i+1)],...st.map(s=>[s.name,...c.lessons.map(l=>J[c.id+':'+s.id+':'+l.id]||(DB.att.filter(x=>x.u===s.id&&x.c===c.id&&x.l===l.id).map(x=>x.pct).sort((a,b)=>b-a)[0]??''))])].map(r=>r.map(q).join(',')).join('\n'),'text/csv')}
