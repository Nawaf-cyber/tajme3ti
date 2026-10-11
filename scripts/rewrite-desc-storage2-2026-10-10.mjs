/**
 * ============ أوصاف التخزين الضعيفة (المرحلة ٢) — 2026-10-10 ============
 *
 * طلب نوّاف: «عدل الاوصاف السابقة القليلة». ثمانية أقراص وصفها ضعيف: بنودٌ خضراء بلا شرح،
 * أو تسمياتٌ إنجليزيّة قديمة (NV3)، أو بلا رابط الشركة (9100 PRO 4TB — يُلحق رابطه فقط).
 * الأرقام من مواصفات القطعة وصفحات المصنع (T710: SM2508 وMicron TLC بـ276 طبقة؛ SN5100 500GB: QLC).
 * ومعها ثلاثة روابط مصحّحة (url): ذيل تتبّع في 9100 PRO 2TB، وصفحات Lexar NM790 المكسورة/الرئيسيّة.
 *
 *   node scripts/rewrite-desc-storage2-2026-10-10.mjs           # عرض
 *   node scripts/rewrite-desc-storage2-2026-10-10.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'storage2';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const REWRITE = [
  {
    id: 'cmuztrzzj0022kcymx8nk1xpf',
    description: `### Corsair MP700 PRO 1TB Air Cooler

قرص جيلٍ خامس بمتحكّم Phison E26 ومعه مبرّدٌ هوائيّ بمروحةٍ صغيرة مركَّبٌ من المصنع. يناسب من يملك لوحةً بمنفذ Gen5 بلا مشتّتٍ قويّ فوقه، ويريد سرعةً لا تنخفض في النسخ الطويل.

**التقنيات الأساسية المدعومة:**

[green]قراءة 11,700 وكتابة 9,600 ميجابايت/ث:[/green] قرابة ضعف أسرع أقراص الجيل الرابع في نقل الملفّات الضخمة.

[green]مبرّدٌ بمروحة مرفق:[/green] أقراص E26 تسخن بسرعة، وتذكر Corsair أنّ هذا المبرّد أبرد حتى 20 درجة من مشتّتات اللوحات، فلا تهبط السرعة تحت الحمل الطويل.

[green]ذاكرة DRAM ومتحكّم Phison E26:[/green] أداءٌ ثابت في الكتابة العشوائيّة وحين يمتلئ القرص، لا كأقراص HMB الاقتصاديّة.

[green]تحمّل 700 تيرابايت وضمان خمس سنوات:[/green] مرتفعٌ لقرصٍ بسعة 1 تيرابايت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* المبرّد أطول من المشتّتات العاديّة: تأكّد من المساحة فوق المنفذ وتحت الكرت، وانزع مشتّت اللوحة إن وُجد.
* المروحة تحتاج كابل تغذية من اللوحة، وقد تُسمع في جهازٍ هادئ.
* الألعاب لا تحمّل أسرع بفرقٍ ملموس عن قرصٍ جيّد من الجيل الرابع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* سرعته الكاملة تحتاج منفذ M.2 من الجيل الخامس؛ على منفذ Gen4 يعمل بنحو 7,000 ميجابايت/ث.
* لا يركب في PlayStation 5 بسبب ارتفاع المبرّد.

---
بإمكانك التوجه إلى [Samsung 9100 PRO 1TB Gen5](/components/cmsqbq6d40000pgymsq8ebx4x) إذا كان توجهك يتركز على الآتي:
* قرص جيلٍ خامس أسرع (14,700 قراءةً) وأبرد بطبيعته، بلا مروحةٍ تُسمع.
https://www.corsair.com/us/en/p/data-storage/cssd-f1000gbmp700pro/mp700-pro-1tb-with-air-cooler-pcie-gen5-x4-nvme-2-0-m-2-ssd-cssd-f1000gbmp700pro`,
  },
  {
    id: 'cmpiecfxr004200ymi6fdyww9',
    description: `### Kingston NV3 2TB

قرصٌ اقتصاديّ من الجيل الرابع بسعة 2 تيرابايت وسعرٍ منخفض للجيجابايت. يناسب مكتبة ألعابٍ كبيرة، أو قرصاً ثانياً بجانب قرص النظام.

**التقنيات الأساسية المدعومة:**

[green]قراءة 6,000 وكتابة 5,000 ميجابايت/ث:[/green] قفزةٌ عن NV2 السابق، وأكثر ممّا تحتاجه الألعاب لتحمّل بسرعة.

[green]سعة 2 تيرابايت بسعرٍ منخفض:[/green] الألعاب الحديثة تتجاوز 100 جيجابايت للواحدة، وهذه السعة تتّسع لمكتبةٍ كاملة.

[green]تقنية HMB:[/green] بلا DRAM على القرص، يستعير جزءاً صغيراً من ذاكرة الجهاز ليحفظ جدول العناوين، فيبقى سريعاً في الاستخدام اليوميّ.

[green]واجهة PCIe 4.0 x4 بمقاس 2280:[/green] يركب في أيّ لوحةٍ حديثة وفي منفذ PlayStation 5 (بإضافة مشتّت).

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* Kingston لا تثبّت نوع الذاكرة: بعض الدفعات TLC وبعضها QLC، فتنخفض الكتابة حين يمتلئ القرص أو تطول عمليّة النسخ.
* تحمّله 640 تيرابايت وضمانه ثلاث سنوات فقط، أقلّ من أقراص الفئة الأعلى (خمس سنوات).

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* بلا ذاكرة DRAM، فلا يناسب المونتاج الاحترافيّ أو الكتابة الطويلة المستمرّة.
* لا مشتّت حرارة مرفق.

---
بإمكانك التوجه إلى [Samsung 980 Pro 1TB](/components/cmpiecd6i003r00ymoz8s4fg7) إذا كان توجهك يتركز على الآتي:
* قرصٌ للنظام بذاكرة DRAM وذاكرة TLC ثابتة وضمان خمس سنوات.
* التضحية بنصف السعة مقابل أداءٍ ثابت في الكتابة الطويلة.
https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd`,
  },
  {
    id: 'cmv18kwj10038jgymdrdfzf6v',
    description: `### WD Blue SN5100 500GB

أسرع أقراص 500 جيجابايت الاقتصاديّة: قراءة 6,600 ميجابايت/ث. يناسب قرصاً للنظام في تجميعةٍ موفّرة، مع قرصٍ ثانٍ أكبر للألعاب.

**التقنيات الأساسية المدعومة:**

[green]قراءة 6,600 وكتابة 5,600 ميجابايت/ث:[/green] قريبٌ من أقراص الجيل الرابع العليا، فيقلع Windows وتُفتح البرامج بلا انتظار.

[green]تحمّل 300 تيرابايت وضمان خمس سنوات:[/green] مرتفعٌ لهذه السعة، وضمانٌ أطول من أغلب الأقراص الاقتصاديّة (ثلاث سنوات).

[green]واجهة PCIe 4.0 x4 بمقاس 2280:[/green] يركب في أيّ لوحةٍ حديثة، ويعمل على منافذ الجيل الثالث بسرعتها.

[green]حرارةٌ منخفضة واستهلاكٌ قليل:[/green] لا يحتاج مشتّتاً، فيناسب المنافذ المكشوفة واللوحات الصغيرة.

[green]برنامج SanDisk Dashboard:[/green] لمتابعة صحّة القرص وتحديث برنامجه الثابت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* 500 جيجابايت تمتلئ بسرعة: نظام التشغيل وثلاث أو أربع ألعابٍ حديثة.
* ذاكرة QLC بلا DRAM: الكتابة الطويلة تنخفض بعد امتلاء الذاكرة المؤقّتة.
* بعض المتاجر أوقفت هذه السعة، فقد تقلّ عروضها.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يكفي مكتبة ألعابٍ كبيرة ولا مشاريع فيديو.

---
بإمكانك التوجه إلى [WD Blue SN5100 1TB](/components/cmv14qdl3002a50ymumema2rk) إذا كان توجهك يتركز على الآتي:
* القرص نفسه بضعف السعة وسرعةٍ أعلى (7,100 قراءةً)، وفرق السعر صغيرٌ نسبةً إلى ما تكسبه.
https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5100-nvme-ssd?sku=WDS500G5B0E-00CPE0`,
  },
  {
    id: 'cmv14qcid001x50ymule3u87a',
    description: `### Samsung 990 PRO 1TB Heatsink

990 PRO بسعة 1 تيرابايت مع مشتّت حرارة بإضاءة RGB مركَّب من المصنع. يناسب منفذ التوسعة في PlayStation 5 مباشرةً، والأجهزة المكتبيّة التي لا مشتّت فوق منفذ M.2 فيها.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,450 وكتابة 6,900 ميجابايت/ث:[/green] سقف الجيل الرابع، وأسرع من حاجة الألعاب.

[green]ذاكرة LPDDR4 بسعة 1 جيجابايت ومتحكّم Samsung Pascal:[/green] أداءٌ ثابت في الكتابة الطويلة والعشوائيّة، وهو ما يميّزه عن الأقراص الاقتصاديّة.

[green]مشتّت حرارة مرفق:[/green] مطابقٌ لمواصفات Sony، فيركب في PS5 بلا قطعٍ إضافيّة، ويمنع الخنق الحراريّ في الحاسوب.

[green]إضاءة RGB على المشتّت:[/green] تُدار من برنامج Samsung Magician.

[green]ضمان خمس سنوات:[/green] مع تحديثات البرنامج الثابت ومراقبة الصحّة من Magician.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* تحمّله 600 تيرابايت، كافٍ للاستخدام المنزليّ لكنّه ليس للأحمال المهنيّة الثقيلة.
* المشتّت يرفع السعر، ولوحاتٌ كثيرة فيها مشتّتٌ للمنفذ أصلاً.
* 1 تيرابايت تمتلئ مع خمس أو ستّ ألعابٍ كبيرة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.
* المشتّت قد يتعارض مع مشتّت اللوحة، فيُستعمل أحدهما فقط.

---
بإمكانك التوجه إلى [Samsung 990 PRO 1TB](/components/cmr3fmtja000004lh77ygs5nh) إذا كان توجهك يتركز على الآتي:
* القرص نفسه بلا مشتّت وبسعرٍ أقلّ، إن كانت لوحتك تبرّد المنفذ.
https://www.samsung.com/us/computing/memory-storage/solid-state-drives/990-pro-w-heatsink-pcie-4-0-nvme-ssd-1tb-mz-v9p1t0cw/`,
  },
  {
    id: 'cmv14qc9d001u50ym67678akx',
    description: `### Samsung 990 PRO 2TB Heatsink

قرص Samsung الأعلى من الجيل الرابع مع مشتّت حرارة بإضاءة RGB. يناسب منفذ التوسعة في PlayStation 5، والأجهزة المكتبيّة التي لا مشتّت فوق منفذ M.2 فيها.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,450 وكتابة 6,900 ميجابايت/ث:[/green] سقف الجيل الرابع، وأسرع من حاجة الألعاب.

[green]ذاكرة LPDDR4 بسعة 2 جيجابايت ومتحكّم Samsung Pascal:[/green] أداءٌ ثابت في الكتابة الطويلة، ولا ينهار حين يمتلئ القرص.

[green]مشتّت حرارة مرفق:[/green] مطابقٌ لمواصفات Sony فيركب في PS5 مباشرةً، ويمنع الخنق الحراريّ في الحاسوب.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات:[/green] ضعف تحمّل نسخة 1 تيرابايت.

[green]سعة 2 تيرابايت:[/green] السعة الأنسب لجهاز ألعابٍ اليوم، تتّسع للنظام ومكتبةٍ كبيرة معاً.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* أغلى من النسخة بلا مشتّت، ولوحاتٌ كثيرة فيها مشتّتٌ للمنفذ أصلاً.
* الإضاءة تحتاج برنامج Samsung Magician ولا تتزامن مع برامج اللوحات.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* ليس من الجيل الخامس.
* المشتّت قد يتعارض مع مشتّت اللوحة، فيُستعمل أحدهما فقط.

---
بإمكانك التوجه إلى [Samsung 990 PRO 2TB](/components/cmpfzir17000fx4ym3tkdck9n) إذا كان توجهك يتركز على الآتي:
* القرص نفسه بلا مشتّت وبسعرٍ أقلّ، إن كانت لوحتك تبرّد المنفذ.
https://www.samsung.com/us/computing/memory-storage/solid-state-drives/990-pro-w-heatsink-pcie-4-0-nvme-ssd-2tb-mz-v9p2t0cw/`,
  },
  {
    id: 'cmtjky8ki000070ymxc9ucmx1',
    append: 'https://www.samsung.com/us/memory-storage/nvme-ssd/9100-pro-w-heatsink-nvme-ssd-sku-mz-vap4t0cw/',
  },
  {
    id: 'cmuztrzgp001wkcymd4enth3j',
    description: `### MSI Spatium M480 Pro 1TB

قرص NVMe من الجيل الرابع بأقصى سرعاته، بمتحكّم Phison E18 وذاكرة DRAM. يناسب قرصاً رئيسيّاً لجهاز ألعابٍ أو عمل، على لوحة MSI أو غيرها.

**التقنيات الأساسية المدعومة:**

[green]قراءة 7,400 ميجابايت/ث:[/green] سقف الجيل الرابع، فيقلع النظام وتحمّل الألعاب بأسرع ما تسمح به المنصّة.

[green]ذاكرة DRAM بسعة 1 جيجابايت:[/green] أداءٌ ثابت في النسخ الطويل وحين يمتلئ القرص، بخلاف أقراص HMB الاقتصاديّة.

[green]متحكّم Phison E18 وذاكرة TLC:[/green] منصّةٌ مجرّبة في أقراصٍ عالية الأداء كثيرة، بتحمّلٍ أعلى من ذاكرة QLC.

[green]تحمّل 700 تيرابايت وضمان خمس سنوات:[/green] من أعلى الأرقام لسعة 1 تيرابايت.

[green]يتوافق مع مشتّت M.2 في لوحات MSI:[/green] ويركب كذلك في PS5 بإضافة مشتّت.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* الكتابة 6,000 ميجابايت/ث في نسخة 1 تيرابايت، أقلّ من النسخ الأكبر (7,000).
* E18 متحكّمٌ أقدم وأسخن من متحكّمات الجيل الرابع الأحدث، فيستحسن مشتّت اللوحة.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا مشتّت حرارة مرفق.
* ليس من الجيل الخامس.

---
بإمكانك التوجه إلى [WD Black SN850X 1TB](/components/cmpi5h9ch000404l1bar2y7zx) إذا كان توجهك يتركز على الآتي:
* قرص جيلٍ رابع بالسرعة نفسها تقريباً، وسعره أقلّ عادةً، ومتوفّرٌ في متاجر أكثر.
https://us.msi.com/Storage/SPATIUM-M480-PRO-PCIe-4.0-NVMe-M.2/Specification`,
  },
  {
    id: 'cmv14qbia001l50ymufwq1t4f',
    description: `### Crucial T710 2TB Heatsink

قرص Crucial الأحدث من الجيل الخامس، بمتحكّم Silicon Motion SM2508 ومشتّت حرارة مرفق. قراءة 14,500 وكتابة 13,800 ميجابايت/ث، وهو من أسرع الأقراص المتاحة وأبردها في فئته.

**التقنيات الأساسية المدعومة:**

[green]قراءة 14,500 وكتابة 13,800 ميجابايت/ث:[/green] قرب سقف PCIe 5.0، أي ضعف أسرع أقراص الجيل الرابع في نقل الملفّات الضخمة.

[green]متحكّم SM2508 بدقّة 6 نانومتر:[/green] أقلّ استهلاكاً وحرارةً بكثير من متحكّم Phison E26 في T705 السابق.

[green]ذاكرة DRAM من نوع LPDDR4 وذاكرة Micron TLC بـ276 طبقة:[/green] أداءٌ ثابت في النسخ الطويل والكتابة العشوائيّة.

[green]مشتّت حرارة مرفق:[/green] يمنع خفض السرعة حين يسخن تحت الحمل الطويل، بلا مروحة.

[green]تحمّل 1200 تيرابايت وضمان خمس سنوات.[/green]

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* سرعته الكاملة تحتاج منفذ M.2 من الجيل الخامس، وعلى الرابع يعمل بنصفها تقريباً.
* المشتّت قد يتعارض مع مشتّت اللوحة نفسها، فيُستعمل أحدهما فقط.
* نسخة المشتّت أغلى من النسخة العارية بنحو 20 دولاراً.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا فرق ملموس في الألعاب عن أقراص الجيل الرابع الجيّدة.

---
بإمكانك التوجه إلى [Crucial T705 2TB Gen5](/components/cmr2lb59v000pjgymlxk40ry4) إذا كان توجهك يتركز على الآتي:
* الجيل الخامس السابق من Crucial بسعرٍ أقلّ، بسرعةٍ قريبة لكن بحرارةٍ أعلى.
https://www.crucial.com/ssd/t710/ct2000t710ssd5`,
  },
  /* روابطُ أقراصٍ أخرى ظهرت في التحقّق: ذيل تتبّع، وصفحة Lexar رئيسيّة أو مكسورة (404) */
  { id: 'cmr3fmva0000c04lhzn9faxeg', url: 'https://semiconductor.samsung.com/consumer-storage/internal-ssd/9100-pro/' },
  { id: 'cmsxgeu21000aj8ym2g1a4nsl', url: 'https://americas.lexar.com/product/lexar-nm790-m-2-2280-pcie-gen-4x4-nvme-ssd/' },
  { id: 'cmu4jsndl000crkymmjry2v4z', url: 'https://americas.lexar.com/product/lexar-nm790-m-2-2280-pcie-gen-4x4-nvme-ssd/' },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  /* وصفٌ غنيّ ينقصه رابط الشركة وحده: يُلحق الرابط، أو يُنظَّف سطره الأخير، بلا إعادة كتابة */
  if (r.append) r.description = c.description.trimEnd() + '\n' + r.append;
  if (r.trimLast) r.description = c.description.trimEnd().split('\n').map((l, i, a) => (i === a.length - 1 ? l.replace(/^موقع الشركة الرسمي:\s*/, '').trim() : l)).join('\n');
  /* url: يستبدل سطر الرابط الأخير (أو يُلحقه إن لم يكن) — لرابطٍ مكسور أو بذيل تتبّع */
  if (r.url) { const ls = c.description.trimEnd().split('\n'); if (/^https?:\/\//.test(ls[ls.length - 1].trim())) ls.pop(); r.description = [...ls, r.url].join('\n'); }
  const d = r.description;
  const errs = [];
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  /* force: تصحيحُ بياناتٍ في وصفٍ قديمٍ أطولَ بحشوٍ أو بمعلومةٍ خاطئة — الطول هنا ليس المقياس */
  if (!r.trimLast && !r.url && !r.force && d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
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
