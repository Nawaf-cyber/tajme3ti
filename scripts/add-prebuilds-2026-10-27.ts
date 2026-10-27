/**
 * ============ تجميعات جاهزة: ستٌّ جديدة، وإصلاح القائمة — 2026-10-27 ============
 *
 * طلب نوّاف: «سو ٣ و٤ وضيف تجميعات جاهزة».
 *
 * ٣ — «تجميعة RTX 5060 Ti» (الوحيدة): i5-14600K بلا مبرّد (معالجات K لا تأتي بمبرّد، والصفحة
 *     لا تنبّه كما ينبّه الباني) — أُضيف Phantom Spirit 120 SE (برجٌ من المستوى ٤: سحب 14600K
 *     ١٨١ واط، وقاعدة المساعد فوق ١٧٠ برجٌ ٤+ أو مائيّ ٢٤٠). وقرصها SN580 1TB غير متوفّر
 *     فحلّ محلّه Kingston NV3 1TB (NVMe Gen4 مثله، وهو اختيار المساعد للفئة).
 * ٤ — «Ryzen 5 9600x» بحرف صغير ← 9600X (الاسم وعنوان الوصف).
 *
 * والجديدة من خطط «ما تدري وش تبي؟» (lib/intent-plans) كما بُنيت اليوم، بثلاثة تبديلاتٍ لتخرج
 * بلا تحذير من فحص الباني:
 *   - ألعاب 1080p: طقم G.Skill Flare X5 ملفّه EXPO (AMD) على لوحة إنتل ← Kingston Fury Beast
 *     RGB 5600 بملفّ XMP (تحذير ramProfile).
 *   - مونتاج: Crucial E100 2TB تحمّله ١٠٠TB كتابة فقط — ضعيفٌ لملفّات الفيديو ← P310 2TB (٤٤٠TB).
 *   - 4K: كيس SUP01 يركّب الكرت رأسيّاً في الواجهة بكابل PCIe 4.0 ← Vector V100 (تقليديّ، ٣٦٠ مم).
 *
 * كلّ تجميعةٍ تمرّ بفحص الباني نفسه (lib/build-check): مانعٌ أو «بلا مبرّد» أو قطعةٌ غير متوفّرة
 * يوقف التنفيذ. والأوصاف بلا أسعار (تشيخ)، وأرقام الفريمات من lib/gpu-perf كما تعرضها الصفحات.
 *
 *   npx tsx scripts/add-prebuilds-2026-10-27.ts           # عرض وفحص
 *   npx tsx scripts/add-prebuilds-2026-10-27.ts --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { isAvailable } from '../lib/stores';
import { checkBuild } from '../lib/build-check';
import { partRatings } from '../lib/perf-rating';
import { gpuPerf } from '../lib/gpu-perf';

const apply = process.argv.includes('--apply');

const EXISTING_ID = 'cms8ggcro000005lb070zubod';
const EXISTING_SET = { Cooler: 'cmtcr2d8h0006o8ymekyhdaav', Storage: 'cmr3fmu4a000404lhu1iu5ptw' };
const EXISTING_NOTE = '\n\nالمعالج i5-14600K ما يجي معه مبرّد، فأضفنا له مبرّد هوائي Thermalright Phantom Spirit 120 SE.';

const R9600X = 'cmpi15ht9000104l7brbcd2yy';

const TAIL = 'الفريمات متوسّط من اختبارات Tom\'s Hardware على ألعاب حديثة بإعدادات عالية، وتختلف من لعبة لثانية.';

type New = { title: string; budgetType: 'economic' | 'midrange' | 'highend'; parts: Record<string, string>; description: string };
const NEW: New[] = [
  {
    title: 'تجميعة مكتبية ودراسة',
    budgetType: 'economic',
    parts: {
      CPU: 'cmuzsa1pm0018u8ymvmk7pxkw', Motherboard: 'cmryzpkds0003c0ymzpcub8vs', RAM: 'cmsq1r5cf0006toymvvnlag08',
      Storage: 'cmr3fmu4a000404lhu1iu5ptw', PSU: 'cmv18kn4x000kjgym1tcalzfh', Case: 'cmuzsa4jr0023u8ymny8w9y4k', Cooler: 'cmtjkyum4001670ym0xp21tr0',
    },
    description: `للشغل المكتبي والدراسة والتصفّح: أوفيس، ومتصفّح بتبويبات كثيرة، ومكالمات فيديو.

المعالج Core i3-14100 بأربع أنوية وثمانية مسارات، وفيه رسوميات مدمجة تشغّل الشاشة بدون كرت شاشة. ومعه 16GB رام DDR4 وقرص NVMe بسعة 1TB، فالجهاز يقلع ويفتح البرامج بسرعة.

ما فيها كرت شاشة، فهي مو للألعاب الثقيلة، وتقييم المعالج للمونتاج «أساسي». ولو حبيت تضيف كرت بعدين، فيه فتحة له في اللوحة.

اللوحة بدون واي فاي: وصّل الإنترنت بكيبل، أو أضف قطعة واي فاي USB.`,
  },
  {
    title: 'تجميعة ألعاب 1080p',
    budgetType: 'economic',
    parts: {
      CPU: 'cmuzkkio70016u4ym7o1avp99', Motherboard: 'cmr2k5vx40006jgym04l2zz5r', RAM: 'cmrdf1w01000204l2a9et3mr3', GPU: 'cmpiebcif001c00ymfowp9clr',
      Storage: 'cmr3fmu4a000404lhu1iu5ptw', PSU: 'cmv18kn4x000kjgym1tcalzfh', Case: 'cmuzsa4jr0023u8ymny8w9y4k', Cooler: 'cmtjkyum4001670ym0xp21tr0',
    },
    description: `للي يبي يلعب الألعاب الحديثة على شاشة 1080p بميزانية معقولة.

كرت Intel Arc B580 بذاكرة 12GB يعطي بالمتوسّط نحو 72 فريم في 1080p ونحو 51 في 1440p. والمعالج Core Ultra 5 245KF تقييمه للألعاب «متوسّط»، ومناسب لهالكرت.

16GB رام DDR5 بسرعة 5600، وقرص NVMe بسعة 1TB، ولوحة فيها واي فاي.

المعالج ما يجي معه مبرّد، فحطّينا له مبرّد هوائي من Thermalright.

${TAIL}`,
  },
  {
    title: 'تجميعة ألعاب 1440p',
    budgetType: 'midrange',
    parts: {
      CPU: 'cmuzkkio70016u4ym7o1avp99', Motherboard: 'cmr2k5vx40006jgym04l2zz5r', RAM: 'cmv14qast001c50ym3ugqrhgl', GPU: 'cmpfzir17000cx4ymvygar6x2',
      Storage: 'cmv1edtff000ud0ymuk3t65fs', PSU: 'cmv18knef000njgymszevzlbx', Case: 'cmv1esf1f000f8oymwyc2vb3e', Cooler: 'cmtjkyum4001670ym0xp21tr0',
    },
    description: `للي يبي يلعب على شاشة 1440p بإعدادات عالية وفريمات مريحة.

كرت AMD Radeon RX 9070 بذاكرة 16GB يعطي بالمتوسّط نحو 104 فريم في 1440p و141 في 1080p، وتقييمه للألعاب «قوي». والمعالج Core Ultra 5 245KF تقييمه للألعاب «متوسّط»، والباني ما ينبّه على اختناق بينهم.

32GB رام DDR5 بسرعة 7200، وقرص NVMe بسعة 2TB يكفي مكتبة ألعاب كبيرة، ولوحة فيها واي فاي، وكيس فيه أربع مراوح.

المعالج ما يجي معه مبرّد، فحطّينا له مبرّد هوائي.

${TAIL}`,
  },
  {
    title: 'تجميعة مونتاج وتصميم',
    budgetType: 'midrange',
    parts: {
      CPU: 'cmtjkejl40000ygymuokzqdih', Motherboard: 'cmr2k5vx40006jgym04l2zz5r', RAM: 'cmv14qast001c50ym3ugqrhgl', GPU: 'cmpiebcif001c00ymfowp9clr',
      Storage: 'cmv1edtff000ud0ymuk3t65fs', PSU: 'cmv18kn4x000kjgym1tcalzfh', Case: 'cmuzsa4jr0023u8ymny8w9y4k', Cooler: 'cmtjkyum4001670ym0xp21tr0',
    },
    description: `لمونتاج الفيديو والتصميم والتصوير، ومعها ألعاب على الجنب.

المعالج Core Ultra 5 250K فيه 18 نواة (6 للأداء و12 للكفاءة)، وتقييمه للمونتاج «قوي». ومعه 32GB رام DDR5 بسرعة 7200، مساحة مريحة لمشاريع الفيديو.

كرت Intel Arc B580 بذاكرة 12GB يساعد في التصدير، وفيه ترميز AV1 للرفع على يوتيوب. ويعطي بالمتوسّط نحو 72 فريم في ألعاب 1080p.

قرص NVMe بسعة 2TB يتحمّل كتابة 440TB، يناسب ملفات الفيديو الكبيرة اللي تنكتب وتنمسح كثير.

المعالج ما يجي معه مبرّد، فحطّينا له مبرّد هوائي.`,
  },
  {
    title: 'تجميعة ألعاب 4K',
    budgetType: 'highend',
    parts: {
      CPU: 'cmuzkkiyb0019u4ym9m94fynm', Motherboard: 'cmpiec4ez002w00ymzs3x1rz9', RAM: 'cmv14qast001c50ym3ugqrhgl', GPU: 'cmq122obq000ljwymcp0jcafw',
      Storage: 'cmr3fmuzl000a04lhss2v2014', PSU: 'cmv18kqtp001ojgymf89k8df4', Case: 'cmv1esf1f000f8oymwyc2vb3e', Cooler: 'cmv0ioa0u000r0symyh8koqxe',
    },
    description: `للعب على شاشة 4K، أو 1440p بفريمات عالية.

كرت NVIDIA GeForce RTX 5080 بذاكرة 16GB يعطي بالمتوسّط نحو 77 فريم في 4K و128 في 1440p بدون DLSS، وتقييمه للألعاب «قمّة». والمعالج Core i7-14700F تقييمه «قوي» للألعاب وللمونتاج.

32GB رام DDR5 بسرعة 7200، وقرص Samsung 990 EVO Plus بسعة 2TB، ولوحة Z790 فيها واي فاي.

المعالج يسحب طاقة عالية تحت الضغط، فحطّينا له مبرّد مائي 360 ملم. والمزوّد 1000 واط Gold.

${TAIL}`,
  },
  {
    title: 'تجميعة مونتاج احترافية',
    budgetType: 'highend',
    parts: {
      CPU: 'cmv14q8mm000n50ymddiwxaq7', Motherboard: 'cmpiec4ez002w00ymzs3x1rz9', RAM: 'cmv14qast001c50ym3ugqrhgl', GPU: 'cmpieco0f005300ymm7fo0r0y',
      Storage: 'cmv1edtff000ud0ymuk3t65fs', PSU: 'cmuzymv90001nwwymbey6gel7', Case: 'cmv1esf1f000f8oymwyc2vb3e', Cooler: 'cmv0ioa0u000r0symyh8koqxe',
    },
    description: `للمونتاج الثقيل والتصيير والبث، وللي يبي أعلى أداء لمّا يشتغل المعالج بكل أنويته.

المعالج Core i9-14900KF فيه 24 نواة و32 مسار، وتقييمه للمونتاج «قمّة» وللألعاب «قوي». ومعه 32GB رام DDR5 بسرعة 7200.

كرت AMD Radeon RX 6800 XT بذاكرة 16GB، والذاكرة الكبيرة تفيد في المؤثرات والخطوط الزمنية الطويلة. ويعطي بالمتوسّط نحو 80 فريم في ألعاب 1440p.

قرص NVMe بسعة 2TB يتحمّل كتابة 440TB، ومزوّد 850 واط Gold.

المعالج يسخن تحت الحمل الطويل، فحطّينا له مبرّد مائي 360 ملم.`,
  },
];

const sp = (c: any) => (!c ? {} : typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {});

(async () => {
  const cats = await prisma.category.findMany({ select: { id: true, name: true } });
  const catId = Object.fromEntries(cats.map((c) => [c.name, c.id]));
  const catName = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const all = await prisma.component.findMany({ include: { ...OFFER_INCLUDE, category: { select: { name: true } } } });
  const byId = new Map(all.map((c) => [c.id, c]));

  /** فحص الباني نفسه + التوفّر — يرجع الإجمالي، ويرمي عند أيّ مانع */
  const verify = (title: string, parts: Record<string, string>): number => {
    const picks: Record<string, any> = {};
    for (const [cat, id] of Object.entries(parts)) {
      const c = byId.get(id);
      if (!c) throw new Error(`${title}: قطعةٌ غير موجودة ${id}`);
      if (c.category.name !== cat) throw new Error(`${title}: ${c.name} ليست ${cat} بل ${c.category.name}`);
      if (!isAvailable(c)) throw new Error(`${title}: ${c.name} غير متوفّرة`);
      picks[cat] = c;
    }
    const issues = checkBuild(picks);
    const bad = issues.filter((i) => i.level === 'block' || i.code === 'noCooler');
    if (bad.length) throw new Error(`${title}: ${bad.map((i) => i.message).join(' | ')}`);
    const total = Object.values(picks).reduce((s, c: any) => s + (c.price || 0), 0);
    const cpuR = partRatings('CPU', picks.CPU.name, sp(picks.CPU)).map((r) => `${r.label} ${r.word ?? 'غير مقيس'}`).join('، ');
    const g = picks.GPU ? gpuPerf(picks.GPU.name, parseFloat(sp(picks.GPU).vram)) : null;
    const gR = picks.GPU ? partRatings('GPU', picks.GPU.name, sp(picks.GPU))[0]?.word : null;
    console.log(`\n▸ ${title} — ${Math.round(total)}﷼`);
    for (const [cat, c] of Object.entries(picks)) console.log(`   ${cat.padEnd(11)} ${c.brand} ${c.name}`);
    console.log(`   المعالج: ${cpuR}${g ? ` · الكرت: ${gR} · ${Math.round(g.f1080)}/${Math.round(g.f1440)}/${Math.round(g.f4k)} فريم` : ''}`);
    for (const i of issues) console.log(`   ⚠ ${i.code}: ${i.message}`);
    return total;
  };

  // ---- ٣: القائمة ----
  const ex = await prisma.prebuild.findUnique({ where: { id: EXISTING_ID } });
  if (!ex) throw new Error('التجميعة القائمة غير موجودة');
  const exParts: Record<string, string> = Object.fromEntries(Object.entries(ex.components as Record<string, string>).map(([cid, id]) => [catName[cid], id]));
  Object.assign(exParts, EXISTING_SET);
  const exTotal = verify(ex.title, exParts);
  const exDesc = ex.description.includes('Phantom Spirit') ? ex.description : ex.description.trimEnd() + EXISTING_NOTE;

  // ---- ٤: الاسم ----
  const r = byId.get(R9600X)!;
  if (!/^Ryzen 5 9600x$/i.test(r.name)) throw new Error(`اسمٌ غير متوقّع: ${r.name}`);
  const rDesc = (r.description ?? '').replace(/9600x/g, '9600X');
  console.log(`\n٤: «${r.name}» ← «Ryzen 5 9600X» · الوصف: ${(r.description ?? '').match(/9600x/g)?.length ?? 0} موضع`);

  // ---- الجديدة ----
  const existingTitles = new Set((await prisma.prebuild.findMany({ select: { title: true } })).map((p) => p.title));
  const toCreate = NEW.filter((n) => !existingTitles.has(n.title)).map((n) => ({ ...n, total: verify(n.title, n.parts) }));
  for (const n of NEW) if (existingTitles.has(n.title)) console.log(`\n(موجودة مسبقاً، تُترك: ${n.title})`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/add-prebuilds-${stamp}.json`, JSON.stringify({
    prebuilds: await prisma.prebuild.findMany(),
    component9600X: { id: r.id, name: r.name, description: r.description },
  }, null, 2));

  await prisma.prebuild.update({
    where: { id: EXISTING_ID },
    data: { components: Object.fromEntries(Object.entries(exParts).map(([cat, id]) => [catId[cat], id])), description: exDesc, price: Math.round(exTotal) },
  });
  await prisma.component.update({ where: { id: R9600X }, data: { name: 'Ryzen 5 9600X', description: rDesc } });
  for (const n of toCreate) {
    await prisma.prebuild.create({
      data: {
        title: n.title, budgetType: n.budgetType, description: n.description, price: Math.round(n.total),
        components: Object.fromEntries(Object.entries(n.parts).map(([cat, id]) => [catId[cat], id])),
      },
    });
  }
  console.log(`\nنُفّذ: إصلاح «${ex.title}»، واسم 9600X، و${toCreate.length} تجميعة جديدة (نسخةٌ في backups/add-prebuilds-${stamp}.json)`);
  await prisma.$disconnect();
})();
