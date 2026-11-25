/**
 * 2026-11-25 (الدفعة الثانية) — جرير لباقي الشاشات. نوّاف: «يب دوّر على الباقي».
 *
 * حُصرت شاشات جرير كلّها (بحث «gaming monitor» = ١١٨ نتيجة، ١١٥ شاشة، مع «تحميل المزيد» حتى النهاية،
 * وبحوثٌ بالعلامة للتأكّد: gigabyte/msi/asus rog/asus tuf/lg ultragear وLS32CG552)، وجُلب mpn كلٍّ منها
 * من /api/catalogv2 ثمّ طوبق برمز الطراز في رابط مايكرولس عندنا. المطابق أربع:
 *   G81SF 32"   LS32FG810SMXU  ← 661458  (4849، متوفّر)
 *   G81SF 27"   LS27FG810SMXU  ← 661457  (3499، نافد — يُتابَع)
 *   27GS60QC-B  27GS60QC       ← 642836  (799، متوفّر — ومايكرولس نافد، فصار متجراً ثانياً فعليّاً)
 *   G Pro 27i   P27QBARGPGL    ← 650033  (1699، نافد — يُتابَع)
 * ⚠️ ليست هي: XG27AQDMES≠XG27AQDMGR، XG27WCMS≠XG27WCS، 27GX790B≠27GX790A، VG27AQL5A≠VG27AQ5A،
 *    VG279Q5A≠VG279QM5A، MSI 9S63CE41H055 (MAG 274F) ≠ MAG 274QF X24 (…H061). ولا Dell/Gigabyte/MSI/KOORUI/
 *    Z-Edge/ViewSonic من شاشاتنا في جرير، ولا G55C 32.
 *
 *   npx tsx --env-file=.env scripts/add-jarir-monitors-2026-11-25b.ts           # عرض
 *   npx tsx --env-file=.env scripts/add-jarir-monitors-2026-11-25b.ts --apply   # تنفيذ (بعد نسخةٍ احتياطيّة)
 */
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { scrapeJarir, recordPriceHistory, setScrapeDeadline } from '../lib/scrape-prices';
import { recalcComponentPrice } from '../lib/price-review';

const ROWS: [string, string, string][] = [
  ['cmwgr5g1p002f3oym8sbc6ot7', 'https://www.jarir.com/sa-en/samsung-ls32fg810smxu-lcd-monitors-661458.html', 'ls32fg810smxue'], // Samsung Odyssey OLED G8 G81SF
  ['cmwkd9n0l001mt0ymbl125bew', 'https://www.jarir.com/sa-en/samsung-ls27fg810smxu-lcd-monitors-661457.html', 'ls27fg810smxue'], // Samsung Odyssey OLED G8 G81SF 27
  ['cmwgr5d9b001k3oymto4zod3t', 'https://www.jarir.com/sa-en/lg-27gs60qc-lcd-monitors-642836.html', '27gs60qc-b'], // LG UltraGear 27GS60QC-B
  ['cmwkd9jkp000mt0ymas5m6g6m', 'https://www.jarir.com/sa-en/xiaomi-g-pro-27i-lcd-monitors-650033.html', 'p27qba-rgpgl'], // Xiaomi G Pro 27i
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
    if (!micro.includes(mpn.toLowerCase())) throw new Error(`${c.name}: ${mpn} ليس في رابط مايكرولس`);
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
