/**
 * ============ مستوى الأداء: نسخٌ هي نفس الشريحة بمستوياتٍ مقلوبة — 2026-10-21 ============
 *
 * بلاغ نوّاف: مع RTX 5080 يقول الباني «توازن ممتاز» لـRyzen 5 9600، ويحذّر من اختناق
 * المعالج مع 9600X — وهو الأسرع منهما. والسبب `performanceTier` المكتوب يدوياً:
 * 9600 = 4 و9600X = 3. والباني يقارن مستوى المعالج بمستوى الكرت (الفرق ≥٢ = اختناق)،
 * ومنه تُحسب بطاقات «الأداء المتوقّع» (FpsEstimator) واقتراحات الترقية — فاقترح 9600
 * «ترقيةً» من 9600X.
 *
 * وفُحص كلّ المعالجات مقابل أداء الألعاب المقيس (lib/cpu-perf · Tom's Hardware):
 *   Ryzen 5 9600   4 ← 3   نظيره 9600X مستواه 3 (ألعاب 72.6) — والعاديّ أبطأ قليلاً
 *   Ryzen 7 7700   4 ← 3   نظيره 7700X مستواه 3 (ألعاب 70.6)
 *   Ryzen 9 7900   5 ← 4   نظيره 7900X مستواه 4 (ألعاب 69.2)
 *   Core i5-14600K 3 ← 4   نظيره 14600KF مستواه 4 — نفس الشريحة بالضبط (ألعاب 72.8)
 *
 * ⚠️ ولماذا 14600K يرتفع ولا 14600KF ينزل: إنزال الـKF إلى ٣ جرّبناه في الذاكرة على خطط
 * المساعد العشرين (scripts/intent-plans-audit) فصارت سبعٌ منها تختار Core Ultra 7 265KF
 * بدلاً منه — وهو **أبطأ** في الألعاب (70.3) وأغلى بـ٣٤٧ ريالاً، لأنّ مستواه هو الآخر
 * مكتوبٌ يدوياً (٤). وهذا الإصلاح الضيّق: صفر خططٍ تتغيّر.
 *
 * والأوسع (المستوى كلّه من القياس) يغيّر ٢٣ معالجاً و١٢ خطّة، ويرفع معالجاتٍ قديمة غير
 * مقيسة (13900KS) إلى الاختيار الأوّل — يحتاج قياس الناقص قبله. لم يُنفَّذ.
 *
 *   npx tsx scripts/fix-cpu-tier-twins-2026-10-21.ts            # عرضٌ فقط
 *   npx tsx scripts/fix-cpu-tier-twins-2026-10-21.ts --apply    # نسخة احتياطيّة ثمّ الكتابة
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

/** [الاسم، المستوى المتوقَّع قبل الإصلاح، الجديد، نظيره المقيس] */
const FIXES: [string, number, number, string][] = [
  ['Ryzen 5 9600', 4, 3, 'Ryzen 5 9600x'],
  ['Ryzen 7 7700', 4, 3, 'Ryzen 7 7700X'],
  ['Ryzen 9 7900', 5, 4, 'Ryzen 9 7900X'],
  ['Core i5-14600K', 3, 4, 'Core i5-14600KF'],
];

async function main() {
  const rows: { id: string; name: string; from: number | null; to: number }[] = [];
  for (const [name, expected, to, twinName] of FIXES) {
    const c = await prisma.component.findFirst({ where: { name, category: { name: 'CPU' } }, select: { id: true, name: true, performanceTier: true } });
    const twin = await prisma.component.findFirst({ where: { name: twinName, category: { name: 'CPU' } }, select: { performanceTier: true } });
    if (!c || !twin) throw new Error(`لم يُوجد: ${!c ? name : twinName}`);
    if (twin.performanceTier !== to) throw new Error(`تغيّر مستوى النظير ${twinName}: ${twin.performanceTier} (المتوقَّع ${to})`);
    if (c.performanceTier === to) { console.log(`  ${name}: مُصحَّح سابقاً (${to})`); continue; }
    if (c.performanceTier !== expected) throw new Error(`تغيّر مستوى ${name}: ${c.performanceTier} (المتوقَّع ${expected})`);
    console.log(`  ${name.padEnd(16)} ${c.performanceTier} ← ${to}   (نظيره ${twinName}: ${twin.performanceTier})`);
    rows.push({ id: c.id, name: c.name, from: c.performanceTier, to });
  }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); return; }
  if (!rows.length) { console.log('\nلا شيء يُكتب.'); return; }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/fix-cpu-tier-twins-${stamp}.json`, JSON.stringify(rows, null, 2));
  for (const r of rows) await prisma.component.update({ where: { id: r.id }, data: { performanceTier: r.to } });
  console.log(`\n✔ كُتب ${rows.length} — النسخة في backups/fix-cpu-tier-twins-${stamp}.json`);
}

main().catch((e) => { console.error('⛔', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
