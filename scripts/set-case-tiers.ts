/**
 * ============ مستوى الكيس: ٢٣ من ٢٧ كانت فارغة ============
 *
 * `performanceTier` مكتوبٌ على كل معالج وكرت ولوحة ورام — وعلى أربعة
 * كيسات من سبعةٍ وعشرين. والنتيجة أن مستهلكيه عطّلوه:
 *   · `BuildTuner` يستثني الكيس صراحةً من الترتيب بالمستوى ويرتّبه بالسعر.
 *   · `AutoBuildsSection` يستبدل به سقوفاً سعرية (٥٠٠ للاقتصادي، ٨٠٠ للمتوسط).
 * وكلاهما يرتّب بالسعر — وهو ما رفضناه صراحةً في بقيّة الفئات لأن السعر
 * لا يساوي القدرة.
 *
 * ============ ما معنى «مستوى» في كيس؟ ============
 *
 * ليس أداءً — الكيس لا يحسب شيئاً. المعنى المفيد هو: **أيّ فئة تجميعة
 * يخدمها هذا الكيس بلا تنازل؟** وهو ما تقيسه ثلاثة أشياء مرئية في البيانات:
 *
 *   ١) سعة الكرت — الحدّ الصلب. كرت 5090 طوله ٣٤٨ مم، و5080 ثلاثمئة
 *      وأربعون. فكيسٌ سقفه ٣٢٠ لا يخدم تجميعةً عليا مهما غلا ثمنه.
 *   ٢) قدرة التبريد — دعم راديتر ٣٦٠ فأعلى، أو أربع مراوح مرفقة فأكثر.
 *   ٣) البناء والتوسعة — غرفتان، عرض عمودي، Full Tower، مواد أو شاشة.
 *
 * والمستوى الأوّل يبقى **فارغاً عمداً**: هو صندوق المكاتب الرخيص بلا
 * تهوية، ولا نبيعه ولا ينبغي أن نقترحه. أرخص ما في الكتالوج (٣٠٥ ﷼) كيسٌ
 * اقتصاديّ جيّد لا كيسٌ رديء — فوضعه في الأوّل كذبٌ على المستوى نفسه.
 *
 * ⚠️ وواحدٌ يتغيّر عمّا كان: DeepCool CH260 من ٣ إلى ٢. سعة كرته ٣٨٨
 * ودعمه ٣٦٠ يغريان برفعه، لكنه أرخص كيسٍ عندنا وخطّ DeepCool الاقتصادي،
 * وبقاؤه في ٣ كان يترك المستوى الثاني بكيسٍ واحد — فلا يجد البناء
 * الاقتصادي ما يختار منه ويسقط إلى الاحتياطي في كل مرّة.
 *
 *   npx tsx scripts/set-case-tiers.ts            # عرض
 *   npx tsx scripts/set-case-tiers.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** المعرّف → [المستوى، سبب الوضع] — السبب مكتوبٌ ليُراجَع لا ليُصدَّق */
const TIERS: Record<string, [number, string]> = {
  // ═════ ٢ · اقتصادي: أساسيات سليمة، بلا كماليات، أدنى السعر
  cmsq0k1u2000264ym2sby76ai: [2, 'CH260 — أرخص كيس (٣٠٥)، خطّ DeepCool الاقتصادي، Micro-ATX'],
  cmsq0k1kq000064ym7ldos7uf: [2, 'Forge M100A — سعة كرت ٣٠٠ مم فقط وراديتر ٢٤٠: لا يخدم فوق المتوسط'],

  // ═════ ٣ · متوسط: تهوية جيدة ومراوح وسعة مريحة، تصميم قياسي
  cmpiebxxk002900ym6hzx5w2l: [3, 'TD500 Mesh V2 — ٣ مراوح ARGB وسعة ٤١٠، بلا غرفتين ولا مواد مميّزة'],
  cmpiebxm6002800ymk4bd3ep4: [3, 'CH560 Digital — سعة ٣٨٠ وتهوية شبكية؛ الشاشة زينة لا قدرة'],
  cmpieb39w000c00ym9n758myw: [3, '4000D Airflow — المرجع في الفئة المتوسطة: سعة ٣٦٠ وتهوية شبكية'],
  cmpiebyel002b00ymx7o5s5g0: [3, 'Sky Two GX — سعة ٤٠٠ و٣ مراوح ١٤٠، تصميم قياسي'],
  cmsqbhr4c0000s4ymld2p1ytn: [3, '2000D Mini-ITX — راديتر ٣٦٠ في مقاس صغير، لكن سعة ٣٢٠ تمنع الكروت العليا'],
  cmpieb2em000900ymqr0r68gv: [3, 'H210 — سعة ٣٢٥ ورايزر مرفق؛ يقبل ATX وSFX'],
  cmpfzir17000gx4ymtjjn4ag1: [3, 'LANCOOL 216 — سعة ٣٩٢ ومروحتا ١٦٠ مم، قيمةٌ ممتازة بتصميم قياسي'],
  cmpiebypz002c00ymfesox3jf: [3, 'XT View — سعة ٤١٥ و٣ مراوح؛ فارق سعره عن ٤٠٠٠D زجاجٌ لا قدرة'],

  // ═════ ٤ · عالٍ: ما تحتاجه تجميعة عليا — سعة ≥٤٣٠ أو غرفتان أو راديتر مزدوج
  cmpiec0gj002i00ymud3xdj2y: [4, 'Meshify 2 — سعة ٤٦٧ مم، أوسع كيس Mid Tower عندنا'],
  cmpiebx13002600ymdhs2okf9: [4, 'NV5 — سعة ٤٣٥ وتهيئة عرضٍ عمودي'],
  cmpieby64002a00ym3f3vl6no: [4, 'Lancool III RGB — سعة ٤٣٥ وأربع مراوح ١٤٠'],
  cmpieb4ma000h00ym6qm9hb5l: [4, 'King 95 Pro — ست مراوح ARGB وسعة ٤٢٠'],
  cmpiec081002h00ymnwss7xit: [4, '5000D Airflow — راديتران ٣٦٠، وهو ما لا يقبله أي كيس أدنى'],
  cmpieb3ts000e00ymflyrzgd2: [4, 'O11 Dynamic EVO — غرفتان وسعة ٤٢٦'],
  cmpiebxdd002700ymksl2q2f0: [4, 'TUF GT502 — غرفتان وسعة ٤٠٠'],
  cmpiec0rx002j00ymwwtto4ip: [4, 'Tower 300 — راديتر ٤٢٠ وتركيبٌ رأسي/أفقي في مقاس Micro-ATX'],
  cmpiebzwo002g00ym85eswm2w: [4, 'H9 Flow — غرفتان وأربع مراوح وسعة ٤٣٥'],
  cmpieb3if000d00ymz13tdkyt: [4, 'H6 Flow RGB White — غرفتان؛ سعته ٣٦٥ تمنع رفعه أعلى'],
  cmpieb303000b00ymn7wfi2t2: [4, 'NR200P — أرقى Mini-ITX عملياً: عرض عمودي ولوحان جانبيان'],
  cmsqbhrd50002s4ym4win3hs1: [4, 'A4-H2O X5 — ألمنيوم ورايزر PCIe 5.0؛ سعة ٣٢٢ وراديتر ٢٤٠ تمنعان الخامس'],

  // ═════ ٥ · قمّة: Full Tower أو مواد/شاشة مميّزة
  cmpiec1hm002m00ympx1co750: [5, 'Morpheus — Full Tower بسعة ٤٨٠ وراديتر ٤٢٠ وهيكل مفكّك'],
  cmpieb4ax000g00ymgj1zamtu: [5, 'North XL — Full Tower بواجهة خشب حقيقي وتهوية ممتازة'],
  cmpiebzcq002e00ymgbk1ipig: [5, 'Shadow Base 800 FX — Full Tower بأربع Light Wings وعزلٍ صوتي'],
  cmpiec10g002k00ym6tok8itf: [5, 'HYTE Y60 — كيس عرضٍ بثلاث زجاجات ورايزر مرفق وراديتر ٣٦٠'],
  cmpieb42o000f00yms1zh1sho: [5, 'HYTE Y70 Touch — شاشة لمس ٤K مقاس ١٤٫١ بوصة مدمجة'],
};

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cases = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { id: true, brand: true, name: true, price: true, performanceTier: true },
    orderBy: { price: 'asc' },
  });

  const missing = cases.filter((c) => !(c.id in TIERS));
  const extra = Object.keys(TIERS).filter((id) => !cases.some((c) => c.id === id));
  if (missing.length) {
    console.log('⛔ كيسات بلا تصنيف في هذا الملف — أُضيفت بعد كتابته:');
    for (const c of missing) console.log(`   ${c.id}  ${c.brand} ${c.name}`);
  }
  if (extra.length) console.log(`⛔ معرّفات لا تقابل كيساً: ${extra.join('، ')}`);
  if (missing.length || extra.length) { await prisma.$disconnect(); process.exit(1); }

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const changes: any[] = [];

  for (const c of cases) {
    const [tier, why] = TIERS[c.id];
    dist[tier]++;
    const mark = c.performanceTier === tier ? ' ' : c.performanceTier == null ? '+' : '~';
    console.log(`${mark} T${c.performanceTier ?? '·'}→T${tier}  ${String(c.price).padStart(8)}﷼  ${(c.brand + ' ' + c.name).padEnd(38).slice(0, 38)}  ${why}`);
    if (c.performanceTier !== tier) changes.push({ id: c.id, name: `${c.brand} ${c.name}`, from: c.performanceTier, to: tier });
  }

  console.log(`\nالتوزيع: ${[1, 2, 3, 4, 5].map((t) => `T${t}:${dist[t]}`).join('  ')}   (المجموع ${cases.length})`);
  console.log(`تغييرات: ${changes.length}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/case-tiers-before-${stamp}.json`, JSON.stringify(cases, null, 2));

  for (const ch of changes) {
    await prisma.component.update({ where: { id: ch.id }, data: { performanceTier: ch.to } });
  }
  console.log(`✔ حُدّث ${changes.length} كيساً · النسخة الاحتياطية في backups/case-tiers-before-${stamp}.json`);
  await prisma.$disconnect();
}

main();
