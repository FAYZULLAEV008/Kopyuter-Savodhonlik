/* Tayyor o‘qituvchilar (Fozil, Dima, Dilshod). Parollar SHA-256 hash ko‘rinishida saqlanadi. Qolgan hamma ro‘yxatdan o‘tganda o‘quvchi bo‘ladi. */
const SEED=[{id:'u_fozil',name:'Fozil',email:'fozil@kl.uz',pw:'9d249f3e2680e9b4d16a82105a67091925fa97d0b042e55464ea89680fe6e2a0',role:'teacher',on:true},
{id:'u_dima',name:'Dima',email:'dima@kl.uz',pw:'47d1b970d7292a20ec2b5b212e37df41bdf6ee734fff289d4a9bbf977637ffad',role:'teacher',on:true},
{id:'u_dilshod',name:'Dilshod',email:'dilshod@kl.uz',pw:'18d02929ec1e2c7f0221f21b7bc8ed0acc1c8d96b87a2291b93e51aeca6adc39',role:'teacher',on:true}];
function seedUsers(){SEED.forEach(s=>{const u=DB.users.find(x=>x.email===s.email);if(!u)DB.users.push({...s});else if(!DB.sr&&u.id===s.id)u.role='teacher'});
if(!DB.sr){DB.enr=DB.enr.filter(e=>!(e.c==='c20'&&SEED.some(s=>s.id===e.u)));const c=DB.courses.find(x=>x.id==='c20');if(c&&!c.owner)c.owner=SEED.map(s=>s.id);DB.sr=1}}
