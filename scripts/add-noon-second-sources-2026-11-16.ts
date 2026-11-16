/**
 * ============ مصدرٌ ثانٍ من نون للقطع ذات المصدر الواحد — 2026-11-16 ============
 *
 * تكملة scripts/add-second-sources-2026-11-15.mjs: المتاجر الأربعة المجانية وأمازون
 * استُنفدت، فبقيت ٧٦ قطعةً بمصدرٍ حيٍّ واحد (عدا الثلاث التي مصدرها نون نفسه).
 * بُحث عنها كلّها في نون من لوحة المتصفّح (fetch لصفحة البحث من داخل نون —
 * صفحة البحث تحمل الأسماء والأسعار، أمّا صفحة المنتج فلا JSON-LD فيها إلّا بفتحها).
 * ⚠️ نون حجب البحث (403 Access Denied) بعد ٣٦ استعلاماً متتالياً بفاصل ١٫٢ث؛
 * فالباقي بُحث بعد رفع الحجب، بفاصلٍ أطول.
 *
 * ونون `scrapeMode: 'off'` — سعره يُقرأ بفتح كلّ صفحةٍ في المتصفّح (JSON-LD)،
 * ثمّ تحدّثه المهمّة المجدولة على جهاز نوّاف (scripts/noon-auto-refresh.ts، ٩ص و٩م)
 * — وهي تقرأ كلّ عروض نون، فالجديد يدخلها تلقائياً.
 *
 * ============ ومعه تصحيح ============
 * «Gigabyte Z890 AORUS Elite WiFi7» (…0eke3e) كان رابطُ أمازونه وصورتُه لنسخة
 * **ICE** البيضاء (B0DK7LZB1Q = Z890 A ELITE WF7 ICE) — وللـICE قطعةٌ مستقلّة عندنا
 * (…ss00t). فصار رابطه B0DJP95MGB (Z890 AORUS ELITE WIFI7، 1,444) وصورته صورتها.
 *
 * ============ مرفوض (لا تُعِد فحصه بلا سبب جديد) ============
 * نسخةٌ أخرى:  Meshify 2 (نون: Compact فقط) · Ryzen 9 7900 (7900X فقط) · i5-14600K (KF فقط)
 *   · RTX 3080 Ti (قطعتنا Gigabyte Vision OC، ونون Founders) · TH360-S V3 (نون: V2 Ultra)
 *   · Sky One Lite (قطعتنا سوداء ونون بيضاء) · X870-P (نون: ASUS لا MSI)
 *   · B550-Plus (مجدَّد Renewed) · PRO B760M-P DDR4 (نون: DDR5) · Straight Power 12 (1500W فقط)
 *   · Focus GX-850 (نون: Vertex) · T-Create 64GB (نون: 6400 وقطعتنا 6000)
 *   · Fury Beast 32GB (نون: RGB، وقطعتنا KF560C36BBE2K2 العاديّة) · Vulcan (قطعتنا Alpha)
 * Tray لا علبة:  Ryzen 5 5600 («No Fan») · i7-12700K (قطعتنا BX8071512700K)
 * بائعٌ مُغالٍ:  Z890 AORUS Elite WiFi7 بـ2,474 (أمازون 1,444) · Delta RGB 6000 White CL30
 *   بـ4,929–6,181 (أمازون 2,971) · Elite Plus 2x8 4800 (TPBD516G4800HC40DC01) بـ1,752 (أمازون 1,143)
 *   — الرقم مطابق لكنّه ليس سعر سوق
 * لا يُباع في نون بالسعة/النسخة نفسها: Flare X5 16GB (1x16 فقط) · Fury Beast DDR4 16GB (RGB فقط)
 *   · Rocket 4 Plus (4TB فقط) · T705 (1TB فقط) · SN8100 2TB (بائعٌ مجهول بلا سعةٍ مذكورة)
 *
 *   npx tsx scripts/add-noon-second-sources-2026-11-16.ts           # عرض
 *   npx tsx scripts/add-noon-second-sources-2026-11-16.ts --apply   # نسخة احتياطيّة ثمّ تنفيذ
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { cheapestOffer } from '../lib/stores';
import { recordPriceHistory, round2 } from '../lib/scrape-prices';

const apply = process.argv.includes('--apply');
const N = (path: string) => `https://www.noon.com${path}`;

/** [لاحقة معرّف القطعة، مسار صفحة نون، السعر المقروء أو null إن نفد، ملاحظة] */
const NOON: [string, string, number | null, string][] = [
  ['bhtatr', '/saudi-en/x/Z4BDE1907FF259AAA51A6Z/p/', 2252, 'Sparkle Arc B570 Guardian OC SB570G-10GOC — البائع rayihni'],
  ['06dugx', '/saudi-en/x/N70030962V/p/', 1061, 'Odyssey G5 G55C 32 = LS32CG552E — BUY4LESS KSA'],
  ['58uc88', '/saudi-en/x/N70164741V/p/', 519, 'Ryzen 5 5500 علبة 100-100000457BOX — eKart'],
  ['n6yd0u', '/saudi-en/x/Z823D2B4EC7C77ED06F14Z/p/', 239, 'Frozen Notte 240 White ARGB V2 — SMARTRON'],
  ['x8hykr', '/saudi-en/x/ZB6A6F25425B22DAF7868Z/p/', 133, 'AG400 G2 WH = R-AG400-WHAMMG2-F — ADARC COMPUTER'],
  ['3m5p59', '/saudi-en/x/Z02144C5766C2981ED20AZ/p/', 375.99, 'Galaxy أسود — متجر الشركة Majesty Technology-SA (بائعون آخرون بـ677)'],
  ['6wfxgw', '/saudi-en/x/N70017238V/p/', 934.95, 'ASUS Prime Z790-P WiFi — eKart'],
  ['nwylx6', '/saudi-en/x/N70075673V/p/', 1005, 'MSI B650 Gaming Plus WiFi — Unwired Tech'],
  ['j7bko3', '/saudi-en/x/N70064703V/p/', 759, 'MSI PRO B760M-A WiFi **DDR5** (قطعتنا B760MAWIFI DDR5؛ نسخة DDR4 مستقلّة في نون) — ADARC'],
  ['y12o3j', '/saudi-en/x/N70134040V/p/', 349, 'Gigabyte H610M H **V3** DDR4 — كرابط أمازون — eKart'],
  ['n66hwj', '/saudi-en/x/ZD7180C22D288ABCC38F5Z/p/', 636, 'PQ1200G أسود R-PQC00G-FD1B (الأبيض FD1W صفحةٌ أخرى) — ADARC'],
  ['ylqjby', '/saudi-en/x/Z09BC3D9EFE4BFFB448ACZ/p/', 2100, 'Delta RGB 6400 CL40 أسود FF3D532G6400HC40BDC01 — DARAT'],
  ['3mt6pp', '/saudi-en/x/ZED6185B6E0A036D10244Z/p/', 3166, 'Flare X5 CL36 F5-6000J3636F16GX2-FX5 — CLIQNSHOP (أغلى من أمازون ١٨٪)'],
];

const Z890 = { id: 'cmr2k5vs40005jgymmq0eke3e', fromAsin: 'B0DK7LZB1Q', toAsin: 'B0DJP95MGB',
  image: 'https://m.media-amazon.com/images/I/71-Z4zqjwwL._AC_SL1500_.jpg' };

(async () => {
  const noon = await prisma.store.findFirst({ where: { slug: 'noon' }, select: { id: true } });
  const amazon = await prisma.store.findFirst({ where: { slug: 'amazon' }, select: { id: true } });
  if (!noon || !amazon) throw new Error('لا متجر');

  const rows: { comp: { id: string; name: string }; code: string; price: number | null; note: string }[] = [];
  for (const [suffix, code, price, note] of NOON) {
    const found = await prisma.component.findMany({ where: { id: { endsWith: suffix } }, select: { id: true, name: true } });
    if (found.length !== 1) throw new Error(`«${suffix}» يطابق ${found.length} قطعة`);
    const has = await prisma.componentOffer.findFirst({ where: { componentId: found[0].id, storeId: noon.id } });
    if (has) { console.log(`· لها عرض نون: ${found[0].name}`); continue; }
    const dup = await prisma.componentOffer.findFirst({ where: { url: { contains: code } } });
    if (dup) throw new Error(`الرابط ${code} مستعمل لقطعةٍ أخرى`);
    rows.push({ comp: found[0], code, price, note });
    console.log(`＋ ${found[0].name} ← نون ${price ?? 'نافد'}  (${note})`);
  }

  const zOffer = await prisma.componentOffer.findFirst({ where: { componentId: Z890.id, storeId: amazon.id } });
  const zTodo = !!zOffer && (zOffer.url ?? '').includes(Z890.fromAsin);
  console.log(zTodo ? `\n＋ Z890 AORUS Elite WiFi7: أمازون ${Z890.fromAsin} (ICE) → ${Z890.toAsin}` : `\n· Z890: صُحّح سابقاً`);

  if (!apply) { console.log(`\n${rows.length} عرضاً (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); return; }

  const touched = [...rows.map(r => r.comp.id), Z890.id];
  const backup = {
    at: new Date().toISOString(),
    components: await prisma.component.findMany({ where: { id: { in: touched } }, include: { offers: true } }),
  };
  const file = `backups/noon-second-sources-${backup.at.slice(0, 19).replace(/:/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`\nنسخة: ${file}`);

  for (const r of rows) {
    await prisma.componentOffer.create({ data: {
      componentId: r.comp.id, storeId: noon.id, url: N(r.code),
      price: r.price, inStock: r.price != null, lastCheckedAt: new Date(),
    } });
    if (r.price != null) await recordPriceHistory(prisma, r.comp.id, [{ store: 'noon', price: r.price }]);
  }

  if (zTodo && zOffer) {
    await prisma.componentOffer.update({ where: { id: zOffer.id }, data: {
      url: `https://www.amazon.sa/dp/${Z890.toAsin}`, lastCheckedAt: null, lastError: null,
    } });
    await prisma.component.update({ where: { id: Z890.id }, data: { imageUrl: Z890.image } });
  }

  for (const id of touched) {
    const c = await prisma.component.findUnique({ where: { id }, include: { offers: { include: { store: true } } } });
    if (!c) continue;
    const best = cheapestOffer(c.offers as any);
    const next = best ? round2(best.price!) : c.price;
    if (next !== c.price) {
      await prisma.component.update({ where: { id }, data: { price: next } });
      console.log(`  ↳ ${c.name}: ${c.price} → ${next} (${best?.store.slug ?? '—'})`);
    }
  }
  console.log(`\nأُضيف ${rows.length} عرضاً.`);
  await prisma.$disconnect();
})();
