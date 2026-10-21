/**
 * ============ مستوى الأداء من القياس — المعالجات كلّها وثلاثة كروت — 2026-10-21 ============
 *
 * بعد إصلاح النسخ الأربع (fix-cpu-tier-twins-2026-10-21) طلب نوّاف إصلاح المستويات كلّها.
 * المستوى كان يُكتب يدوياً فيتناقض مع القياس (Core Ultra 9 285K = 5 وألعابه 71.8 دون 9600X
 * ذي المستوى 3)، والباني يحكم به على الاختناق ويرسم الفريمات ويقترح الترقية، والمساعد يبني به.
 *
 * المعالجات: من أداء الألعاب المقيس (lib/perf-tier · cpuTierFromGaming)، وما لا قياس له يأخذ
 * مستوى نظيره المقيس (cpuStem: F/KF/KS والنسخة بلا X). وما لا قياس له ولا نظير يبقى — لا تقدير.
 * والمونتاج في المساعد صار يقرأ تعدّد الأنوية (lib/intent-plans · forUse)، وإلّا اختار X3D
 * الثمانيّ الأنوية بدل i9 ذي الأربعة والعشرين.
 *
 * الكروت: مستوياتها متّسقة مع إطارات 1440p المقيسة إلّا عند حدّ ٢/٣: RTX 5060 (59.8) = 2،
 * و4060 Ti (58.9) و3070 (58.2) و6750 XT (57.6) = 3. فتنزل الثلاثة إلى 2 — لا يرتفع 5060:
 * رفعُه أخرجه من «ألعاب خفيفة» (سقفها ٢) فصارت خطّتها RTX 5050 بـ45 إطاراً بدل 60.
 *
 * الأثر على خطط المساعد (٢٠ تركيبة، جُرّب في الذاكرة): ١٤ تتغيّر، كلّها إلى قطعةٍ أعلى قياساً
 * (14600KF ← 14700F مع 5080، و6750 XT ← 7700 XT في 1440p، و14900KF ← 7800X3D في البثّ).
 *
 *   npx tsx scripts/fix-perf-tiers-measured-2026-10-21.ts            # عرضٌ فقط
 *   npx tsx scripts/fix-perf-tiers-measured-2026-10-21.ts --apply    # نسخة احتياطيّة ثمّ الكتابة
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { cpuPerf } from '../lib/cpu-perf';
import { cpuTierFromGaming, cpuStem } from '../lib/perf-tier';

const apply = process.argv.includes('--apply');
/** الكروت الثلاثة — [بداية الاسم، المستوى المتوقَّع قبل، الجديد] */
const GPU_FIXES: [RegExp, number, number][] = [
  [/^GeForce RTX 4060 Ti\b/i, 3, 2],
  [/^GeForce RTX 3070\b/i, 3, 2],
  [/^Radeon RX 6750 XT\b/i, 3, 2],
];

async function main() {
  const cpus = await prisma.component.findMany({ where: { category: { name: 'CPU' } }, select: { id: true, name: true, performanceTier: true } });
  const gpus = await prisma.component.findMany({ where: { category: { name: 'GPU' } }, select: { id: true, name: true, performanceTier: true } });

  const target = new Map<string, number>();
  for (const c of cpus) { const g = cpuPerf(c.name)?.gaming; if (g != null) target.set(c.id, cpuTierFromGaming(g)); }
  for (const c of cpus) {
    if (target.has(c.id)) continue;
    const twin = cpus.find((x) => x.id !== c.id && target.has(x.id) && cpuStem(x.name) === cpuStem(c.name));
    if (twin) target.set(c.id, target.get(twin.id)!);
  }
  for (const g of gpus) {
    const fix = GPU_FIXES.find(([re]) => re.test(g.name));
    if (!fix) continue;
    if (g.performanceTier !== fix[1] && g.performanceTier !== fix[2]) throw new Error(`تغيّر مستوى ${g.name}: ${g.performanceTier}`);
    target.set(g.id, fix[2]);
  }

  const rows = [...cpus, ...gpus]
    .filter((c) => target.has(c.id) && target.get(c.id) !== c.performanceTier)
    .map((c) => ({ id: c.id, name: c.name, from: c.performanceTier, to: target.get(c.id)!, gaming: cpuPerf(c.name)?.gaming ?? null }));
  for (const r of rows) console.log(`  ${r.name.padEnd(30)} ${r.from} ← ${r.to}${r.gaming != null ? `   (ألعاب ${r.gaming})` : ''}`);
  console.log(`\n${rows.length} تغييراً · معالجات بلا قياسٍ ولا نظير تبقى: ${cpus.filter((c) => !target.has(c.id)).length}`);

  if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); return; }
  if (!rows.length) { console.log('لا شيء يُكتب.'); return; }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/fix-perf-tiers-measured-${stamp}.json`, JSON.stringify(rows, null, 2));
  for (const r of rows) await prisma.component.update({ where: { id: r.id }, data: { performanceTier: r.to } });
  console.log(`✔ كُتب ${rows.length} — النسخة في backups/fix-perf-tiers-measured-${stamp}.json`);
}

main().catch((e) => { console.error('⛔', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
