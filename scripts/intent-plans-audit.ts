/**
 * ============ فحص «ما تدري وش تبي؟» على الكتالوج الحيّ — قراءةٌ فقط ============
 *
 *   npx tsx scripts/intent-plans-audit.ts             # الخلاصة والمشكلات
 *   npx tsx scripts/intent-plans-audit.ts --all       # وكلّ خطّة بقطعها
 *
 * لماذا: الخطط تُبنى من الكتالوج لحظة الطلب، والأسعار والمخزون يتغيّران يومياً —
 * فخطّةٌ سليمة اليوم قد تخرج غداً بلا مبرّد أو بقطعة لا تُركَّب، ولا يراها أحد.
 * مراجعة 2026-10-14 وجدت ٣٣ من ٣٦ خطّة بلا مبرّد عاشت هكذا منذ كُتبت الميزة.
 *
 * يبني الخطط بالدالّة نفسها التي يستدعيها الباني (lib/intent-plans) لكلّ تركيبة
 * يصل إليها الزائر، ويفحص كلّ خطّة بفحص الباني نفسه (lib/build-check):
 *   ⛔ خطأ: مانعُ تركيب، أو بلا مبرّد، أو قطعةٌ غير متوفّرة، أو سلّمٌ مقلوب
 *          (خطّةٌ أرخص من التي قبلها).
 *   ⚠ ملاحظة: أيُّ تحذيرٍ آخر من الفحص، وكرتٌ دون حاجة الذاكرة، وقرصٌ 4TB فأكثر.
 * ويخرج برمز ١ إن وُجد خطأ.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { HAS_PARTS } from '../lib/categories';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { isAvailable } from '../lib/stores';
import { checkBuild } from '../lib/build-check';
import { buildIntentPlans, type Intent } from '../lib/intent-plans';

const showAll = process.argv.includes('--all');

/* كلّ ما يصل إليه الزائر في components/IntentPicker.tsx: الألعاب والبثّ بدقّاتها
   الثلاث، والمكتبي والمونتاج بلا دقّة، وتفضيلات الشركة، وخيار «أبثّ أحياناً» */
const RES = ['1080p', '1440p', '4K'];
const base = (use: string, resolution: string | null, extra: Partial<Intent> = {}): Intent =>
  ({ use, resolution, alsoStreams: use === 'streaming', gpuBrand: null, cpuBrand: null, ...extra });
const COMBOS: Intent[] = [
  ...['competitive-shooter', 'aaa-gaming', 'casual-gaming', 'streaming'].flatMap((u) => RES.map((r) => base(u, r))),
  base('office', null), base('editing', null),
  ...['NVIDIA', 'AMD', 'Intel'].map((b) => base('aaa-gaming', '1440p', { gpuBrand: b })),
  ...['AMD', 'Intel'].map((b) => base('competitive-shooter', '1440p', { cpuBrand: b })),
  base('aaa-gaming', '1440p', { alsoStreams: true }),
];

const specs = (c: any) => (!c ? {} : typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {});
const num = (v: unknown) => { const m = String(v ?? '').match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };
const tb = (c: any) => { const s = String(specs(c).capacity || ''); return /TB/i.test(s) ? num(s) : num(s) / 1000; };
const vram = (c: any) => num(specs(c).vram) || num(String(c?.name || '').match(/(\d+)\s*GB/i)?.[1]);
const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

async function main() {
  const categories = await prisma.category.findMany({ where: HAS_PARTS, include: { components: { include: OFFER_INCLUDE, orderBy: [{ brand: 'asc' }, { name: 'asc' }] } } }); // ترتيب الباني نفسه (app/builder/page.tsx)
  let plansN = 0, errors = 0, notes = 0;
  const totals: number[] = [];

  for (const intent of COMBOS) {
    const tag = [intent.use, intent.resolution, intent.gpuBrand && `كرت ${intent.gpuBrand}`, intent.cpuBrand && `معالج ${intent.cpuBrand}`, intent.alsoStreams && intent.use !== 'streaming' && 'مع بثّ']
      .filter(Boolean).join(' · ');
    const plans = buildIntentPlans(categories as any, intent) || [];
    const lines: string[] = [];
    if (!plans.length) { lines.push('  ⛔ لا خطّة — تعذّر البناء من المتوفّر'); errors++; }

    plans.forEach((p, i) => {
      plansN++; totals.push(Math.round(p.total));
      const k = p.picks;
      const bad: string[] = [], warn: string[] = [];
      for (const issue of checkBuild(k)) {
        if (issue.level === 'block' || issue.code === 'noCooler') bad.push(`${issue.code}: ${issue.message}`);
        else warn.push(`${issue.code}: ${issue.message}`);
      }
      for (const [cat, c] of Object.entries(k)) if (c && !isAvailable(c)) bad.push(`${cat} غير متوفّر: ${c.name}`);
      if (i > 0 && p.total <= plans[i - 1].total) bad.push(`سلّمٌ مقلوب: ${Math.round(p.total)} ≤ ${Math.round(plans[i - 1].total)}`);
      if (k.GPU && p.vramNeed && vram(k.GPU) < p.vramNeed) warn.push(`ذاكرة الكرت ${vram(k.GPU)}GB دون الحاجة ${p.vramNeed}GB (لا أكبر منها في المستوى)`);
      if (tb(k.Storage) >= 4) warn.push(`قرص ${tb(k.Storage)}TB`);
      errors += bad.length; notes += warn.length;

      if (showAll || bad.length || warn.length) {
        const gpu = k.GPU ? `${short(k.GPU.name, 26)}${p.perf ? ` ~${p.perf.fps}fps` : ''}` : 'بلا كرت';
        lines.push(`  ${p.label.padEnd(9)} ${String(Math.round(p.total)).padStart(6)}﷼ | ${short(k.CPU.name, 20)} | ${gpu} | ${specs(k.RAM).capacity} ${specs(k.RAM).speed} | ${specs(k.Storage).capacity} | ${short(k.Case.name, 18)} | ${k.Cooler ? short(k.Cooler.name, 22) : 'مبرّد العلبة'}`);
        for (const b of bad) lines.push(`      ⛔ ${b}`);
        for (const w of warn) lines.push(`      ⚠ ${w}`);
      }
    });

    if (lines.length) console.log(`\n▸ ${tag} — ${plans.length} خطط\n${lines.join('\n')}`);
  }

  totals.sort((a, b) => a - b);
  console.log(`\n■ ${COMBOS.length} تركيبة · ${plansN} خطّة · أخطاء ${errors} · ملاحظات ${notes} · الأسعار ${totals[0]}–${totals.at(-1)}﷼`);
  if (errors) process.exitCode = 1;
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
