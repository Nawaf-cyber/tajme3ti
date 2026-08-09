/** جودة الكتالوج — المقياس الذي يفصل بين موقع يُوثق به وموقع يُهجر */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const comps = await prisma.component.findMany({
  include: { category: { select: { name: true } }, offers: true },
});

const sp = (c) => (typeof c.specs === 'string' ? JSON.parse(c.specs || '{}') : c.specs || {});

/* المفاتيح التي يقرأها منطق التوافق فعلاً — غيابها = القطعة غير مرئية للفحص */
const REQUIRED = {
  CPU: ['socket'],
  Motherboard: ['socket', 'ramType'],
  GPU: ['lengthMm', 'vram'],
  Case: ['maxGpuLength'],
  PSU: ['wattage'],
  RAM: ['type', 'capacity'],
  Storage: ['type', 'capacity'],
};

const problems = { missingFunctional: [], zeroTdp: [], noTier: [], noOffer: [], wrongKey: [] };

for (const c of comps) {
  const cat = c.category?.name || '';
  const s = sp(c);
  const need = REQUIRED[cat] || [];
  const missing = need.filter((k) => s[k] === undefined || s[k] === null || s[k] === '');
  if (missing.length) problems.missingFunctional.push(`${cat}/${c.name.slice(0, 26)} → ${missing.join(',')}`);

  // مفاتيح بصيغة خاطئة يتجاهلها الكود
  if (cat === 'GPU' && s.lengthMm === undefined && (s.length !== undefined || s.Length !== undefined))
    problems.wrongKey.push(`${c.name.slice(0, 30)} → length بدل lengthMm`);

  if (['CPU', 'GPU', 'Motherboard'].includes(cat) && !c.tdpWattage) problems.zeroTdp.push(`${cat}/${c.name.slice(0, 26)}`);
  if (['CPU', 'GPU', 'Motherboard', 'PSU', 'Storage'].includes(cat) && c.performanceTier == null)
    problems.noTier.push(`${cat}/${c.name.slice(0, 26)}`);
  if (!c.offers.some((o) => o.url)) problems.noOffer.push(`${cat}/${c.name.slice(0, 26)}`);
}

const n = comps.length;
const pct = (x) => `${Math.round((x / n) * 100)}%`;

console.log(`الكتالوج: ${n} قطعة · ${await prisma.componentOffer.count()} عرض · ${await prisma.store.count()} متاجر\n`);
console.log('══════ ثغرات تكسر المنطق ══════');
console.log(`مفاتيح توافق ناقصة : ${problems.missingFunctional.length} (${pct(problems.missingFunctional.length)})`);
problems.missingFunctional.slice(0, 6).forEach((x) => console.log('   ·', x));
console.log(`مفاتيح بصيغة مهملة : ${problems.wrongKey.length}`);
problems.wrongKey.slice(0, 5).forEach((x) => console.log('   ·', x));
console.log(`طاقة = 0 (تكسر حاسبة المزوّد): ${problems.zeroTdp.length}`);
problems.zeroTdp.slice(0, 5).forEach((x) => console.log('   ·', x));
console.log(`بلا مستوى أداء : ${problems.noTier.length}`);
console.log(`بلا أي رابط متجر : ${problems.noOffer.length} (${pct(problems.noOffer.length)})`);

// توزيع الفئات
const byCat = {};
for (const c of comps) byCat[c.category?.name || '؟'] = (byCat[c.category?.name || '؟'] || 0) + 1;
console.log('\n══════ عمق الكتالوج ══════');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${k.padEnd(14)} ${v}`));

// تغطية المتاجر
console.log('\n══════ تغطية المتاجر ══════');
for (const st of await prisma.store.findMany({ select: { name: true, id: true } })) {
  const withUrl = await prisma.componentOffer.count({ where: { storeId: st.id, url: { not: null } } });
  console.log(`   ${st.name.padEnd(12)} ${withUrl}/${n} = ${pct(withUrl)}`);
}

await prisma.$disconnect();
