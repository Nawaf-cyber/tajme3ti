/**
 * ============ هل في الكتالوج سعرٌ متأخّرٌ لا تُظهره الشارة؟ ============
 *
 *   npx tsx scripts/price-age-audit.ts
 *
 * شارةُ «السعر المعروض قبل…» في اللوحة تقرأ `lastCheckedAt` للعرض الأرخص —
 * وهو وقتُ **آخر محاولة**، يُكتب حتى حين تفشل. فعرضٌ يفشل سحبُه يومياً
 * (مهلة، منتجٌ أُزيل) تبدو شارتُه «الآن» وسعرُه قديم.
 *
 * فهذا يقيس العمر الحقيقيّ: آخر قراءةٍ **ناجحة** للسعر المعروض، من سجلّ
 * الأسعار (نقطةٌ لكلّ متجرٍ في كلّ يومٍ نجح فيه). ويطبع:
 *   HIDDEN  — الشارة تقول أحدث ممّا هو (فرقٌ أكثر من يوم)
 *   STALE   — آخر قراءةٍ ناجحة أقدم من يومٍ ونصف
 *   MANUAL  — السعر المعروض يدويّ (متجرٌ سحبُه موقوف)
 * وقطعةٌ لا تظهر هنا سعرُها مؤكَّدٌ خلال يومٍ ونصف.
 *
 * قِيس 2026-09-24 أوّلَ مرّة: ٢٩٢ قطعةً مؤكَّدة · ثمانٍ يدويّة من نون عمرُها
 * ٣٣ يوماً في السجلّ (السكربت اليدويّ لم يكن يكتبه) · ولا مخفيّ في المسحوب.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { cheapestOffer } from '../lib/stores';

const D = 864e5;
const now = Date.now();

(async () => {
  const comps = await prisma.component.findMany({
    select: { id: true, name: true, offers: { include: { store: true } } },
  });
  const last = await prisma.priceHistory.groupBy({ by: ['componentId', 'store'], _max: { recordedAt: true } });
  const okAt = new Map(last.map((x) => [`${x.componentId}|${x.store}`, x._max.recordedAt!.getTime()]));

  let fine = 0;
  let noLive = 0;
  const rows: string[] = [];

  for (const c of comps) {
    const w: any = cheapestOffer(c.offers as any);
    if (!w) { noLive++; continue; }

    const badge = w.lastCheckedAt ? (now - new Date(w.lastCheckedAt).getTime()) / D : Infinity;
    const at = okAt.get(`${c.id}|${w.store.slug}`);
    const real = at ? (now - at) / D : Infinity;
    const manual = w.store.scrapeMode === 'off';

    if (real <= 1.5 && !manual) { fine++; continue; }

    const tag = real - badge > 1 ? 'HIDDEN' : manual ? 'MANUAL' : 'STALE ';
    const fmt = (d: number) => (d === Infinity ? 'أبداً' : `${d.toFixed(1)}ي`);
    rows.push(
      `${tag}  ${c.name.slice(0, 42).padEnd(42)} ${w.store.slug.padEnd(9)} ${String(w.price).padEnd(8)}` +
      ` الشارة ${fmt(badge)} · الحقيقة ${fmt(real)}${w.lastError ? `  | ${w.lastError.slice(0, 50)}` : ''}`,
    );
  }

  console.log(`${comps.length} قطعة · مؤكَّدة خلال يومٍ ونصف: ${fine} · بلا عرضٍ متوفّر: ${noLive}\n`);
  rows.sort().forEach((r) => console.log(r));
  const hidden = rows.filter((r) => r.startsWith('HIDDEN')).length;
  console.log(hidden ? `\n✗ ${hidden} شارةً تُخفي تأخّراً` : '\n✓ لا شارةَ تُخفي تأخّراً');
  await prisma.$disconnect();
  process.exit(hidden ? 1 : 0);
})();
