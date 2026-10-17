# Kompyuter Savodxonligi (demo)

Faqat HTML5, CSS3 va Vanilla JavaScript. Build kerak emas.

## Ishga tushirish
1. `index.html` faylini brauzerda oching.
2. Baza bo‘sh boshlanadi. **Birinchi ro‘yxatdan o‘tgan foydalanuvchi administrator** bo‘ladi.
3. Keyingi foydalanuvchilar o‘quvchi bo‘ladi. Administrator "Foydalanuvchilar" bo‘limida ularni o‘qituvchi qilishi mumkin (o‘qituvchi bo‘lgan odam kursni o‘z nazoratiga oladi).

## 20 dars va 200 savolni yuklash
Administrator sifatida kiring, **Ma’lumotlar → Eski testlarni import qilish** bo‘limida eski HTML faylingizni (`testsData` bor fayl) tanlang.
Darslar va savollar o‘zgarishsiz ko‘chiriladi. To‘g‘ri javob matn sifatida saqlanadi, shuning uchun variantlar aralashganda ham to‘g‘ri javob buzilmaydi.

## Ma’lumotlar
- Hammasi brauzer localStorage'ida (`kl_db_v4`) saqlanadi.
- Administrator: JSON eksport/import, demo ma’lumotlarni tiklash (reset).
- Ma’lumotlarni tiklash: **Ma’lumotlar → Tiklash**, yoki brauzerda shu sayt uchun saqlangan ma’lumotni tozalang.

## Eslatma
Bu brauzer ichidagi demo. Parol va rollar haqiqiy xavfsizlik chegarasi emas. Ko‘p foydalanuvchili real tizim uchun backend kerak.

## Yangiliklar (v7)
- **Bosh sahifa**: kirishdan oldin sayt endi bo‘sh emas — 40 mavzuli darslik mundarijasi, statistika va qidiruv ko‘rinadi. Darslikni ro‘yxatdan o‘tmasdan ham o‘qish mumkin.
- **📖 Darslik** (`js/book1.js`, `js/book2.js`): 40 ta mavzu, har biri kirish, bo‘limlar, maslahat va testga o‘tish tugmasi bilan. Bobni o‘qigach o‘quvchi shu yerning o‘zidan testni boshlaydi (kursga avtomatik yoziladi), natija jurnal va reytingga tushadi.
- **3D orqa fon** (`js/bg3d.js`): aylanayotgan karkas shakllar va zarralar tarmog‘i. Kutubxona kerak emas, oflayn ishlaydi, light/dark rejimga moslashadi, sichqonchaga javob beradi. Tizimda “harakatni kamaytirish” yoqilgan bo‘lsa harakatsiz kadr ko‘rsatadi.
- Tuzatishlar: `go is not defined` xatosi (`extras.js` endi `app.js` dan keyin yuklanadi), test natijasidagi `${Math.ceil…}` matni.
- Darslik matnini tahrirlash: `js/book1.js` (1–20) va `js/book2.js` (21–40). Matnda `**qalin**` va `` `tugma` `` belgilari ishlaydi.

### v7.1 — qo‘shimcha funksiyalar (`js/extra2.js`)
- 🎯 **Tezkor mashq**: har bir bobning oxirida 5 ta tasodifiy savol, javob darhol tekshiriladi (kirish shart emas, natija saqlanmaydi).
- ⭐ **Xatcho‘plar**, ▶ **Davom etish** (oxirgi o‘qilgan mavzu), 🔥 **kunlik seriya** va 8 ta **yutuq**.
- **A− / A+** matn o‘lchami, 🖨 **chop etish** (faqat bob matni chiqadi), klaviaturadagi **← →** tugmalari bilan mavzular almashadi.
- Bular brauzerda (localStorage) saqlanadi, bazaga tegmaydi.

## Oldingi yangiliklar
- Yangi zamonaviy dizayn (teal/ko‘k, light/dark).
- Kurs 40 darsga kengaytirildi (21–40: `js/course40.js`). Eski bazaga ham avtomatik qo‘shiladi.
- **📒 O‘quvchilar jurnali**: o‘qituvchi/admin katakni bosib belgi (2–5, n) qo‘yadi, test natijalari avtomatik tushadi, CSV eksport bor. O‘quvchi o‘z qatorini ko‘radi.
- O‘tish bali 65% (10 savolda 7, 3 savolda 2 ta to‘g‘ri).
- **💬 AI yordamchi** (`js/chat.js`): o‘quvchi qiziqqan savolini yozadi. ⚙ tugmasi orqali Anthropic API kaliti kiritilsa Claude javob beradi; kalitsiz oflayn rejimda darslar matnidan qidiradi. Kalit brauzerda saqlanadi — haqiqiy loyihada kalitni backend orqali yashiring.
- Tayyor **o‘qituvchilar**: fozil, dima, dilshod (`js/seed.js`, login = `ism@kl.uz`). 40 darslik kurs uchchalasiga biriktirilgan (o‘quvchi sifatida yozilmagan). Administrator hali yo‘q bo‘lsa birinchi ro‘yxatdan o‘tgan administrator bo‘ladi, undan keyingilar o‘quvchi.
- Kurs tasodifan o‘chirilsa: avtomatik bir marta tiklanadi, keyin Administrator → Ma’lumotlar → **Kursni tiklash** tugmasi bor.

## Server rejimi (tavsiya etiladi)
```
node server.js            # http://localhost:3000   (Node 18+, kutubxona kerak emas)
ANTHROPIC_API_KEY=sk-... node server.js   # AI yordamchi serverdan ishlaydi, kalit o‘quvchiga ko‘rinmaydi
```
- Baza `data/db.json` da, parollar scrypt bilan hashlangan, sessiya imzolangan token (7 kun).
- Rollar serverda tekshiriladi: o‘quvchi faqat o‘z natijalarini yozadi, o‘qituvchi faqat o‘z kurslarini, foydalanuvchi rollari faqat admin o‘zgartiradi.
- Kirishga urinishlar cheklangan (10 ta / 10 daqiqa), AI soatiga 30 ta savol.
- Yangi: 🔑 parolni almashtirish, admin uchun parol tiklash, 🏆 reyting.
- `index.html` ni to‘g‘ridan-to‘g‘ri ochsangiz eski brauzer rejimi ishlaydi.
