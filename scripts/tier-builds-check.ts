/**
 * فحص التجميعات اليوميّة الثلاث (lib/auto-builds) على أيّامٍ قادمة — قراءة فقط.
 *
 *   npx tsx --env-file-if-exists=.env.local --env-file-if-exists=.env scripts/tier-builds-check.ts [عدد الأيّام=90]
 *
 * يقول: كم يوماً خرجت فيه الاقتصاديّة أغلى من المتوسطة أو تقاربها (> ٨٥٪ منها)،
 * أو المتوسطة أغلى من العليا، ومدى كلّ مستوى. القاعدة تُقرأ مرّةً واحدة.
 *
 * ⚠️ يمرّر اليوم بمعامل tierBuilds(day)، ويثبّت Date أيضاً كي يصلح لنسخةٍ أقدم
 * من الدالّة لا تقبل المعامل (قياس قبل/بعد).
 */
import { prisma } from '../lib/prisma';
import { tierBuilds } from '../lib/auto-builds';

const days = Number(process.argv[2]) || 90;

async function main() {
  /* القاعدة مرّةً واحدة: تسعون استعلاماً كاملاً على قاعدة الإنتاج بلا داعٍ */
  const cat = prisma.category as any;
  const orig = cat.findMany.bind(cat);
  let cache: any = null;
  cat.findMany = async (args: any) => (cache ??= await orig(args));

  const RealDate = Date;
  const rows: { day: string; eco: number; mid: number; high: number }[] = [];
  for (let i = 0; i < days; i++) {
    const day = new RealDate(RealDate.UTC(2026, 9, 31) + i * 86_400_000).toISOString().slice(0, 10);
    (globalThis as any).Date = class extends RealDate {
      constructor(...a: any[]) { super(...((a.length ? a : [day + 'T12:00:00Z']) as [])); }
    };
    const t = await tierBuilds(day);
    (globalThis as any).Date = RealDate;
    const price = (id: string) => Number(t.find((x) => x.id === id)?.price) || 0;
    rows.push({ day, eco: price('economy'), mid: price('mid'), high: price('high') });
  }

  const bad1 = rows.filter((r) => r.eco >= r.mid);
  const close = rows.filter((r) => r.eco < r.mid && r.eco > 0.85 * r.mid);
  const bad2 = rows.filter((r) => r.mid >= r.high);
  const range = (k: 'eco' | 'mid' | 'high') => {
    const v = rows.map((r) => r[k]).sort((a, b) => a - b);
    return `${Math.round(v[0])}–${Math.round(v[v.length - 1])} (وسيط ${Math.round(v[Math.floor(v.length / 2)])})`;
  };
  console.log(`أيّام: ${rows.length}`);
  console.log(`الاقتصاديّة ${range('eco')}`);
  console.log(`المتوسطة   ${range('mid')}`);
  console.log(`العليا     ${range('high')}`);
  console.log(`الاقتصاديّة ≥ المتوسطة: ${bad1.length} يوم${bad1.length ? '  ' + bad1.slice(0, 5).map((r) => `${r.day} ${Math.round(r.eco)}/${Math.round(r.mid)}`).join(' · ') : ''}`);
  console.log(`الاقتصاديّة > ٨٥٪ من المتوسطة: ${close.length} يوم${close.length ? '  ' + close.slice(0, 5).map((r) => `${r.day} ${Math.round(r.eco)}/${Math.round(r.mid)}`).join(' · ') : ''}`);
  console.log(`المتوسطة ≥ العليا: ${bad2.length} يوم`);
  console.log(`اليوم ${rows[0].day}: ${Math.round(rows[0].eco)} / ${Math.round(rows[0].mid)} / ${Math.round(rows[0].high)}`);
  await prisma.$disconnect();
}
main();
