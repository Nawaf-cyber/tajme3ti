/**
 * 2026-10-10 — نوّاف أرسل لقطة خمس قطع «غير متوفّر — لا سعر مسجّل» وسأل: هل لها روابط؟
 * بُحث عن كلّ واحدة برمز طرازها في أمازون (بالمتصفّح) ومايكرولس وجرير وإنفيني آرك:
 *   - Seagate BarraCuda 1TB HDD (ST1000DM010): أمازون B01LY65EVG — العنوان يحمل ST1000DM010 و3.5 إنش و7200 دورة، زرّ الشراء موجود (548.16).
 *     ⇒ يُضاف. (عرض مايكرولس القائم صحيح الطراز لكنّه «Currently Unavailable».)
 *   - الباقي بلا رابطٍ مطابق — لا يُضاف شيء:
 *     Silicon Power Zenith DDR5 32GB 6000 (بلا RGB): أمازون فيه Zenith RGB الأسود وZenith الأبيض فقط.
 *     Crucial Pro DDR5 32GB 5600 CL46 (CP2K16G56C46U5): المتاجر تبيع خلَفه 6000 CL36.
 *     Corsair Dominator Titanium 48GB 7200 White: صفحة مايكرولس متناقضة (العنوان 48GB والرابط «64gb-2x32 cl30») ونافدة.
 *     Corsair Vengeance DDR5 32GB 6000 CL36 (CMK32GX5M2D6000Z36): أمازون فيه المراجعتان E وF بالمواصفة نفسها برمزٍ مختلف.
 *
 *   node scripts/fix-unpriced-links-2026-10-10.mjs           # عرض
 *   node scripts/fix-unpriced-links-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const ADD = [
  { id: 'cmr3fmuep000604lhx259y0dx', name: 'BarraCuda 1TB HDD', store: 'amazon', url: 'https://www.amazon.sa/dp/B01LY65EVG' },
];

const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
let blocked = false;
for (const a of ADD) {
  const c = await prisma.component.findUnique({ where: { id: a.id }, select: { name: true, offers: { select: { url: true } } } });
  if (!c || c.name !== a.name) { console.log(`⛔ ${a.id} ليست «${a.name}»`); blocked = true; continue; }
  const asin = a.url.match(/\/dp\/([A-Z0-9]{10})/)[1];
  const taken = await prisma.componentOffer.findFirst({ where: { url: { contains: `/dp/${asin}` } }, select: { component: { select: { name: true } } } });
  if (taken) { console.log(`⛔ ${asin} مستعمل في ${taken.component.name}`); blocked = true; continue; }
  console.log(`✔ سيُضاف ${a.store} إلى «${c.name}» (عروضه الآن: ${c.offers.map((o) => o.url).join(' , ') || '—'})`);
}
if (blocked || !apply) { console.log(blocked ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(blocked ? 1 : 0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-unpriced-links-${stamp}.json`, JSON.stringify({ ADD }, null, 2));
for (const a of ADD) {
  await prisma.componentOffer.create({ data: { componentId: a.id, storeId: stores[a.store], url: a.url, inStock: true } });
  console.log(`➕ ${a.name} ← ${a.store}`);
}
await prisma.$disconnect();
