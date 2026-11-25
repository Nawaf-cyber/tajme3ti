/**
 * 2026-11-25 — جرير متجراً ثانياً لأربع شاشات. نوّاف: «ابدأ» (بند «جرير للشاشات» من خطّة الشاشات).
 *
 * الروابط من بحث جرير في لوحة المتصفّح (المتصفّح الحقيقيّ يعدّي Cloudflare بلا Scrape.do)، وكلّ
 * واحدٍ رُوجع بحقل mpn في مسارهم /api/catalogv2 مقابل رمز الطراز في رابط مايكرولس عندنا:
 *   G50F        LS27FG502EMXU(E)  ← 678061   (جرير 819، متوفّر)
 *   G60F        LS27FG600EMXU(E)  ← 678069   (1199)
 *   OLED G50SF  LS27FG502SMXU(E)  ← 678062   (1799)
 *   EX271QMZ    EX271QMZ          ← 685080   (1799)
 * ⚠️ لا تُخلط: 678074 هو G60SF (500Hz، فضّي) لا G60F؛ و681280 هو EX271QZ (500Hz) لا EX271QMZ.
 *
 * السعر من الساحب نفسه (scrapeJarir — طلبٌ واحد بالوسيط العاديّ لكلّ عرض) لا من الكاتب، ولا يُعاد
 * سحب أمازون ومايكرولس معها (scrape-one يسحب كلّ متاجر القطعة: ~١٢ وحدة للقطعة بدل ١).
 *
 *   npx tsx --env-file=.env scripts/add-jarir-monitors-2026-11-25.ts           # عرض
 *   npx tsx --env-file=.env scripts/add-jarir-monitors-2026-11-25.ts --apply   # تنفيذ (بعد نسخةٍ احتياطيّة)
 */
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { scrapeJarir, recordPriceHistory, setScrapeDeadline } from '../lib/scrape-prices';
import { recalcComponentPrice } from '../lib/price-review';

const ROWS: [string, string, string][] = [
  ['cmwgr5b4b000w3oym8wj4oesg', 'https://www.jarir.com/sa-en/samsung-ls27fg502emxue-lcd-monitors-678061.html', 'LS27FG502EMXU'],
  ['cmwgr5bdh000z3oymps637e21', 'https://www.jarir.com/sa-en/samsung-ls27fg600emxue-lcd-monitors-678069.html', 'LS27FG600EMXU'],
  ['cmwgr5di7001n3oymsuj5m8ej', 'https://www.jarir.com/sa-en/samsung-ls27fg502smxue-lcd-monitors-678062.html', 'LS27FG502SMXU'],
  ['cmwkd9kyc0010t0ymrohig6cf', 'https://www.jarir.com/sa-en/benq-ex271qmz-lcd-monitors-685080.html', 'EX271QMZ'],
];

async function main() {
  const apply = process.argv.includes('--apply');
  const jarir = await prisma.store.findUniqueOrThrow({ where: { slug: 'jarir' }, select: { id: true, active: true } });
  if (!jarir.active) throw new Error('جرير غير مفعّل');

  const plan: { id: string; name: string; url: string }[] = [];
  for (const [id, url, mpn] of ROWS) {
    const c = await prisma.component.findUniqueOrThrow({
      where: { id },
      select: { brand: true, name: true, offers: { select: { url: true, store: { select: { slug: true } } } } },
    });
    if (c.offers.some((o) => o.store.slug === 'jarir')) throw new Error(`${c.name} عندها جرير أصلاً`);
    const micro = c.offers.find((o) => o.store.slug === 'microless')?.url?.toLowerCase() ?? '';
    if (!micro.includes(mpn.toLowerCase())) throw new Error(`${c.name}: رمز ${mpn} لا يطابق رابط مايكرولس`);
    const taken = await prisma.componentOffer.findFirst({ where: { url }, select: { component: { select: { name: true } } } });
    if (taken) throw new Error(`${url} مستعمل لـ«${taken.component.name}»`);
    plan.push({ id, name: `${c.brand} ${c.name}`, url });
    console.log(`جرير ← ${c.brand} ${c.name}  (${mpn})`);
  }
  if (!apply) { console.log('\n(عرض فقط — أضف --apply)'); return; }

  const token = process.env.SCRAPER_API_KEY?.trim();
  if (!token) throw new Error('SCRAPER_API_KEY غير مضبوط');
  setScrapeDeadline(52000);

  const file = `backups/jarir-monitors-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  writeFileSync(file, JSON.stringify(await prisma.component.findMany({ where: { id: { in: plan.map((p) => p.id) } }, include: { offers: true } }), null, 1));
  console.log('\nنسخة احتياطيّة:', file);

  for (const p of plan) {
    const offer = await prisma.componentOffer.create({ data: { componentId: p.id, storeId: jarir.id, url: p.url, inStock: true } });
    const out = await scrapeJarir({ name: p.name, url: p.url, price: null, inStock: true }, token);
    if (out.price == null) {
      await prisma.componentOffer.update({ where: { id: offer.id }, data: { lastCheckedAt: new Date(), lastError: out.errors.join(' · ') || 'لم يُقرأ' } });
      console.log(`✖ ${p.name}: ${out.errors.join(' · ')}`);
      continue;
    }
    const now = new Date();
    await prisma.componentOffer.update({
      where: { id: offer.id },
      data: { price: out.price, listPrice: out.listPrice ?? null, inStock: out.inStock, lastCheckedAt: now, lastReadAt: now, lastError: null },
    });
    if (out.inStock) await recordPriceHistory(prisma, p.id, [{ store: 'jarir' as any, price: out.price }]);
    const low = await recalcComponentPrice(prisma as any, p.id);
    const comp = await prisma.component.findUniqueOrThrow({ where: { id: p.id }, select: { price: true } });
    if (low != null && low !== comp.price) await prisma.component.update({ where: { id: p.id }, data: { price: low } });
    console.log(`✔ ${p.name}: جرير ${out.price}${out.listPrice ? ` (قبل ${out.listPrice})` : ''} ${out.inStock ? 'متوفّر' : 'نافد'} · سعر القطعة ${comp.price}${low != null && low !== comp.price ? ` ← ${low}` : ''}`);
  }
}

main().then(() => process.exit(0), (e) => { console.error('⛔', e.message); process.exit(1); });
