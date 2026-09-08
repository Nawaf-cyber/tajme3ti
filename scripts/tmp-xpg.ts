import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { fingerprint, pick, matches } from '../lib/source-match';
import { searchStore } from '../lib/store-search';

(async () => {
  const tok = process.env.SCRAPER_API_KEY || '';
  const c = await prisma.component.findFirst({
    where: { name: { contains: 'ARMAX' } },
    select: { id: true, brand: true, name: true, price: true, specs: true },
  });
  const fp = fingerprint(c!.brand, c!.name, c!.specs as any);
  console.log(`قطعتنا: ${c!.brand} ${c!.name} · بصمة: سرعة ${fp.speedMts} · سعة ${fp.capacityGb}GB · إضاءة ${fp.rgb}\n`);

  for (const [store, q] of [['amazon', 'XPG ARMAX DDR5'], ['amazon', 'ARMAX 6000'], ['cazasouq', 'XPG ARMAX'], ['cazasouq', 'ARMAX RGB DDR5']] as const) {
    const rows = await searchStore(store, q, tok).catch(() => []);
    console.log(`«${q}» في ${store}: ${rows.length} نتيجة`);
    for (const r of rows.slice(0, 6)) {
      const v = matches(fp, r.title);
      console.log(`   ${v.ok ? '✓' : '✗'} ${r.title.slice(0, 74)}${v.ok ? '' : '  — ' + v.why}`);
      if (v.ok) console.log(`        ${r.url}`);
    }
  }
  await prisma.$disconnect();
})();
