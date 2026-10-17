/* NAMUNA ma'lumotlar (boshlang'ich demo). To'liq 20 dars / 200 savol admin panelidagi "Eski testlarni import qilish" orqali yuklanadi. */
const SAMPLE_COURSE={id:'c1',owner:'u_t',title:'Kompyuter savodxonligi (namuna)',cat:'Asoslar',desc:'Namuna kurs. To‘liq 20 darsni admin paneldan import qiling.',published:true,
lessons:[{id:'l1',title:'Kompyuter bilan tanishish',theory:'Kompyuterning asosiy qismlari: monitor, sistemali blok, klaviatura va sichqoncha. Sistemali blok ma’lumotlarni qayta ishlaydi.',video:'',img:'',
qs:[{id:'q1',q:'Sistemali blokning asosiy vazifasi nima?',opts:['Ma’lumotlarni qayta ishlash','Hujjat chop etish','Faqat ovoz chiqarish','Rasm chizish'],correct:'Ma’lumotlarni qayta ishlash',exp:'Sistemali blok kompyuterning “miyasi”.'},
{id:'q2',q:'Qaysi qurilma chiqarish qurilmasi?',opts:['Klaviatura','Printer','Sichqoncha','Mikrofon'],correct:'Printer',exp:'Printer ma’lumotni qog‘ozga chiqaradi.'},
{id:'q3',q:'Kompyuter o‘chganda qaysi xotira ma’lumotni yo‘qotadi?',opts:['SSD','HDD','RAM','Fleshka'],correct:'RAM',exp:'RAM vaqtinchalik xotira.'}]},
{id:'l2',title:'Microsoft Word',theory:'Word matnli hujjatlar uchun (.docx). Ctrl+S saqlash, Ctrl+C nusxa, Ctrl+V qo‘yish, Ctrl+Z bekor qilish.',video:'',img:'',
qs:[{id:'q4',q:'Matnni saqlash tugmalari qaysi?',opts:['Ctrl + P','Ctrl + N','Ctrl + S','Ctrl + Q'],correct:'Ctrl + S',exp:''},
{id:'q5',q:'Word faylining kengaytmasi?',opts:['.xlsx','.docx','.pptx','.mp3'],correct:'.docx',exp:''}]}],
asg:[{id:'a1',title:'Rezyume tayyorlash',desc:'Word’da bir sahifali CV tayyorlang va mazmunini yozing.',due:''}]};
/* Eski testsData ni yangi tuzilmaga o'tkazadi. To'g'ri javob matn sifatida saqlanadi, shuning uchun aralashtirganda bog'liqlik buzilmaydi. */
function convertOld(arr){let bad=0;const lessons=arr.map(d=>({id:'l'+d.dayNumber,title:d.topicTitle,theory:d.theory||'',video:'',img:'',
qs:(d.questions||[]).filter(q=>{const ok=Array.isArray(q.options)&&q.options[q.correctIndex]!==undefined;if(!ok)bad++;return ok}).map(q=>({id:'q'+d.dayNumber+'_'+q.id,q:q.question,opts:q.options,correct:q.options[q.correctIndex],exp:''}))}));
return{lessons,bad}}
