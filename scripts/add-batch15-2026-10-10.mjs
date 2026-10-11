/**
 * ============ الدفعة الخامسة عشرة — ثلاث قطع بثلاثة متاجر — 2026-10-10 ============
 *
 * طلب نوّاف: «جمع 3 قطع بثلاث متاجر فقط». كلّ قطعةٍ هنا متوفّرة اليوم في ثلاثة متاجر يُسحب سعرها آلياً:
 *   - Gigabyte B860 EAGLE WIFI6E: أمازون (B0DQLJRY8C، «In Stock») + مايكرولس (InStock، mpn B860 Eagle WIFI6E) + إنفيني آرك (Add to Cart)
 *   - Corsair 6500D AIRFLOW الأسود CC-9011259-WW: أمازون (B0CQ5DQ25W، Black) + مايكرولس (…-black-cc-9011259-ww) + إنفيني آرك (cc-9011259-ww)
 *   - PNY CS900 1TB SSD7CS900-1TB-RB: أمازون (B07Y5VDNT9) + مايكرولس (InStock) + جرير (649830، المخزون 8 من getavailability)
 *
 * لماذا ليس كازاسوق: مسحُ أقسامه كلّها (118 منتجاً) وجد المتوفّر فعلاً أربعة فقط (ثلاثة معالجات عندنا، وXPG MARS 980 Storm غير موجود في أمازون).
 * استُبعد: WD SN850P 2TB (أمازون بلا زرّ شراء)، PNY CS900 2TB (مايكرولس «Currently Unavailable»)، Galahad II LCD في جرير
 * (لا يذكر المقاس 240/360)، O11 Vision في جرير (العنوان «Black» والوصف «CHROME» — لونٌ غير مؤكّد).
 *
 * المصادر: صفحة مواصفات Gigabyte (بالمتصفّح؛ الخادم يُردّ)، صفحة Corsair (WebFetch)، نشرة PNY الرسميّة PDF.
 *   - Gigabyte: المنفذ PCIEX16 «لا يقبل إلا كرت شاشة أو قرص NVMe»، والمنفذان الآخران x1؛ واي‑فاي AX211 (rev 1.0) أو RTL8852CE (rev 1.1).
 *   - Corsair: الأبعاد 496×481×328، كرت 400 مم، مبرّد 190 مم، مزوّد 225 مم، مشعّات 360 أعلى/جانب/أسفل/أمام، 13 مروحة 120، بلا مراوح، ضمان سنتان.
 *     (الوزن 16 كغ في الصفحة الرسميّة وفي مايكرولس 16.9 — لم يُذكر لأنّه يبدو خطأً في البيانات.)
 *   - PNY: قراءة 535 وكتابة 515 للـ1TB، 3D NAND TLC (نشرة 2019)، MTBF مليونا ساعة، ضمان 3 سنوات؛ لا تذكر النشرة TBW فلم يُسجَّل.
 *
 *   node scripts/add-batch15-2026-10-10.mjs           # عرض
 *   node scripts/add-batch15-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const MB = 'cmpfziqe70001x4ym928tt3o2';
const STO = 'cmpfziqr70005x4ym3k7uh079';
const CASE = 'cmpfziquj0006x4ym53f0ehcw';

const A = (asin) => ({ store: 'amazon', url: `https://www.amazon.sa/dp/${asin}` });
const M = (slug) => ({ store: 'microless', url: `https://saudi.microless.com/product/${slug}/` });
const I = (path) => ({ store: 'infiniarc', url: `https://www.infiniarc.com/shop/${path}` });
const J = (slug) => ({ store: 'jarir', url: `https://www.jarir.com/sa-en/${slug}.html` });

const ALT = {
  B860P: ['MSI PRO B860-P WiFi', 'cmr2k5vx40006jgym04l2zz5r'],
  C5000D: ['Corsair 5000D Airflow', 'cmpiec081002h00ymnwss7xit'],
  EVO870: ['Samsung 870 EVO 1TB SATA', 'cmr2lb5is000qjgymrzv3tija'],
};
const alt = (k, ...why) => `---\nبإمكانك التوجه إلى [${ALT[k][0]}](/components/${ALT[k][1]}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const MOVE = [];
const EXTRA = [];

const PARTS = [
  /* ============================== لوحة أمّ ============================== */
  {
    categoryId: MB, brand: 'Gigabyte', name: 'B860 Eagle WiFi6E', tdpWattage: 10, performanceTier: 3,
    specs: { socket: 'LGA1851', chipset: 'B860', formFactor: 'ATX', ramType: 'DDR5', maxRam: '256GB', m2Slots: '3', wifi: 'Wi-Fi 6E', lan: '2.5GbE', pcieVersion: 'PCIe 5.0', memorySpeed: '9066 MT/s (OC)' },
    offers: [
      A('B0DQLJRY8C'),
      M('gigabyte-b860-eagle-lga-1851-atx-motherboard-intel-b860-chipset-4x-ddr5-dimm-slots-up-to-256gb-max-memory-1x-pcie-5-0-x16-3x-m-2-slots-wifi-bluetooth-connectivity-b860-eagle-wifi6e'),
      I('board/b860-eagle-wifi6e-1-0-gigabyte-b860-eagle-wifi6e-intel-ultra-lga1851-ddr5-black-motherboard-10259'),
    ],
    description: `### Gigabyte B860 EAGLE WIFI6E

لوحة ATX كاملة الحجم على شيبست B860 لمعالجات Intel Core Ultra (السلسلة 200)، بثلاثة منافذ M.2 أحدها من الجيل الخامس، وواي‑فاي 6E وشبكة 2.5 جيجابت. تناسب تجميعة ألعابٍ بمعالج Core Ultra 5 أو 7 لمن يريد لوحة كاملة المنافذ بسعرٍ متوسّط.

**التقنيات الأساسية المدعومة:**

[green]منفذ M.2 من الجيل الخامس متّصل بالمعالج:[/green] يركب عليه أسرع أقراص NVMe الحاليّة بسرعتها كاملة، ومعه منفذان من الجيل الرابع عبر الشيبست — ثلاثة أقراص بلا بطاقة توسعة.

[green]منفذ كرت شاشة PCIe 5.0 بعرض x16:[/green] متّصل بالمعالج مباشرة، فلا يُخنق أيّ كرت شاشة حاليّ ولا قادم.

[green]ذاكرة DDR5 حتى 256 جيجابايت وسرعة 9066 MT/s كسر سرعة:[/green] أربعة منافذ تقبل أطقم 64 جيجابايت للشريحة، مع دعم XMP لتفعيل سرعة الرام بنقرة.

[green]واي‑فاي 6E وبلوتوث 5.3 وشبكة Realtek 2.5 جيجابت:[/green] اتّصال لاسلكيّ على نطاق 6GHz الأقلّ ازدحاماً، وسلكيّ أسرع من الجيجابت المعتاد.

[green]منفذ USB-C خلفيّ بسرعة 20 جيجابت (Gen 2x2):[/green] لأقراص خارجيّة سريعة، ومعه ترويسة USB-C داخليّة لمنفذ الصندوق الأماميّ.

[green]مخرجا HDMI 2.1 وDisplayPort 2.1 وزرّ Q-Flash Plus:[/green] الشاشة تعمل من رسوميّات المعالج عند الحاجة، وتحديث BIOS ممكن حتى بلا معالج مركّب.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ المنفذ الرئيسيّ PCIEX16 يقبل **كرت شاشة أو قرص NVMe فقط** بحسب Gigabyte، والمنفذان الآخران بطول x16 لكنّهما يعملان بسرعة x1 — لا تناسب بطاقة توسعةٍ ثانية سريعة.
* شريحة الواي‑فاي تختلف بحسب نسخة اللوحة: Intel AX211 في النسخة 1.0 وRealtek RTL8852CE في النسخة 1.1، والأداء متقارب.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* شيبست B860 لا يدعم كسر سرعة المعالج؛ معالجات K تعمل بسرعتها الافتراضيّة (كسر سرعة الرام مدعوم).
* لا تقبل معالجات LGA1700 (الجيل 12 إلى 14).

${alt('B860P', 'لوحة ATX بالشيبست نفسه من MSI وبسعرٍ قريب، إن فضّلت برنامج MSI وقائمة BIOS الخاصّة بها.')}
https://www.gigabyte.com/Motherboard/B860-EAGLE-WIFI6E/sp`,
  },

  /* ============================== صندوق ============================== */
  {
    categoryId: CASE, brand: 'Corsair', name: '6500D Airflow Black', tdpWattage: 0, performanceTier: 4,
    specs: { color: 'Black', dualChamber: 'Yes', features: ['حجرتان: اللوحة والكرت في حجرة، والمزوّد والكابلات خلفها', 'يدعم لوحات Back-Connect', 'يقبل لوحات E-ATX'], formFactor: 'Mid Tower', includedFans: 'لا يوجد', maxGpuLength: '400', psuFormFactor: 'ATX', maxCoolerHeight: '190', radiatorSupport: '360mm' },
    offers: [
      A('B0CQ5DQ25W'),
      M('corsair-6500d-airflow-mid-tower-computer-case-up-to-360mm-radiator-13x-fan-support-tempered-glass-material-fully-mesh-sides-dual-chamber-design-modern-front-panel-i-o-black-cc-9011259-ww'),
      I('case/cc-9011259-ww-corsair-6500d-airflow-mid-tower-dual-chamber-black-pc-case-9403'),
    ],
    description: `### Corsair 6500D AIRFLOW (أسود)

صندوق Mid Tower بحجرتين من Corsair: اللوحة والكرت في الحجرة الأماميّة، والمزوّد والكابلات في حجرةٍ خلفيّة، مع واجهة وجانب أيمن شبكيّين لتدفّق هواءٍ عالٍ. يناسب تجميعة قويّة بمبرّد مائيّ 360 وكرت كبير، ومن يريد شكلاً نظيفاً بلا كابلات ظاهرة.

**التقنيات الأساسية المدعومة:**

[green]تصميم حجرتين بواجهة شبكيّة:[/green] المزوّد والكابلات خارج مسار الهواء، فيصل الهواء البارد إلى الكرت والمعالج مباشرة، وتبقى الواجهة الزجاجيّة نظيفة.

[green]مشعّ 360 مم في أربعة أماكن:[/green] أعلى، أو جانب، أو أسفل، أو أمام — حرّيّة كاملة في مكان المبرّد المائيّ، ومكان مشعّ 140 مم في الخلف.

[green]حتى 13 مروحة 120 مم:[/green] ثلاث أعلى، وثلاث أسفل، وثلاث على الجانب، وثلاث أمام، وواحدة خلف — لمن يبني جهازاً هادئاً بمراوح كثيرة بسرعة منخفضة.

[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 190 مم:[/green] مساحة تكفي أغلب الكروت الطويلة ثلاثيّة المراوح، والأبراج الهوائيّة المزدوجة الكبيرة.

[green]يدعم لوحات الموصّلات الخلفيّة:[/green] ASUS BTF وMSI Project Zero وGigabyte Project Stealth، فتختفي الكابلات من أمام اللوحة كلّياً.

[green]منفذ USB-C أماميّ بسرعة 10 جيجابت وأربعة USB-A:[/green] مع 109 مم مساحة لتمرير الكابلات خلف اللوحة، وفلاتر غبار.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **لا يأتي بأيّ مروحة** — احسب ثمن ثلاث مراوح على الأقلّ فوق سعره.
* عريض (328 مم) وطوله 481 مم: يحتاج مكاناً واسعاً على المكتب أو تحته.
* ضمان Corsair للصندوق سنتان فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مكان فيه لمشعّ 420 مم.
* المزوّد بطول 225 مم كحدّ أقصى؛ مزوّدات 1600 واط الطويلة جدّاً قد لا تدخل.

${alt('C5000D', 'صندوق Corsair بحجرةٍ واحدة تقليديّة، ومعه مروحتان مرفقتان فلا تشتري مراوح من البداية.')}
https://www.corsair.com/us/en/p/pc-cases/cc-9011259-ww/6500d-airflow-mid-tower-dual-chamber-pc-case-black-cc-9011259-ww`,
  },

  /* ============================== قرص ============================== */
  {
    categoryId: STO, brand: 'PNY', name: 'CS900 1TB SATA', tdpWattage: 0, performanceTier: 1,
    specs: { type: 'SATA SSD 2.5"', capacity: '1TB', interface: 'SATA III', formFactor: '2.5"', readSpeed: '535 MB/s', writeSpeed: '515 MB/s', dramCache: 'No' },
    offers: [
      A('B07Y5VDNT9'),
      M('pny-cs900-1tb-3d-nand-25-sata-iii-internal-solid-state-drive-ssd-ssd7cs900-1tb-rb'),
      J('pny-technologies-cs900-hard-disk-solid-state-drives-649830'),
    ],
    description: `### PNY CS900 1TB SATA

قرص SSD اقتصاديّ بحجم 2.5 إنش ومنفذ SATA، سعته تيرابايت كامل. يناسب جهازاً ميزانيّته محدودة أو قرصاً ثانياً لمكتبة الألعاب، وترقيةً لجهازٍ قديم ما زال يعمل بقرصٍ صلب ميكانيكيّ.

**التقنيات الأساسية المدعومة:**

[green]قراءة 535 وكتابة 515 ميجابايت/ث:[/green] قرابة سقف منفذ SATA؛ تشغيل ويندوز وفتح البرامج أسرع بأضعاف من القرص الصلب الميكانيكيّ.

[green]منفذ SATA بحجم 2.5 إنش:[/green] يركب في أيّ جهاز تقريباً، ومنها الأجهزة القديمة واللوحات التي امتلأت منافذ M.2 فيها.

[green]ذاكرة 3D NAND من نوع TLC بحسب نشرة PNY:[/green] تحمّلٌ أعلى من خلايا QLC الرخيصة.

[green]استهلاك 2 واط في العمل و0.3 في الخمول:[/green] بلا ضجيج ولا حرارة، وبلا أجزاء متحرّكة تتلف بالصدمات.

[green]ضمان ثلاث سنوات وMTBF مليونا ساعة:[/green] مع دعم TRIM وS.M.A.R.T لمراقبة حالة القرص.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* ⚠️ **بلا ذاكرة DRAM**: الأداء ينخفض في النسخ الطويل والكتابة العشوائيّة الكثيفة — مقبول للألعاب والاستخدام اليوميّ لا لمونتاج الفيديو.
* نشرة PNY لا تذكر تحمّل الكتابة (TBW)، والضمان ثلاث سنوات فقط مقابل خمسٍ في أقراص الفئة الأعلى.
* سعره في المتاجر يتفاوت كثيراً؛ قارن قبل الشراء، فأقراص NVMe الاقتصاديّة أحياناً بالسعر نفسه وأسرع بأضعاف.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سرعة SATA سقفها ~550 ميجابايت/ث، أبطأ بنحو عشر مرّات من أقراص NVMe الجيل الرابع.
* لا يناسب قرصاً رئيسيّاً لمحطّة عمل.

${alt('EVO870', 'قرص SATA بالسعة نفسها لكن بذاكرة DRAM وتحمّل 600 تيرابايت وضمان خمس سنوات.')}
https://www.pny.com/File%20Library/Commercial/PNYPRO-CS900-Datasheet-High-Performance-Web.pdf`,
  },
];

// ---------------------------------------------------------------- التنفيذ

const stores = Object.fromEntries(
  (await prisma.store.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id]),
);

let blocked = false;
const bad = (m) => { console.log(`    ⛔ ${m}`); blocked = true; };
for (const p of PARTS) {
  console.log(`\n=== ${p.brand} ${p.name}  (t${p.performanceTier})`);
  console.log(`    ${Object.entries(p.specs).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
  const dup = await prisma.component.findFirst({ where: { name: { equals: p.name, mode: 'insensitive' }, brand: { equals: p.brand, mode: 'insensitive' } } });
  if (dup) bad(`موجودة: ${dup.id}`);
  if (/\*\*\[(yellow|red)\]/.test(p.description)) bad('نجومٌ حول وسمٍ ملوّن');
  if (!/^https:\/\/\S+$/.test(p.description.trim().split('\n').pop())) bad('آخر سطرٍ ليس رابط الصانع');
  if (new Set(p.offers.map((o) => o.store)).size < 3) bad("أقلّ من ثلاثة متاجر");
  for (const o of p.offers) {
    if (!stores[o.store]) { bad(`لا متجر «${o.store}»`); continue; }
    /* الرابط نفسه بلا ذيل استعلام — لا «يبدأ بـ» وحدها: ‎…ultra5-225 بادئةٌ لـ‎…ultra5-225f وهما قطعتان */
    const base = o.url.replace(/\/$/, '');
    const asin = (base.match(/\/dp\/([A-Z0-9]{10})$/) || [])[1];
    const taken = await prisma.componentOffer.findFirst({ where: { OR: [{ url: base }, { url: base + '/' }, { url: { startsWith: base + '?' } }, { url: { startsWith: base + '/?' } }, ...(asin ? [{ url: { contains: `/dp/${asin}` } }] : [])] }, select: { url: true, component: { select: { name: true } } } });
    if (taken) bad(`رابط ${o.store} مستعمل في: ${taken.component.name}`);
    else console.log(`    ✔ ${o.store}`);
  }
}
for (const [name, id] of Object.values(ALT)) {
  const c = await prisma.component.findUnique({ where: { id }, select: { brand: true, name: true } });
  if (!c) bad(`البديل ${name} (${id}) لا يشير إلى قطعة`);
  else if (`${c.brand} ${c.name}` !== name) bad(`البديل ${id} اسمه «${c.brand} ${c.name}» لا «${name}»`);
}

for (const e of EXTRA) {
  const c = await prisma.component.findUnique({ where: { id: e.id }, select: { name: true } });
  if (!c || c.name !== e.name) bad('العرض الإضافيّ: القطعة ' + e.id + ' ليست «' + e.name + '»');
  const taken = await prisma.componentOffer.findFirst({ where: { url: e.offer.url } });
  if (taken) bad('العرض الإضافيّ مستعمل: ' + e.offer.url);
  else console.log(`\n➕ سيُضاف عرض ${e.offer.store} إلى «${e.name}»`);
}
for (const m of MOVE) {
  const o = await prisma.componentOffer.findUnique({ where: { id: m.offerId }, select: { componentId: true, url: true } });
  if (!o || o.componentId !== m.from || !o.url.includes(m.urlHas)) bad(`عرض النقل ${m.offerId} تغيّر`);
  else console.log(`\n↪ سيُنقل العرض (${m.urlHas}) إلى «${m.to}»`);
}

if (blocked) { console.log('\n⛔ متوقّف.'); await prisma.$disconnect(); process.exit(1); }
if (!apply) { console.log(`\n${PARTS.length} قطعة — (عرضٌ فقط — أضف --apply)`); await prisma.$disconnect(); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const movedBefore = await prisma.componentOffer.findMany({ where: { id: { in: MOVE.map((m) => m.offerId) } } });
writeFileSync(`backups/added-batch15-${stamp}.json`, JSON.stringify({ PARTS, EXTRA, movedBefore }, null, 2));
console.log(`\nنسخة احتياطية: backups/added-batch15-${stamp}.json`);

const ids = [];
for (const p of PARTS) {
  const { offers, ...data } = p;
  const c = await prisma.component.create({ data: { ...data, price: 0 } });
  for (const o of offers) {
    await prisma.componentOffer.create({ data: { componentId: c.id, storeId: stores[o.store], url: o.url, inStock: true } });
  }
  ids.push(c.id);
  console.log(`✔ ${p.brand} ${p.name} → ${c.id}`);
}
for (const m of MOVE) {
  const to = await prisma.component.findFirst({ where: { name: m.to, brand: m.brand }, select: { id: true } });
  await prisma.componentOffer.update({ where: { id: m.offerId }, data: { componentId: to.id } });
  ids.push(m.from);
  console.log(`↪ نُقل العرض إلى ${m.to}`);
}
for (const e of EXTRA) {
  await prisma.componentOffer.create({ data: { componentId: e.id, storeId: stores[e.offer.store], url: e.offer.url, inStock: true } });
  ids.push(e.id);
  console.log(`➕ ${e.name} ← ${e.offer.store}`);
}

console.log(`\nالتالي (واحدةً واحدة):\n  ${ids.join(' ')}`);
await prisma.$disconnect();
