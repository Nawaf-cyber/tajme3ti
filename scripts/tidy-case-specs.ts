/**
 * ============ ٢٢ مفتاحاً للكيس، وشاملان اثنان ============
 *
 * الكيس أسوأ فئةٍ في الكتالوج انضباطاً. للمقارنة:
 *
 *   التخزين  ٤٢ قطعة ·  ٦ مفاتيح · ٦ شاملة
 *   اللوحة   ٥١ قطعة ·  ٨ مفاتيح · ٧ شاملة
 *   **الكيس  ٢٧ قطعة · ٢٢ مفتاحاً · ٢ شاملان**
 *
 * وثمانيةٌ منها على قطعةٍ واحدة في الكتالوج كلّه. والأثر مرئي: فتحتُ
 * `/compare` بين O11 EVO وForge M100A فكانت ستّة صفوف من ثمانية نصفها
 * فارغ — جدول المقارنة يعرض قائمتين متجاورتين لا مقارنة.
 *
 * ============ لماذا لا يُحذف الكلّ ولا يُملأ الكلّ ============
 *
 * «مفتاح ناقص» يخفي ثلاثة أشياء مختلفة، ولكلٍّ علاج:
 *
 *   ١) **مترادف** — مفتاحان يقولان الشيء نفسه فلا يصطفّان أبداً:
 *      CH260 عنده `airflow="High Airflow Mesh"` **و** `frontPanel="Mesh"`
 *      معاً على القطعة نفسها. وTUF GT502 عنده `design="Dual Chamber"`
 *      بينما H9 Flow عنده `dualChamber="Yes"` — ميزةٌ واحدة بمفتاحين.
 *      → يُدمَج في المفتاح المعتمد، فلا تضيع قيمة.
 *
 *   ٢) **رأيٌ لا مواصفة** — `airflow="Excellent"` و`storage="Capacity"`.
 *      لا تُقارَن ولا تُقاس. → تسقط.
 *
 *   ٣) **صادقٌ على الجميع** — `coolingModes="Air or Water"`. كلّ كيسٍ
 *      صُنع يقبل الهواء والماء. → تسقط.
 *
 * ============ ولا تُحذف معلومةٌ قبل التأكّد أنها محفوظة ============
 *
 * فُحصت الأوصاف قبل الحذف: **٧ من ١٠** قيمٍ يتيمة مذكورةٌ في وصف قطعتها
 * أصلاً بجملةٍ أوضح من المفتاح («كيس عرض بانورامي زجاجي بدون حواف» بدل
 * `design="Seamless Glass Showcase"`). فحذف مفتاحها لا يفقد شيئاً.
 *
 * والثلاث الباقية **غير مذكورة** — فيُضاف لها سطرٌ في الوصف قبل الحذف:
 * مقابض TUF القطنية، وسعة أقراص Meshify 2، وهيكل Morpheus المفكّك.
 *
 *   npx tsx scripts/tidy-case-specs.ts            # عرض
 *   npx tsx scripts/tidy-case-specs.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

type Plan = {
  id: string;
  /** مفاتيح تُنقل قيمتها إلى مفتاحٍ آخر ثم تُحذف */
  move?: { from: string; to: string; value?: string }[];
  /** مفاتيح تُحذف — والسبب مكتوبٌ ليُراجَع */
  drop?: { key: string; why: string }[];
  /** سطر يُضاف قبل «---» في الوصف، لقيمةٍ غير مذكورة فيه */
  addLine?: string;
};

const PLANS: Plan[] = [
  // ───── دمج airflow ← frontPanel
  { id: 'cmsq0k1u2000264ym2sby76ai', // CH260
    drop: [{ key: 'airflow', why: 'مكرّر: frontPanel="Mesh" على القطعة نفسها' }] },
  { id: 'cmpiebxm6002800ymk4bd3ep4', // CH560 Digital
    move: [{ from: 'airflow', to: 'frontPanel' }] },
  { id: 'cmpiebyel002b00ymx7o5s5g0', // Sky Two GX
    move: [{ from: 'airflow', to: 'frontPanel', value: 'Mesh' }] },
  { id: 'cmsqbhr4c0000s4ymld2p1ytn', // 2000D Mini-ITX
    drop: [{ key: 'airflow', why: 'مكرّر: frontPanel="Mesh" على القطعة نفسها' }] },
  { id: 'cmpieb4ax000g00ymgj1zamtu', // North XL
    drop: [{ key: 'airflow', why: '«Excellent» رأيٌ لا مواصفة؛ وfrontPanel="Real Wood" باقٍ' }] },
  { id: 'cmpiec0gj002i00ymud3xdj2y', // Meshify 2
    drop: [
      { key: 'airflow', why: '«Excellent» رأيٌ لا مواصفة' },
      { key: 'storage', why: '«Capacity» لا يقول شيئاً — نُقل معناه للوصف' },
    ],
    addLine: '[green]قفص أقراص واسع:[/green] يستوعب حتى ١٤ قرصاً بالأقفاص الإضافية — وهو ما يميّزه عن كيسات التهوية التي تتخلّى عن التخزين.' },

  // ───── دمج design ← dualChamber
  { id: 'cmpiebxdd002700ymksl2q2f0', // TUF GT502
    move: [{ from: 'design', to: 'dualChamber', value: 'Yes' }],
    drop: [{ key: 'handles', why: 'قيمةٌ حقيقية غير مذكورة في الوصف — نُقلت إليه' }],
    addLine: '[green]مقابض قماشية منسوجة:[/green] في أعلى الكيس، لحمله وهو مركّب — تفصيلةٌ عملية في كيسٍ ممتلئ ثقيل.' },
  { id: 'cmpieb3if000d00ymz13tdkyt', // H6 Flow RGB White
    move: [{ from: 'design', to: 'dualChamber', value: 'Yes' }] },
  { id: 'cmpieb3ts000e00ymflyrzgd2', // O11 Dynamic EVO
    drop: [{ key: 'design', why: '«Reversible» مذكورٌ في الوصف؛ وdualChamber باقٍ' }] },
  { id: 'cmpiebx13002600ymdhs2okf9', // NV5
    drop: [{ key: 'design', why: 'مذكور في الوصف: «كيس عرض بانورامي زجاجي بدون حواف»' }] },
  { id: 'cmpieb4ma000h00ym6qm9hb5l', // King 95 Pro
    drop: [{ key: 'design', why: 'مذكور في الوصف: «تصميم بزوايا زجاجية يعرض القطع»' }] },
  { id: 'cmpiebypz002c00ymfesox3jf', // XT View
    drop: [{ key: 'glass', why: 'مذكور في الوصف: «واجهة زجاجية عرضية»' }] },

  // ───── يتيمة مذكورة في الوصف
  { id: 'cmpfzir17000gx4ymtjjn4ag1', // LANCOOL 216
    drop: [{ key: 'coolingModes', why: '«Air or Water» صادقٌ على كل كيسٍ صُنع' }] },
  { id: 'cmpiebzcq002e00ymgbk1ipig', // Shadow Base 800 FX
    drop: [{ key: 'acoustics', why: 'مذكور في الوصف: «يوازن بين التشغيل الصامت وتدفّق هواء جيّد»' }] },
  { id: 'cmpiec0rx002j00ymwwtto4ip', // Tower 300
    drop: [{ key: 'orientation', why: 'مذكور في الوصف: «تصميم عمودي فريد»' }] },

  // ───── يتيمة غير مذكورة
  { id: 'cmpiec1hm002m00ympx1co750', // Morpheus
    drop: [{ key: 'modular', why: '«Yes» بلا سياق — نُقل معناه للوصف' }],
    addLine: '[green]هيكل قابل للفكّ:[/green] تُنزع الألواح والأقفاص كاملةً أثناء التركيب، فتُبنى التجميعة على هيكلٍ مفتوح ثم يُغلق.' },
];

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

/** يُدرج السطر قبل فاصل «---» الذي يسبق روابط القطع البديلة */
const insertLine = (desc: string, line: string): string => {
  const at = desc.indexOf('\n---');
  if (at === -1) return `${desc.trimEnd()}\n\n${line}`;
  return `${desc.slice(0, at).trimEnd()}\n\n${line}\n${desc.slice(at)}`;
};

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const before = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { id: true, brand: true, name: true, specs: true, description: true },
  });
  const byId = Object.fromEntries(before.map((c) => [c.id, c]));

  const missing = PLANS.filter((p) => !byId[p.id]);
  if (missing.length) {
    console.log(`⛔ معرّفات لا تقابل كيساً: ${missing.map((m) => m.id).join('، ')}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const updates: { id: string; specs: any; description?: string }[] = [];

  for (const plan of PLANS) {
    const c = byId[plan.id];
    const specs = { ...parse(c.specs) };
    let desc = c.description || '';
    const log: string[] = [];

    for (const m of plan.move || []) {
      if (!(m.from in specs)) { log.push(`   ⚠️ ${m.from} غير موجود — تُخطّى`); continue; }
      const val = m.value ?? specs[m.from];
      const had = specs[m.to];
      specs[m.to] = val;
      delete specs[m.from];
      log.push(`   ↦ ${m.from} → ${m.to} = "${val}"${had ? `  (كان "${had}")` : ''}`);
    }
    for (const d of plan.drop || []) {
      if (!(d.key in specs)) { log.push(`   ⚠️ ${d.key} غير موجود — تُخطّى`); continue; }
      log.push(`   ✂ ${d.key} = "${specs[d.key]}"   ← ${d.why}`);
      delete specs[d.key];
    }
    if (plan.addLine) {
      desc = insertLine(desc, plan.addLine);
      log.push(`   + وصف: ${plan.addLine.slice(0, 70)}…`);
    }

    console.log(`\n${c.brand} ${c.name}`);
    log.forEach((l) => console.log(l));
    updates.push({ id: c.id, specs, ...(plan.addLine ? { description: desc } : {}) });
  }

  // إحصاء المفاتيح بعد التنظيف
  const after = before.map((c) => {
    const u = updates.find((x) => x.id === c.id);
    return u ? u.specs : parse(c.specs);
  });
  const count = (rows: Record<string, any>[]) => {
    const f: Record<string, number> = {};
    for (const s of rows) for (const k of Object.keys(s)) f[k] = (f[k] || 0) + 1;
    return f;
  };
  const fb = count(before.map((c) => parse(c.specs)));
  const fa = count(after);
  console.log(`\n════ المفاتيح: ${Object.keys(fb).length} → ${Object.keys(fa).length}`);
  console.log('   ' + Object.entries(fa).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('  '));
  const gone = Object.keys(fb).filter((k) => !(k in fa));
  console.log(`   اختفت (${gone.length}): ${gone.join('، ')}`);
  console.log(`   يتيمة متبقّية: ${Object.entries(fa).filter(([, n]) => n === 1).map(([k]) => k).join('، ') || 'لا شيء'}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/case-specs-before-${stamp}.json`, JSON.stringify(before, null, 2));

  for (const u of updates) {
    await prisma.component.update({
      where: { id: u.id },
      data: { specs: u.specs, ...(u.description ? { description: u.description } : {}) },
    });
  }
  console.log(`\n✔ حُدّث ${updates.length} كيساً · النسخة الاحتياطية في backups/case-specs-before-${stamp}.json`);
  await prisma.$disconnect();
}

main();
