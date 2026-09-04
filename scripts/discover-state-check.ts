/* فحصُ الدوران وحذف المكرّر — منطقٌ خالص، بلا شبكةٍ وبلا قاعدة.
 *   npx tsx scripts/discover-state-check.ts
 */
import { rotate, dedupeByName, shortTitle } from '../lib/discover';

let bad = 0;
const eq = (label: string, got: any, want: any) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { bad++; console.log('✗ ' + label + '\n   جاء: ' + JSON.stringify(got) + '\n   المتوقّع: ' + JSON.stringify(want)); }
  else console.log('✔ ' + label);
};

const fams = ['a', 'b', 'c', 'd', 'e'];
eq('الدوران يبدأ من الصفر', rotate(fams, 0, 2), { slice: ['a', 'b'], next: 2 });
eq('ثمّ يُكمل من حيث وقف', rotate(fams, 2, 2), { slice: ['c', 'd'], next: 4 });
eq('ويلتفّ عند النهاية', rotate(fams, 4, 2), { slice: ['e', 'a'], next: 1 });
eq('طلبٌ أوسع من القائمة لا يكرّر', rotate(fams, 0, 9), { slice: fams, next: 0 });
eq('قائمةٌ فارغة لا تُسقط', rotate([], 3, 4), { slice: [], next: 0 });

/* دورةٌ كاملة: خمس عائلاتٍ بسقف اثنتين ⇒ تُغطّى كلُّها */
let off = 0; const seenAll = new Set<string>();
for (let i = 0; i < 3; i++) { const r = rotate(fams, off, 2); r.slice.forEach((x) => seenAll.add(x)); off = r.next; }
eq('ثلاثُ تشغيلاتٍ تُغطّي الخمس', [...seenAll].sort(), fams);

const rows = [
  { title: 'NZXT Kraken Elite 360 RGB (2024) AIO Liquid CPU Cooler, 360mm Radiator' },
  { title: 'NZXT Kraken Elite 360 RGB (2024) AIO Liquid Cooler' },
  { title: 'NZXT Kraken 240 RGB 240mm AIO Liquid CPU Cooler' },
];
eq('المكرّر بالاسم يُحذف ولو اختلف الرابط', dedupeByName(rows).length, 2);
eq('والاسم المقصوص هو المفتاح', shortTitle(rows[0].title), shortTitle(rows[1].title));

console.log(bad === 0 ? '\nنجحت كلُّها' : '\nفشل ' + bad);
process.exit(bad ? 1 : 0);
