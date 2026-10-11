/**
 * ============ إعادة كتابة أوصاف المعالجات القصيرة — 2026-10-09 ============
 *
 * طلب نوّاف: «عدل الاوصاف السابقة القليلة». أربعة معالجات دون 900 حرف، أوّلها
 * Ryzen 9 9900X بصيغةٍ قديمة تماماً (فقراتٌ حرّة بلا وسوم ألوان ولا بديل).
 * الأرقام من مواصفات القطعة المسجّلة (الأنوية، الكاش، TDP، أقصى سحب في tdpWattage).
 *
 *   node scripts/rewrite-desc-cpu-2026-10-09.mjs           # عرض
 *   node scripts/rewrite-desc-cpu-2026-10-09.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'cpu';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REWRITE = [
  {
    id: 'cmpiecwxm006000ymohvbpg83',
    description: `### AMD Ryzen 9 9900X

اثنتا عشرة نواة Zen 5 وأربعة وعشرون مساراً بتردّدٍ حتى 5.6 جيجاهرتز. معالجٌ للمبدعين وصنّاع المحتوى والمبرمجين، ولمن يلعب ويبثّ بجودةٍ عالية في الوقت نفسه.

**التقنيات الأساسية المدعومة:**

[green]12 نواة و24 مساراً (Zen 5):[/green] أداءٌ عالٍ في التصيير والمونتاج وضغط الملفّات والترجمة البرمجيّة، حيث يُستغلّ كلّ مسار.

[green]تردّد حتى 5.6 جيجاهرتز وكاش L3 بسعة 64 ميجابايت:[/green] أداءٌ قويّ في الألعاب أيضاً، وإن لم يكن الأعلى فيها.

[green]TDP رسميّ 120 واط (أقصى سحب نحو 162 واط):[/green] أكفأ بوضوح من جيل Zen 4 بالأداء نفسه، ويكفيه مبرّدٌ هوائيّ قويّ أو مائيّ 240 مم.

[green]منصّة AM5:[/green] تدعم DDR5 وPCIe 5.0، وAMD تَعِد بدعمها لأجيالٍ قادمة، فالترقية لاحقاً بتغيير المعالج وحده.

[green]رسوميات Radeon مدمجة:[/green] تشغّل الجهاز وتعرض الصورة بلا كرت، وهي مفيدة للتشخيص أو جهاز عملٍ بلا ألعاب.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الأنوية موزّعة على شريحتين (6 + 6)، والألعاب التي تتنقّل بينهما تخسر قليلاً. في الألعاب وحدها يتفوّق عليه Ryzen 7 9800X3D.
* يحتاج ذاكرة DDR5 بسرعة 6000 ليعطي أفضل ما عنده.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مبرّد في العلبة.
* ليس خياراً اقتصاديّاً للألعاب فقط.

${alt('AMD Ryzen 7 9800X3D', 'cmpfzir160007x4ym7w2xdh50', 'أسرع معالجٍ للألعاب بفضل كاش 3D V-Cache، بثماني أنوية.')}
https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9900x.html`,
  },
  {
    id: 'cmv14q7bd000750ymllxh8l3e',
    description: `### AMD Ryzen 7 8700F

ثماني أنوية Zen 4 على منصّة AM5 بسعرٍ منخفض ومعه مبرّد. مدخلٌ رخيص إلى منصّة AMD الحديثة لجهاز ألعابٍ متوسّط، مع إمكانيّة ترقية المعالج لاحقاً على اللوحة نفسها.

**التقنيات الأساسية المدعومة:**

[green]ثماني أنوية و16 مساراً بتردّد حتى 5.0 جيجاهرتز:[/green] تكفي الألعاب الحديثة والمونتاج الخفيف والبثّ.

[green]مبرّد Wraith Stealth في العلبة:[/green] يكفي الاستخدام العاديّ، فتوفّر ثمن المبرّد في التجميعات الاقتصاديّة.

[green]TDP 65 واط (أقصى سحب نحو 88 واط):[/green] حرارةٌ منخفضة، ومزوّدٌ متواضع يكفي، ولوحة A620 أو B650 الاقتصاديّة تحمله بلا عناء.

[green]منصّة AM5 وذاكرة DDR5:[/green] ترقية المعالج لاحقاً إلى Ryzen 9000 أو ما بعده دون تغيير اللوحة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* كاش L3 بسعة 16 ميجابايت فقط، نصف Ryzen 7 7700، فهو أبطأ منه في الألعاب الحسّاسة للكاش.
* يدعم PCIe 4.0 لا 5.0 للكرت والأقراص. الفرق عمليّاً لا يُلحظ اليوم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة، فيلزمه كرت شاشة.
* ليس للأحمال الاحترافيّة الثقيلة.

${alt('AMD Ryzen 7 7700', 'cmrd7irgy000204l6f0eofmx8', 'ثماني أنوية بكاش 32 ميجابايت ورسوميات مدمجة ودعم PCIe 5.0.')}
https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700f.html`,
  },
  {
    id: 'cmv14q98g000u50ym9vzf028b',
    description: `### Intel Core i5-12600KF

معالج ألعاب من الجيل الثاني عشر: عشر أنوية و16 مساراً، مفتوح لكسر السرعة، ويعمل مع DDR4 لتقليل كلفة التجميعة. خيارٌ اقتصاديّ لجهاز ألعابٍ متوسّط إن وُجد بسعرٍ جيّد.

**التقنيات الأساسية المدعومة:**

[green]عشر أنوية (6 أداء + 4 كفاءة):[/green] أنوية الأداء تحمل الألعاب، وأنوية الكفاءة تتكفّل بالخلفيّة (البثّ والمتصفّح ومكافحة الفيروسات).

[green]تردّد حتى 4.9 جيجاهرتز وكاش 20 ميجابايت:[/green] يكفي كروت الفئة المتوسّطة دون اختناقٍ ملحوظ.

[green]يدعم DDR4 وDDR5:[/green] لوحة DDR4 وذاكرتها أرخص بكثير، أو لوحة DDR5 لمن يخطّط للترقية.

[green]مفتوح لكسر السرعة:[/green] على لوحات Z690 وZ790.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أقدم من 14600KF وأبطأ منه بفارقٍ ملحوظ في التعدّد (أنوية الكفاءة 4 مقابل 8).
* منصّة LGA1700 منتهية، فلا ترقية لمعالجٍ أحدث على اللوحة نفسها بعد الجيل الرابع عشر.
* أقصى سحبٍ نحو 150 واط، فيحتاج مبرّداً جيّداً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا رسوميات مدمجة (نسخة F) ولا مبرّد في العلبة.

${alt('Intel Core i5-14600KF', 'cmrd7ishg000904l6rvxxopne', 'الجيل الأحدث على المنصّة نفسها بأربع عشرة نواة وأداءٍ أعلى.')}
https://www.intel.com/content/www/us/en/products/sku/134590/intel-core-i512600kf-processor-20m-cache-up-to-4-90-ghz/specifications.html`,
  },
  {
    id: 'cmv14q8za000r50ymr9b3w9r3',
    description: `### Intel Core i9-13900K

معالج Intel الأعلى من الجيل الثالث عشر: 24 نواة و32 مساراً بتردّدٍ حتى 5.8 جيجاهرتز، مع رسوميات UHD 770. يناسب جهازاً يجمع الألعاب العالية مع المونتاج والتصيير.

**التقنيات الأساسية المدعومة:**

[green]24 نواة (8 أداء + 16 كفاءة):[/green] أداءٌ عالٍ جداً في التعدّد، قريبٌ من معالجات 16 نواة المنافسة.

[green]تردّد حتى 5.8 جيجاهرتز وكاش L3 بسعة 36 ميجابايت:[/green] أداءٌ ممتاز في الألعاب.

[green]رسوميات UHD 770 مدمجة:[/green] تشغّل الجهاز بلا كرت، وتسرّع ترميز الفيديو عبر Quick Sync في برامج المونتاج.

[green]مفتوح لكسر السرعة، ويدعم DDR5 وDDR4:[/green] حرّيّة اختيار اللوحة والذاكرة.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* يسحب حتى 253 واط، فيحتاج مبرّداً مائيّاً 360 مم ومزوّداً قويّاً.
* حدّث البايوس فور التركيب لمعالجة مشكلة الاستقرار المعروفة في الجيلين 13 و14.
* 14900K خليفته بالأنوية نفسها وتردّدٍ أعلى، وسعره قريب غالباً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مبرّد في العلبة.
* منصّة LGA1700 منتهية.

${alt('Intel Core i9-14900K', 'cmpiebe3m001i00ymrmrw2zep', 'الأنوية نفسها بتردّدٍ يصل إلى 6.0 جيجاهرتز.')}
https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/specifications.html`,
  },
];

// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  const d = r.description;
  const errs = [];
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  if (d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
  console.log(`${errs.length ? '✗' : '✔'} ${c.name}: ${(c.description || '').length} → ${d.length}${r.specs ? ' + مواصفات ' + JSON.stringify(r.specs) : ''}${errs.length ? '  ⟵ ' + errs.join('، ') : ''}`);
  if (errs.length) bad++;
  backup.push(c);
}
if (bad) { console.log(`\n${bad} خطأ — لم يُنفَّذ شيء`); process.exit(1); }
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/desc-${TAG}-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const r of REWRITE) {
    const c = backup.find((b) => b.id === r.id);
    const specs = r.specs ? { ...(typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs), ...r.specs } : undefined;
    await prisma.component.update({ where: { id: r.id }, data: { description: r.description, ...(specs ? { specs } : {}) } });
  }
  console.log(`\nنُفّذ ${REWRITE.length} — النسخة في backups/desc-${TAG}-${stamp}.json`);
} else console.log(`\n${REWRITE.length} وصفاً — (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
