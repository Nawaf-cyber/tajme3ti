/* ============ هل يفرّق المُطابق بين الشبيه والطرف؟ ============
 *
 * كل حالةٍ هنا خطأٌ وقع فعلاً أثناء التطوير، لا فرضٌ نظريّ. والفحص
 * يحرسها معاً — فأيّ تخفيفٍ في القواعد لاحقاً يُسقطه.
 *
 *   npx tsx scripts/source-match-check.ts
 */
import { fingerprint, matches, queryFor } from '../lib/source-match';
const G='\x1b[32m',R='\x1b[31m',D='\x1b[2m',X='\x1b[0m';
let pass=0, fail=0;
const t = (ok: boolean, title: string, detail = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); }
  else { fail++; console.log(`  ${R}✘ ${title}${X} ${detail}`); }
};

type Case = { brand: string; name: string; specs?: any; cand: string; want: boolean; note: string };
const CASES: Case[] = [
  { brand:'AMD', name:'Ryzen 9 9950X', cand:'AMD Ryzen 9 9950X3D AM5 Desktop Processor, 16 Cores', want:false, note:'9950X ≠ 9950X3D' },
  { brand:'AMD', name:'Ryzen 9 7900', cand:'AMD Ryzen 9 7900X 4.7 GHz AM5 170W Desktop Processor', want:false, note:'7900 ≠ 7900X' },
  { brand:'AMD', name:'Ryzen 5 5500', cand:'Lenovo IdeaPad Gaming 3 Laptop, AMD Ryzen 5 5500H, 8GB RAM', want:false, note:'لابتوب ليس معالجاً' },
  { brand:'AMD', name:'Ryzen 5 9600x', cand:'AMD Ryzen 5 9600X AM5 CPU Processor, 6 Cores, 12 Threads', want:true, note:'المطابق الصحيح يمرّ' },
  { brand:'MSI', name:'B650 Gaming Plus WiFi', specs:{formFactor:'ATX'}, cand:'MSI B650M GAMING PLUS WIFI mATX AM5 Motherboard', want:false, note:'ATX ≠ mATX' },
  { brand:'ASUS', name:'ROG Crosshair X670E Hero', cand:'Asus ROG Crosshair X670E Extreme EATX DDR5 Motherboard', want:false, note:'Hero ≠ Extreme' },
  { brand:'ASUS', name:'ROG Crosshair X670E Hero', cand:'Asus Rog Crosshair X670E Hero ATX DDR5 Motherboard, AM5 Socket', want:true, note:'Hero يمرّ' },
  { brand:'AMD', name:'Radeon RX 7900 GRE 16GB', specs:{capacity:'16GB'}, cand:'XFX Mercury AMD Radeon RX 7900 XTX Graphics Card, 24GB GDDR6', want:false, note:'GRE ≠ XTX' },
  { brand:'Seasonic', name:'FOCUS 650 Gold SSR-650FM', cand:'Seasonic Focus GX-650 650W 80+ Gold Fully Modular SSR-650FX', want:false, note:'SSR-650FM ≠ FX' },
  { brand:'DeepCool', name:'LE240 V2', cand:'DeepCool LE240 WH V2 240mm Liquid CPU Cooler White', want:false, note:'الأبيض ليس الأسود' },
  { brand:'DeepCool', name:'LE240 V2 White', cand:'DeepCool LE240 V2 240mm Liquid CPU Cooler', want:false, note:'والعكس كذلك' },
  /* قطعتنا GV-N506TWF2-16GD ومرشّحه GV-N506TWF2**OC**-16GD — طرازان.
     ويرفضه المطابق فعلاً، لا بكلمة «OC» بل برمز «16G»: حدُّ الكلمة يمنع
     مطابقتها بـ«16GB» لأن ما بعدها حرف. صوابٌ بطريقٍ غير مقصود، فيُثبَّت
     هنا كي لا يسقط لو خُفّفت القاعدة يوماً. */
  { brand:'Gigabyte', name:'GeForce RTX 5060 Ti WINDFORCE 16G', specs:{capacity:''}, cand:'GIGABYTE GeForce RTX 5060 Ti WINDFORCE OC Graphics Card, 16GB GDDR7, GV-N506TWF2OC-16GD', want:false, note:'WINDFORCE 16G ≠ WINDFORCE OC 16G' },
  { brand:'Corsair', name:'Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', specs:{capacity:'32GB'}, cand:'CORSAIR Vengeance LPX 32GB (2x 16GB) DDR4 Desktop Memory, 3600MHz', want:true, note:'المطابق التامّ يمرّ' },
  { brand:'Corsair', name:'Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', specs:{capacity:'32GB'}, cand:'CORSAIR Vengeance LPX 16GB (2x 8GB) DDR4 Desktop Memory, 3600MHz', want:false, note:'السعة تفصل' },
];

console.log('\nالحالات:');
for (const c of CASES) {
  const fp = fingerprint(c.brand, c.name, c.specs ?? {});
  const got = matches(fp, c.cand).ok;
  t(got === c.want, `${c.note}`, got === c.want ? '' : `(المتوقّع ${c.want} والناتج ${got})`);
}

console.log('\nصياغة السؤال:');
t(queryFor('Vengeance LPX 32GB (2x16GB) DDR4 3600MHz') === 'Vengeance LPX', 'يُجرَّد من الوحدات', queryFor('Vengeance LPX 32GB (2x16GB) DDR4 3600MHz'));
t(queryFor('GeForce RTX 5060 Ti WINDFORCE 16G').split(' ').length <= 3, 'ثلاث كلماتٍ على الأكثر', queryFor('GeForce RTX 5060 Ti WINDFORCE 16G'));

console.log(`\n${'═'.repeat(46)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass+fail}${X}`);
if (fail) process.exit(1);
