/* AI yordamchi: kalit kiritilsa Claude API orqali, aks holda darslar ichidan qidirib javob beradi. */
const AIK='kl_ai_key',AIM='claude-sonnet-5-5';let CH=[];
const aiKey=()=>{try{return localStorage.getItem(AIK)||''}catch(e){return''}};
function chatInit(){if($('#chw'))return;const d=document.createElement('div');d.id='chw';d.innerHTML=`<button id="chb" aria-label="AI yordamchi" onclick="chatToggle()">💬</button>
<div id="chp" hidden><div class="chh"><b>🤖 AI yordamchi</b><span><button class="b2" onclick="chatKey()" title="API kalit" aria-label="Sozlamalar">⚙</button> <button class="b2" onclick="chatToggle()" aria-label="Yopish">✕</button></span></div>
<div id="chm"></div><div class="chi"><input id="chq" placeholder="Qiziqqan narsangizni yozing…" onkeydown="if(event.key==='Enter')chatSend()"><button onclick="chatSend()">➤</button></div></div>`;document.body.appendChild(d);
chatAdd('bot','Salom! Kompyuter, internet, xavfsizlik yoki darslar haqida istagan savolingizni bering 🙂')}
function chatToggle(){const p=$('#chp');p.hidden=!p.hidden;if(!p.hidden)$('#chq').focus()}
function chatKey(){const k=prompt('Anthropic API kalitini kiriting (bo‘sh = o‘chirish; kalit faqat shu brauzerda saqlanadi, demo uchun):',aiKey());if(k===null)return;try{k.trim()?localStorage.setItem(AIK,k.trim()):localStorage.removeItem(AIK)}catch(e){}toast(k.trim()?'AI yoqildi':'Oflayn rejim')}
function chatAdd(r,t){const m=$('#chm');m.insertAdjacentHTML('beforeend',`<div class="cm ${r}">${esc(t).replace(/\n/g,'<br>')}</div>`);m.scrollTop=m.scrollHeight;return m.lastElementChild}
function chatOffline(q){const w=q.toLowerCase().split(/[^a-z0-9ʻ‘’'o‘g‘]+/).filter(x=>x.length>2),all=DB.courses.flatMap(c=>c.lessons.map(l=>({c,l})));
const sc=all.map(({c,l})=>{const h=(l.title+' '+l.theory+' '+l.qs.map(x=>x.q+' '+x.correct).join(' ')).toLowerCase();return{c,l,s:w.reduce((n,x)=>n+(h.includes(x)?1:0),0)}}).filter(x=>x.s).sort((a,b)=>b.s-a.s).slice(0,2);
return sc.length?sc.map(x=>`📖 ${x.l.title}\n${x.l.theory}`).join('\n\n')+'\n\n(Oflayn rejim: javob darslardan olindi. To‘liq AI uchun ⚙ orqali kalit kiriting.)':'Bu haqda darslarda topa olmadim. Boshqacha so‘rab ko‘ring yoki ⚙ orqali AI’ni yoqing.'}
async function chatSend(){const i=$('#chq'),q=i.value.trim();if(!q)return;i.value='';chatAdd('me',q);CH.push({role:'user',content:q});CH=CH.slice(-10);const b=chatAdd('bot','…');
const k=aiKey();if(!k&&!SRV){const a=chatOffline(q);b.innerHTML=esc(a).replace(/\n/g,'<br>');CH.push({role:'assistant',content:a});return}
const titles=DB.courses.flatMap(c=>c.lessons.map(l=>l.title)).join('; ');
try{const r=await fetch(SRV?'/api/chat':'https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,...(SRV&&TOKEN?{authorization:'Bearer '+TOKEN}:{}),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
body:JSON.stringify({model:AIM,max_tokens:700,system:'Sen "Kompyuter savodxonligi" kursining do‘stona o‘qituvchisisan. Faqat o‘zbek tilida (lotin), sodda va qisqa (maks. 8 jumla) javob ber, kerak bo‘lsa misol keltir. Mavzu: kompyuter, internet, ofis dasturlari, xavfsizlik, texnologiya. Mavzudan tashqari savolga muloyim ravishda kursga qaytar. Mos dars bo‘lsa, uning nomini ayt. Kurs darslari: '+titles,messages:CH})});
const d=await r.json();if(!r.ok)throw new Error(d.error?.message||r.status);const a=d.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');b.innerHTML=esc(a).replace(/\n/g,'<br>');CH.push({role:'assistant',content:a})}
catch(e){CH.pop();const a=chatOffline(q);b.innerHTML=esc('AI ulanmadi ('+e.message+'). '+'\n\n'+a).replace(/\n/g,'<br>')}
$('#chm').scrollTop=1e9}
function chatShow(){const u=DB&&me();if(u&&u.on){chatInit();$('#chw').style.display=''}else if($('#chw')){$('#chw').style.display='none';CH=[];$('#chw').remove()}}
const _render=render;render=function(){_render();chatShow()};chatShow();
