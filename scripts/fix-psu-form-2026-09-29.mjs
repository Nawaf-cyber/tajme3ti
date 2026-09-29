/**
 * ============ مقاسات مزوّدٍ وكيسٍ مسجّلة خطأً — 2026-09-29 ============
 *
 * ظهرت أثناء مراجعة ملاحظات المزودات (lib/series.ts):
 *
 *  · Corsair HX1500i — «ATX 3.0» ← «ATX 3.1». العرضان المتوفّران (مايكرولس
 *    وأمازون B0F3JHTL2R) نسخة 2025، ومراجعة Tom's Hardware لها: ATX 3.1.
 *  · Seasonic Focus SGX-650 — «SFX» ← «SFX-L»، والاسم معه. Seasonic تسمّيها
 *    SFX-L ومراجعة Tom's Hardware كذلك (SSR-650SGX)؛ وعرض أمازون الوحيد
 *    (B07JVQQK69) هو هذه النسخة.
 *  · Thermaltake TR100 — «SFX» ← «SFX / SFX-L». صفحة Thermaltake: «a removable
 *    PSU bracket and two sets of screw holes, supporting both SFX and SFX-L».
 *
 * أثر الخطأين الأخيرين معاً على الفحص: كان الباني يقبل SGX-650 في TR100 لأنه
 * ظنّه SFX — والحكم صحيحٌ مصادفةً. بعد التصحيح يقبله لأنه SFX-L والكيس يدعمه.
 *
 *   node scripts/fix-psu-form-2026-09-29.mjs           # عرض
 *   node scripts/fix-psu-form-2026-09-29.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/* الوصف يُصحَّح بسطورٍ بعينها لا بإعادة كتابة — [قديم، جديد]، وكلُّ قديمٍ يجب أن يوجد مرّةً واحدة */
const FIXES = [
  { brand: 'Corsair', name: 'HX1500i', specs: { formFactor: 'ATX 3.1' } },
  {
    brand: 'Seasonic', name: 'Focus SGX-650 650W Gold SFX', rename: 'Focus SGX-650 650W Gold SFX-L', specs: { formFactor: 'SFX-L' },
    desc: [
      ['### Seasonic Focus SGX-650 650W Gold SFX\n', '### Seasonic Focus SGX-650 650W Gold SFX-L\n'],
      ['**أرخص مزوّد SFX في الكتالوج**', '**أرخص مزوّدٍ صغير (SFX/SFX-L) في الكتالوج**'],
      ['[green]مقاس SFX:[/green] يدخل الصناديق الصغيرة التي ترفض المزوّد العادي — وفي الكتالوج أربعة منها.', '[green]مقاس SFX-L:[/green] يدخل الصناديق الصغيرة التي ترفض المزوّد العادي، إن كانت تدعم SFX-L.'],
      ['* SFX لا SFX-L: أصغر، لكن بعض الصناديق تفضّل الأكبر لهدوئه.', '* SFX-L لا SFX: أطول من SFX العاديّ (100 مم)، فبعض الصناديق الصغيرة جدّاً لا تقبله — تحقّق من كيسك.'],
    ],
  },
  {
    brand: 'Thermaltake', name: 'TR100 Mini-ITX', specs: { psuFormFactor: 'SFX / SFX-L' },
    desc: [
      ['بمزوّد **SFX إلزاميّ**', 'بمزوّدٍ صغير **إلزاميّ (SFX أو SFX-L)**'],
      ['* ⚠️ **مزوّد SFX فقط** — لا ATX.', '* ⚠️ **مزوّد SFX أو SFX-L فقط** — لا ATX.'],
    ],
  },
];

const fixDesc = (text, pairs = []) => {
  let t = text || '';
  for (const [a, b] of pairs) {
    const n = t.split(a).length - 1;
    if (n !== 1) throw new Error(`سطر الوصف موجود ${n} مرّة: ${a.slice(0, 60)}`);
    t = t.replace(a, b);
  }
  return t;
};

const backup = [];
let blocked = false;
for (const f of FIXES) {
  const c = await prisma.component.findFirst({ where: { brand: f.brand, name: f.name }, select: { id: true, name: true, specs: true, description: true } });
  if (!c) { console.log(`⛔ لم أجد ${f.brand} ${f.name}`); blocked = true; continue; }
  backup.push(c);
  console.log(`\n=== ${f.brand} ${c.name}  (${c.id})`);
  for (const [k, v] of Object.entries(f.specs)) console.log(`    ${k}: ${JSON.stringify(c.specs?.[k])} ← ${JSON.stringify(v)}`);
  if (f.rename) {
    const dup = await prisma.component.findFirst({ where: { brand: f.brand, name: f.rename } });
    if (dup) { console.log(`    ⛔ الاسم الجديد مستعمل: ${dup.id}`); blocked = true; }
    console.log(`    الاسم: «${c.name}» ← «${f.rename}»`);
  }
  try {
    const next = fixDesc(c.description, f.desc);
    const before = (c.description || '').split('\n'), after = next.split('\n');
    before.forEach((l, i) => { if (l !== after[i]) console.log(`    الوصف:\n      − ${l.slice(0, 150)}\n      + ${after[i].slice(0, 150)}`); });
  } catch (e) { console.log(`    ⛔ ${e.message}`); blocked = true; }
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/psu-form-fix-${stamp}.json`, JSON.stringify(backup, null, 2));
console.log(`\nنسخة احتياطية: backups/psu-form-fix-${stamp}.json`);

for (const f of FIXES) {
  const c = backup.find((b) => b.name === f.name);
  await prisma.component.update({
    where: { id: c.id },
    data: { specs: { ...c.specs, ...f.specs }, description: fixDesc(c.description, f.desc), ...(f.rename ? { name: f.rename } : {}) },
  });
  console.log(`✔ ${f.brand} ${f.rename ?? f.name}`);
}
await prisma.$disconnect();
