/**
 * ============ ASUS ROG STRIX B650E-I GAMING WIFI — رابطٌ لقطعةٍ أخرى ووصفٌ خاطئ — 2026-10-10 ============
 *
 * طلب نوّاف: «تأكد من هذا المنتج».
 *
 * الرابط: عرض أمازون الوحيد B0BP9LJBP8 صار يفتح **ROG Strix B650E-E** (لوحة ATX، رابطها الأساسيّ
 *   B0BHMTC99Q) بسعر 1,968 — دمجت أمازون القائمة في لوحةٍ أخرى. السحب قرأ 1968 فحجزه حارس القفزات
 *   («ارتفاع معلَّق 885→1968»)، فبقي الموقع يعرض 885 لرابطٍ يبيع لوحةً غيرها.
 *   الصحيح: B0BHHVC3BS («ASUS ROG Strix B650E-I Gaming WiFi … mini-ITX»، رمز 90MB1BI0-M0EAY0،
 *   متوفّر بـ 1,059). لا يبيعها مايكرولس ولا كازاسوق اليوم.
 *   يُحذف العرض الخاطئ (ومعه مراجعة السعر المعلّقة عليه — cascade) ويُنشأ العرض الصحيح.
 *
 * البيانات (rog.asus.com): الوصف القديم ادّعى «Dual USB4 Ports» — لا USB4 فيها؛ أسرع منافذها
 *   USB 3.2 Gen 2x2 (20 جيجابت). الذاكرة حتى 8000+ (OC) لا 7600، الواي‑فاي 6E، الشبكة Intel 2.5Gb،
 *   منفذا SATA، وثلاثة رؤوس مراوح فقط (CPU وAIO وصندوق). والرابط الرسميّ كان نسخة sa-ar.
 *
 *   node scripts/fix-b650e-i-2026-10-10.mjs           # عرض
 *   node scripts/fix-b650e-i-2026-10-10.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const ID = 'cmpi5h9x9000804l1t7hug0ky';
const BAD_ASIN = 'B0BP9LJBP8';
const GOOD_URL = 'https://www.amazon.sa/dp/B0BHHVC3BS';

const specs = { wifi: 'Wi-Fi 6E', lan: '2.5GbE', memorySpeed: '8000+ MT/s (OC)' };

const description = `### ASUS ROG Strix B650E-I Gaming WiFi

لوحة Mini-ITX من ROG لمنصّة AM5 بشيبست B650E: فتحة كرت ومنفذ M.2 من الجيل الخامس في لوحةٍ بحجم 17×17 سم. تناسب تجميعة ألعابٍ صغيرة قويّة بمعالج 9800X3D أو Ryzen 7.

**التقنيات الأساسية المدعومة:**

[green]شيبست B650E:[/green] الحرف E يعني فتحة كرت PCIe 5.0 ومنفذ M.2 من الجيل الخامس، وهو ما لا تعطيه لوحات B650 العاديّة.

[green]منفذا M.2:[/green] الأوّل بالجيل الخامس x4، والثاني بالجيل الرابع x4، مع مشتّتٍ حراريّ للأقراص.

[green]مراحل طاقة 10+2:[/green] تتحمّل Ryzen 7 و9800X3D في مساحةٍ ضيّقة.

[green]واي‑فاي 6E وشبكة Intel بسرعة 2.5 جيجابت:[/green] بلا بطاقةٍ إضافيّة، وهي مساحةٌ لا تملكها لوحةٌ بهذا الحجم أصلاً.

[green]منفذ USB-C خلفيّ بسرعة 20 جيجابت (USB 3.2 Gen 2x2):[/green] ومنفذ USB-C آخر يحمل الصورة من المعالج.

[green]صوت SupremeFX ALC4080 مع مضخّم Savitech:[/green] أنقى من شرائح الصوت المعتادة في اللوحات الصغيرة، مع مخرج S/PDIF.

[green]ذاكرة DDR5 حتى 8000 MT/s كسر سرعة:[/green] مع ملفّات EXPO.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* فتحتا ذاكرة فقط بحدٍّ أقصى 96 جيجابايت: زيادة السعة لاحقاً تعني استبدال الطقم.
* ثلاثة رؤوس مراوح فقط (المعالج، والمضخّة، ومروحة صندوقٍ واحدة)؛ صناديق بمراوح كثيرة تحتاج موزّعاً.
* منفذا SATA فقط.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا منفذ USB4 (أسرع منافذها 20 جيجابت).
* فتحة توسعة واحدة للكرت، بلا بطاقاتٍ أخرى.
* لا تقبل معالجات AM4.

---
بإمكانك التوجه إلى [ASUS ROG STRIX B650E-F GAMING WIFI](/components/cmpfzir170009x4ymcefw7ao7) إذا كان توجهك يتركز على الآتي:
* بناء تجميعة في صندوقٍ عاديّ بأربع فتحات ذاكرة ومنافذ M.2 ومراوح أكثر.
https://rog.asus.com/motherboards/rog-strix/rog-strix-b650e-i-gaming-wifi-model/spec/`;

const c = await prisma.component.findUnique({ where: { id: ID }, include: { offers: true } });
if (!c) { console.log('✗ القطعة غير موجودة'); process.exit(1); }
const bad = c.offers.find((o) => o.url.includes(BAD_ASIN));
if (!bad) { console.log('✗ عرض B0BP9LJBP8 غير موجود أو تغيّر'); process.exit(1); }
const taken = await prisma.componentOffer.findFirst({ where: { url: { contains: 'B0BHHVC3BS' } }, select: { component: { select: { name: true } } } });
if (taken) { console.log(`✗ الرابط الصحيح مستعمل في: ${taken.component.name}`); process.exit(1); }
if (/\*\*\[(yellow|red)/.test(description) || !/^https:\/\/\S+$/.test(description.trim().split('\n').pop())) { console.log('✗ صيغة الوصف'); process.exit(1); }
const reviews = await prisma.priceReview.findMany({ where: { offerId: bad.id } });
console.log(`− أمازون ${BAD_ASIN} (يفتح B650E-E) — ${bad.price} ريال، ومراجعات معلّقة: ${reviews.length}`);
console.log(`+ أمازون B0BHHVC3BS (B650E-I، 90MB1BI0-M0EAY0)`);
console.log(`✎ المواصفات: ${JSON.stringify(specs)}`);
console.log(`✎ الوصف: ${c.description.length} → ${description.length}`);

if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/fix-b650e-i-${stamp}.json`, JSON.stringify({ component: c, reviews }, null, 2));
  await prisma.componentOffer.delete({ where: { id: bad.id } });
  await prisma.componentOffer.create({ data: { componentId: ID, storeId: bad.storeId, url: GOOD_URL, inStock: true } });
  await prisma.component.update({ where: { id: ID }, data: { description, specs: { ...c.specs, ...specs } } });
  console.log(`نُفّذ — النسخة في backups/fix-b650e-i-${stamp}.json\nالتالي: npx tsx scripts/scrape-one.ts ${ID}`);
} else console.log('(عرضٌ فقط — أضف --apply)');
await prisma.$disconnect();
