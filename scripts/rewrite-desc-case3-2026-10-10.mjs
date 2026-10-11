/**
 * ============ أوصاف الصناديق الضعيفة (المرحلة ٢) — 2026-10-10 ============
 *
 * طلب نوّاف: «عدل الاوصاف السابقة القليلة». الصناديق أغلبها جيّد ببنودٍ خضراء عارية
 * («كرت حتى 410 مم.») — تُشرح بـ edits. وثلاثة روابط شركةٍ ناقصة (append)، وثلاثة أوصافٍ جديدة:
 *   - SUGO 17: صندوق Micro-ATX (26.1 لتراً) لا Mini-ITX — تصحيح formFactor تقرؤه أداة التوافق.
 *   - Lancool III RGB وNorth XL: تسمياتٌ إنجليزيّة قديمة ورابطٌ مشوَّه.
 * بقيت بلا رابط شركة: Zalman P10 Namu White وHAVN HS 420 وMAJESTY — لم يُعثر على صفحةٍ رسميّة تفتح.
 *
 *   node scripts/rewrite-desc-case3-2026-10-10.mjs           # عرض
 *   node scripts/rewrite-desc-case3-2026-10-10.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'case3';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

/* بندٌ أخضر عارٍ «… .[/green]» يصير «…:[/green] شرح» */
const E = (line, why) => [line, line.replace(/\.\[\/green\]$/, `:[/green] ${why}`)];
const GPU_COOL = 'يتّسع لأطول الكروت الحاليّة بما فيها نسخ RTX 5090 الضخمة، ولأبراج التبريد المزدوجة الشائعة.';
const R360 = 'يقبل مبرّد سوائل 360 مم لمعالجات الفئة العليا، أو مراوح إضافيّة في المكان نفسه.';
const R360_240 = 'مبرّد سوائل 360 مم في الواجهة، ومكانٌ ثانٍ في السقف لمراوح أو رادييتر أصغر.';
const BOARDS = 'تنقله معك إن غيّرت حجم اللوحة الأمّ لاحقاً.';
const BACK = 'لوحات الموصلات الخلفيّة تخفي الكابلات من الواجهة، والصندوق فيه الفتحات اللازمة لها.';
const REWRITE = [
  { id: 'cmv1esgje000r8oym8s39j89c', edits: [E('[green]كرت حتى 416 مم ومبرّد هوائيّ حتى 170 مم.[/green]', GPU_COOL)] },
  {
    id: 'cmv1evs0q0006l4ymjqp6ee41',
    edits: [
      E('[green]يقبل لوحات Back-Connect (ATX وMicro-ATX).[/green]', BACK),
      E('[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 165 مم.[/green]', 'يتّسع لأطول الكروت الحاليّة، ولأبراج التبريد حتى 165 مم بالضبط، فراجع ارتفاع مبرّدك.'),
    ],
  },
  {
    id: 'cmtcr2gtk000oo8ym3gsqyofc',
    edits: [
      E('[green]رادييتر 360 مم في السقف أو الواجهة.[/green]', 'مرونةٌ في مكان مبرّد السوائل: في السقف ليُخرج الهواء الحارّ، أو في الواجهة ليُدخل هواءً بارداً.'),
      E('[green]يدعم تركيب الكرت عموديّاً.[/green]', 'يعرض الكرت بواجهته عبر الزجاج باستعمال كابل Riser.'),
    ],
  },
  { id: 'cmv1esfe4000i8oymm35561tp', edits: [E('[green]يقبل مزوّد ATX حتى 140 مم أو SFX.[/green]', 'مزوّدٌ عاديّ قصير، أو مزوّد SFX صغير يفسح المكان لرادييتر 360 في الجانب.')] },
  { id: 'cmtcr2ilt000xo8ymnugdhs30', edits: [E('[green]جانب زجاجيّ.[/green]', 'تظهر القطع وإضاءة المراوح الأربع من الجانب.')] },
  { id: 'cmuzymq9u0007wwym3fx52us9', edits: [E('[green]رادييتر 360 مم في الواجهة و240 مم في السقف.[/green]', R360_240)] },
  { id: 'cmuzymr40000gwwymepe8t43p', edits: [E('[green]كرت حتى 435 مم ومزوّد حتى 200 مم.[/green]', 'يتّسع لأطول الكروت، ولمزوّدات 1200 واط وما فوقها الطويلة.')] },
  {
    id: 'cmtcr2g9d000lo8ymvzkob7m7',
    edits: [
      E('[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 180 مم.[/green]', 'يتّسع لأطول الكروت الحاليّة، ولأضخم أبراج التبريد الهوائيّ تقريباً.'),
      E('[green]رادييتر 360 مم في السقف أو الواجهة.[/green]', 'مرونةٌ في مكان مبرّد السوائل: في السقف ليُخرج الهواء الحارّ، أو في الواجهة ليُدخل هواءً بارداً.'),
      E('[green]يقبل لوحات ATX وMicro-ATX وMini-ITX.[/green]', BOARDS),
    ],
  },
  { id: 'cmuzymsxd000zwwymdawensyf', edits: [E('[green]رادييتر 360 مم في السقف.[/green]', R360)] },
  {
    id: 'cmuzymqju000awwymed4s7b48',
    edits: [
      E('[green]كرت حتى 435 مم ومبرّد هوائيّ حتى 185 مم.[/green]', 'يتّسع لأطول الكروت ولأضخم أبراج التبريد الهوائيّ بلا استثناء تقريباً.'),
      E('[green]رادييتر 420 مم في الواجهة و360 مم في السقف.[/green]', 'أكبر مقاسٍ شائع للمبرّدات المائيّة، ومكانٌ لرادييترٍ ثانٍ في السقف.'),
    ],
  },
  {
    id: 'cmuzv46u90022pcymq2vuwweg',
    edits: [
      E('[green]رادييتر 360 مم في السقف و240 مم في الجانب.[/green]', 'مبرّد سوائل 360 مم للمعالج، ومكانٌ ثانٍ في الجانب لمراوح إدخالٍ أو رادييتر أصغر.'),
      E('[green]منفذ Type-C أماميّ.[/green]', 'لهاتفٍ أو قرصٍ خارجيّ سريع دون الوصول إلى ظهر الجهاز، ويحتاج رأس Type-C في اللوحة.'),
    ],
  },
  {
    id: 'cmuzympzt0004wwym2jkx244q',
    edits: [E('[green]كرت حتى 410 مم ومبرّد هوائيّ حتى 170 مم.[/green]', GPU_COOL), E('[green]رادييتر 360 مم في الواجهة و240 مم في السقف.[/green]', R360_240)],
  },
  {
    id: 'cmuzympmv0000wwymus3hyafa',
    edits: [E('[green]كرت حتى 410 مم ومبرّد هوائيّ حتى 170 مم.[/green]', GPU_COOL), E('[green]رادييتر 360 مم في الواجهة و240 مم في السقف.[/green]', R360_240)],
  },
  {
    id: 'cmuztrvd5000kkcym43ed6zh7',
    edits: [
      E('[green]يقبل لوحات ATX وMicro-ATX وMini-ITX.[/green]', BOARDS),
      E('[green]رادييتر 240 مم في الواجهة أو السقف.[/green]', 'يكفي مبرّد سوائل 240 مم لمعالجات الفئة المتوسّطة، لا مبرّد 360.'),
      E('[green]جانب زجاجيّ بسعرٍ اقتصاديّ.[/green]', 'تظهر القطع والإضاءة من الجانب في صندوقٍ رخيص.'),
    ],
  },
  { id: 'cmuztrvvb000qkcyms75ugbxf', edits: [E('[green]يقبل لوحات Back-Connect (Micro-ATX).[/green]', BACK)] },
  { id: 'cmtcr2hdn000ro8ym9825hfit', edits: [E('[green]مبرّد هوائيّ حتى 175 مم ورادييتر 360 مم في السقف.[/green]', 'يقبل أضخم أبراج التبريد الهوائيّ تقريباً أو مبرّد سوائل 360 مم، فالخيار لك.')] },
  { id: 'cmv1esf1f000f8oymwyc2vb3e', edits: [E('[green]مبرّد هوائيّ حتى 178 مم ورادييتر 360 مم في السقف.[/green]', 'يقبل أضخم أبراج التبريد الهوائيّ تقريباً أو مبرّد سوائل 360 مم، فالخيار لك.')] },
  { id: 'cmv1eshic00108oymjazno8t7', edits: [E('[green]كرت حتى 400 مم ومبرّد هوائيّ حتى 180 مم.[/green]', 'يتّسع لأطول الكروت الحاليّة، ولأضخم أبراج التبريد الهوائيّ تقريباً.')] },
  { id: 'cmv1evrne0003l4ymp7o8pbjm', edits: [E('[green]كرت حتى 400 مم ورادييتر 360 مم في السقف.[/green]', 'يتّسع لأطول الكروت الحاليّة، ولمبرّد سوائل 360 مم للمعالج.')] },
  { id: 'cmv1evt7u000fl4ymyr7kd2w5', edits: [E('[green]كابل طاقة داخليّ معتمد بقدرة 15 أمبير.[/green]', 'يوصل المزوّد بمقبس الكهرباء في ظهر الصندوق، ومصمَّمٌ لتحمّل مزوّدات القدرة العالية بأمان.')] },
  { id: 'cmv1esh6r000x8oymlz53b5im', edits: [E('[green]كرت حتى 420 مم ومبرّد هوائيّ حتى 180 مم.[/green]', 'يتّسع لأطول الكروت الحاليّة، ولأضخم أبراج التبريد الهوائيّ تقريباً.')] },
  /* أوصافٌ غنيّة ينقصها رابط الشركة */
  { id: 'cmtjkyn2i000r70ympwjtro2d', append: 'https://www.asus.com/motherboards-components/cases/asus/asus-a23-plus-case/' },
  { id: 'cmtjkyoi3000u70yms91tejjt', append: 'https://nzxt.com/products/h6' },
  { id: 'cmtjkyidn000i70ymwp5d1wpw', append: 'https://thermaltake.com/products/tr100-mini-tower-chassis' },
  /* SUGO 17 صندوق Micro-ATX (26.1 لتراً) لا Mini-ITX — رابط مايكرولس سمّاه mini-itx فانتقل الخطأ إلى المواصفات
     وأداة التوافق، فكانت ترفض لوحات Micro-ATX فيه */
  {
    id: 'cmtjkyjoa000l70ymm1uk5f8m',
    force: true,
    specs: { formFactor: 'Micro-ATX Tower', color: 'White' },
    description: `### Silverstone SUGO 17 White

صندوق Micro-ATX مدمج بحجم 26 لتراً، يتّسع لكرتٍ بطول 400 مم ولمبرّد سوائل 360 مم. يناسب تجميعة ألعابٍ قويّة صغيرة على المكتب بلوحة Micro-ATX أو Mini-ITX.

**التقنيات الأساسية المدعومة:**

[green]400 مم للكرت في 26 لتراً:[/green] الجمع النادر، تجميعةٌ صغيرة بكرتٍ كامل الحجم مثل RTX 5080.

[green]يقبل لوحات Micro-ATX وMini-DTX وMini-ITX:[/green] أربع فتحات توسعة، فلا تُحصر في لوحات Mini-ITX الأغلى.

[green]ثلاث مراوح 120 مم مركّبة في السقف:[/green] تهويةٌ جاهزة، وهي مهمّة في هذا الحجم أكثر من غيره.

[green]رادييتر حتى 360 مم:[/green] مبرّد سوائل كامل لمعالجات الفئة العليا في صندوقٍ صغير.

[green]مزوّد ATX أو SFX أو SFX-L:[/green] لا يُلزمك بمزوّد SFX الأغلى.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* مبرّد هوائيّ حتى 158 مم: يقبل أغلب الأبراج المزدوجة (154–155 مم) لكن ليس أضخمها؛ راجع ارتفاع مبرّدك.
* التركيب في صندوقٍ مدمج أصعب: ترتيب الكابلات وتسلسل الخطوات يحتاجان تخطيطاً.
* مزوّد ATX داخله يضيّق المساحة، وSFX أريح إن أمكن.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات ATX الكاملة.
* ليس صندوق عرضٍ زجاجيّ من كلّ الجهات.

---
بإمكانك التوجه إلى [Cooler Master MasterBox NR200P V2](/components/cmpieb303000b00ymn7wfi2t2) إذا كان توجهك يتركز على الآتي:
* صندوق Mini-ITX أصغر وأشهر بأدلّة تركيبٍ كثيرة، إن كانت لوحتك Mini-ITX.
https://www.silverstonetek.com/en/product/info/computer-chassis/sg17/`,
  },
  {
    id: 'cmpieby64002a00ym3f3vl6no',
    specs: { color: 'Black' },
    description: `### Lian Li Lancool III RGB

صندوق Mid Tower كبير من Lian Li بأربع مراوح 140 مم ARGB، وواجهةٍ شبكيّة، ولوحٍ زجاجيّ يُفتح كالباب. يناسب تجميعة ألعابٍ قويّة بكرتٍ طويل ومبرّد سوائل 360 أو 420 مم.

**التقنيات الأساسية المدعومة:**

[green]أربع مراوح 140 مم ARGB PWM:[/green] ثلاث في الواجهة وواحدة في الخلف؛ المراوح الكبيرة تدفع هواءً أكثر بضجيجٍ أقلّ من مراوح 120.

[green]واجهة شبكيّة كاملة:[/green] تدفّق هواءٍ مباشر إلى الكرت والمعالج، فتبقى الحرارة منخفضة تحت الحمل الطويل.

[green]كرت حتى 435 مم ومبرّد هوائيّ حتى 185 مم:[/green] يتّسع لأطول الكروت ولأضخم أبراج التبريد بلا استثناء تقريباً.

[green]رادييتر 420 مم في الواجهة و360 مم في السقف:[/green] أكبر مقاسٍ شائع للمبرّدات المائيّة، ومكانٌ لرادييترٍ ثانٍ.

[green]لوح زجاجيّ بمفصّلة:[/green] يُفتح كالباب دون فكّ براغٍ، فالصيانة وتنظيف الغبار أسهل.

[green]يقبل حتى E-ATX:[/green] ولوحات ATX وMicro-ATX وMini-ITX.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* حجمه كبير، ويحتاج مساحة مكتبٍ أو أرضٍ واسعة، وقد يكون أكبر من حاجة تجميعةٍ متوسّطة.
* سعره أعلى من LANCOOL 216 الذي يبرّد جيّداً أيضاً؛ الفارق في الحجم والإضاءة والمراوح الأربع.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* لا يقبل لوحات Back-Connect.
* ليس صندوقاً هادئاً معزولاً؛ الواجهة الشبكيّة تُسمع منها المراوح.

---
بإمكانك التوجه إلى [Lian Li LANCOOL 216](/components/cmpfzir17000gx4ymtjjn4ag1) إذا كان توجهك يتركز على الآتي:
* تبريدٌ ممتاز مماثل بحجمٍ أصغر وسعرٍ أقلّ، إن لم تحتج المساحة الإضافيّة.
https://lian-li.com/product/lancool-iii/`,
  },
  {
    id: 'cmpieb4ax000g00ymgj1zamtu',
    specs: { color: 'Black' },
    description: `### Fractal Design North XL

النسخة الكبيرة من North: واجهة من خشب الجوز الحقيقيّ مع شبكٍ للتهوية، وثلاث مراوح 140 مم، ومساحةٌ للوحات E-ATX. يناسب جهازاً قويّاً يريده صاحبه قطعة أثاثٍ أنيقة في غرفة المعيشة أو المكتب، لا صندوق ألعابٍ مضيئاً.

**التقنيات الأساسية المدعومة:**

[green]واجهة خشبٍ حقيقيّ:[/green] شرائح خشبٍ بينها فتحات تهوية، فلا يضحّي المظهر بتدفّق الهواء.

[green]ثلاث مراوح Aspect 140 مم PWM:[/green] اثنتان في الواجهة وواحدة في الخلف، هادئةٌ وتُضبط سرعتها من اللوحة.

[green]كرت حتى 413 مم ومبرّد هوائيّ حتى 185 مم:[/green] يتّسع لأطول الكروت الحاليّة ولأضخم أبراج التبريد.

[green]رادييتر حتى 420 مم في الواجهة:[/green] أكبر مقاسٍ شائع للمبرّدات المائيّة.

[green]يقبل لوحات E-ATX:[/green] ومنفذ USB-C أماميّ مع منفذَي USB-A.

[yellow]مدعوم جزئياً أو ليس الأفضل فيه:[/yellow]

* جزءٌ كبير من سعره للتصميم والخشب لا للأداء، فصناديق شبكيّة أرخص تبرّد مثله.
* يُباع بلوحٍ جانبيّ زجاجيّ (TG) أو شبكيّ (Mesh) بالإطار نفسه؛ تأكّد من النسخة في صفحة المتجر.
* لا إضاءة RGB، وهو قرارٌ مقصود في التصميم.

[red]غير مدعوم أو ليس من مزاياه الرئيسية:[/red]

* حجمه كبير، ولا يناسب المكاتب الضيّقة.

---
بإمكانك التوجه إلى [Fractal Design Meshify 2](/components/cmpiec0gj002i00ymud3xdj2y) إذا كان توجهك يتركز على الآتي:
* صندوق Fractal بتهويةٍ ممتازة وسعرٍ أقلّ بكثير، إن لم يكن الخشب شرطاً.
https://www.fractal-design.com/products/cases/north-series/north-xl/north-xl-charcoal-black-tg/`,
  },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  /* edits: استبدالاتٌ نصّيّة دقيقة [قديم، جديد] — لشرح بندٍ أخضر عارٍ أو إضافة نقطة، بلا إعادة كتابة الوصف كلّه */
  const missing = [];
  let base = c.description.trimEnd();
  if (r.edits) { for (const [a, b] of r.edits) { if (!base.includes(a)) missing.push(a.slice(0, 40)); base = base.replace(a, b); } r.description = base; }
  /* وصفٌ غنيّ ينقصه رابط الشركة وحده: يُلحق الرابط، أو يُنظَّف سطره الأخير، بلا إعادة كتابة */
  if (r.append) r.description = base + '\n' + r.append;
  if (r.trimLast) r.description = base.split('\n').map((l, i, a) => (i === a.length - 1 ? l.replace(/^موقع الشركة الرسمي:\s*/, '').trim() : l)).join('\n');
  /* url: يستبدل سطر الرابط الأخير (أو يُلحقه إن لم يكن) — لرابطٍ مكسور أو بذيل تتبّع */
  if (r.url) { const ls = base.split('\n'); if (/^https?:\/\//.test(ls[ls.length - 1].trim())) ls.pop(); r.description = [...ls, r.url].join('\n'); }
  const d = r.description;
  const errs = missing.map((m) => `مقطعٌ غير موجود «${m}»`);
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
