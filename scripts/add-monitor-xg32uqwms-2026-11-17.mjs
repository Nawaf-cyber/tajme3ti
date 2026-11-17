/**
 * 2026-11-17 — ASUS ROG Strix OLED XG32UQWMS (نوّاف: «ضيف ذي الشاشة وجيب المتاجر الي متوفرة فيها»).
 *
 * المتاجر (بُحث في الكلّ): مايكرولس 4,086.66 متوفّر · أمازون B09BNTQY84 4,515 متوفّر —
 * كلاهما بالقطعة 90LM0DT0-B01371. كازاسوق ونون يبيعان XG32UQ**D**MS (QD-OLED، طرازٌ آخر)،
 * وإنفيني آرك وريد زون وجرير لا يبيعانها.
 * المواصفات من صفحة ASUS الرسميّة rog.asus.com/…/rog-strix-oled-xg32uqwms/spec/:
 * 31.5" WOLED (Tandem، TrueBlack Glossy) · 3840x2160 240Hz وDual Mode FHD 480Hz · 0.03ms ·
 * 330 نِت (HDR ذروة 1500) · DisplayHDR 500 True Black · FreeSync Premium Pro + G-Sync Compatible ·
 * DP 1.4 DSC ×1 · HDMI 2.1 ×2 (FRL 48Gbps) · بلا USB-C وبلا سمّاعات · حامل رفع 110مم وميل ودوران ·
 * ضمان 3 سنوات يشمل احتراق اللوحة.
 *
 *   node scripts/add-monitor-xg32uqwms-2026-11-17.mjs           # عرض
 *   node scripts/add-monitor-xg32uqwms-2026-11-17.mjs --apply   # تنفيذ ثمّ scrape-one
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const M = {
  brand: 'ASUS',
  name: 'ROG Strix OLED XG32UQWMS',
  specs: {
    sizeInch: '32', resolution: '3840x2160', refreshHz: '240', panel: 'OLED', responseMs: '0.03',
    hdr: 'DisplayHDR True Black 500', vrr: 'FreeSync Premium Pro · G-Sync Compatible',
    dpVersion: '1.4', hdmiVersion: '2.1', curvature: 'Flat', brightnessNits: '330',
    speakers: 'No', usbC: 'No', dsc: 'Yes',
  },
  imageUrl: 'https://m.media-amazon.com/images/I/91RxUtm400L._AC_SL1500_.jpg',
  offers: [
    { store: 'microless', url: 'https://saudi.microless.com/product/asus-rog-strix-oled-xg32uqwms-gaming-monitor-32-woled-display-4k-uhd-resolution-240hz-refresh-rate-0-03ms-gtg-response-time-freesync-premium-pro-g-sync-compatible-black-90lm0dt0-b01371/' },
    { store: 'amazon', url: 'https://www.amazon.sa/dp/B09BNTQY84' },
  ],
  alt: ['Gigabyte MO32U2', 'لوحة QD-OLED بالدقّة والتردّد نفسيهما وبسعرٍ أقلّ، لمن لا يحتاج وضع 480 هرتز ولا سطوع Tandem الأعلى.'],
  description: `### ASUS ROG Strix OLED XG32UQWMS

شاشة ألعاب 32 بوصة (31.5 فعلياً) بدقّة 4K ولوحة WOLED من نوع Tandem بتردّد 240 هرتز، مع وضعٍ مزدوج ينقلها إلى 1080p بـ480 هرتز. مكانها مع كرتٍ من الفئة العليا (RTX 5080 أو 4090 وما فوقها) يعطي إطاراتٍ عالية في 4K، لمن يبي صورة OLED على مقاسٍ كبير ويلعب ألعاب المنافسة أيضاً.

**التقنيات الأساسية المدعومة:**

[green]Tandem WOLED بسطوعٍ أعلى:[/green] لوحة OLED بطبقتين مضيئتين، سطوعها المعتاد 330 نِت ويصل في HDR إلى 1500 نِت ذروة، مع تباين 1,500,000:1 وسوادٍ حقيقيّ.

[green]وضع مزدوج: 4K بـ240 أو 1080p بـ480:[/green] تختار الحدّة في ألعاب القصّة والعالم المفتوح، أو السرعة القصوى في ألعاب التصويب التنافسية، من الشاشة نفسها.

[green]DisplayHDR 500 True Black:[/green] شهادة VESA رسمية لشاشات OLED، مع 99.5% من DCI-P3 و10-bit (1.07 مليار لون).

[green]HDMI 2.1 بسرعة 48Gbps ومنفذ DisplayPort 1.4 مع DSC:[/green] منفذا HDMI 2.1 (FRL) يناسبان الكمبيوتر وPS5 وXbox Series X بـ4K و120 هرتز، والضغط (DSC) يمرّر 4K بـ240 هرتز عبر DisplayPort 1.4.

[green]FreeSync Premium Pro وG-Sync Compatible:[/green] مزامنة إطارات مع كروت AMD وNVIDIA تمنع تمزّق الصورة حين تنزل الإطارات.

[green]ضمان 3 سنوات يشمل احتراق اللوحة:[/green] ASUS تنصّ على أنّ الضمان يغطّي Burn-in، مع حاملٍ يرتفع 110 مم ويميل ويدور يميناً ويساراً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **4K بـ240 هرتز يحتاج كرتاً قوياً جداً:** في الألعاب الثقيلة على 4K تعطي أغلب الكروت أقلّ من ذلك بكثير، فالـ240 تُستغلّ كاملةً في الألعاب الخفيفة أو بتقنيات الرفع مثل DLSS وFSR.
* سطحٌ لامع (TrueBlack Glossy): ألوانٌ وسوادٌ أعمق، لكنّه يعكس الضوء في غرفةٍ مضيئة أكثر من الأسطح المطفأة.
* منفذ DisplayPort بنسخة 1.4 لا 2.1: يكفي بالضغط (DSC)، لكنّ الكرت يجب أن يدعم DSC ليبلغ 240 هرتز عبره.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا USB-C لنقل الصورة ولا سمّاعات مدمجة: الصوت عبر منفذ سمّاعة الرأس.
* لا دوران عمودي (Pivot) في مواصفات ASUS.

https://rog.asus.com/monitors/27-to-31-5-inches/rog-strix-oled-xg32uqwms/spec/`,
};

const stores = Object.fromEntries((await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]));
const cat = await prisma.category.findUnique({ where: { name: 'Monitor' }, select: { id: true } });
const dup = await prisma.component.findFirst({ where: { brand: M.brand, name: M.name }, select: { id: true } });
const alt = await prisma.component.findFirst({ where: { brand: 'Gigabyte', name: 'MO32U2' }, select: { id: true } });
const used = [];
for (const o of M.offers) {
  const k = (o.url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1] || '90lm0dt0-b01371';
  const t = await prisma.componentOffer.findFirst({ where: { url: { contains: k, mode: 'insensitive' } }, select: { id: true } });
  if (t) used.push(o.store);
}
if (!cat || dup || !alt || used.length) {
  console.log('⛔', { cat: !!cat, dup: dup?.id, alt: !!alt, used });
  await prisma.$disconnect(); process.exit(1);
}
console.log(`＋ ${M.brand} ${M.name} — ${M.offers.map((o) => o.store).join(' · ')} · بديل MO32U2 (${M.description.length} حرفاً)`);
if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

writeFileSync(`backups/monitor-xg32uqwms-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`, JSON.stringify(M, null, 1));
const lines = M.description.trimEnd().split('\n');
const url = lines.pop();
const description = `${lines.join('\n').trimEnd()}\n\n---\nبإمكانك التوجه إلى [${M.alt[0]}](/components/${alt.id}) إذا كان توجهك يتركز على الآتي:\n* ${M.alt[1]}\n${url}`;
const c = await prisma.component.create({ data: {
  brand: M.brand, name: M.name, categoryId: cat.id, price: 0, tdpWattage: 0, performanceTier: null,
  specs: M.specs, imageUrl: M.imageUrl, description,
} });
for (const o of M.offers) await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
console.log(`✔ ${c.id}\nالتالي: npx tsx scripts/scrape-one.ts ${c.id}`);
await prisma.$disconnect();
