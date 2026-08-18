/* ============ هل يأتي المعالج بمبرّد؟ ============
 *
 * سؤالٌ يقرّر شيئاً واحداً: هل يحتاج المستخدم شراء مبرّد؟ وبدونه يكذب
 * المُجمّع في الاتجاهين — يقترح مبرّداً على رايزن ٦٥ واط يأتي بواحد،
 * أو يسكت عن 9800X3D الذي لا يأتي بشيء فيشتري المستخدم تجميعةً لا تُقلع.
 *
 * والقاعدتان العامّتان صحيحتان: لاحقة K عند إنتل ولاحقة X عند AMD = بلا
 * مبرّد. لكن **أسماء المبرّدات المرفقة** لا تُكتب من الذاكرة، وقد أثبت
 * التحقّق ذلك مرّتين:
 *
 *   ⚠️ Core Ultra 5 225F يأتي بـ**Laminar RM2** لا RM1. القاعدة العامّة
 *      («غير K ⇒ RM1») كانت ستكتب الخطأ: RM1 لأجيال ١٢–١٤، وسلسلة
 *      Core Ultra الثانية لها RM2.
 *
 *   ⚠️ ومنذ **١ أغسطس ٢٠٢٥** أوقفت AMD مبرّد Wraith Prism **بلا بديل**،
 *      فصارت Ryzen 7 7700 و Ryzen 9 7900 تُباع بلا مبرّد إطلاقاً. وأوقفت
 *      Wraith Spire فحلّ Stealth محلّه (‏8700G مثلاً). مصدر: Tom's Hardware
 *      و VideoCardz و PCWorld، أغسطس ٢٠٢٥.
 *
 *      وقد يجد مشترٍ علبةً قديمة فيها Prism. سجّلنا «لا يوجد» عمداً: أن
 *      نقول «اشترِ مبرّداً» لمن يملك واحداً خطأٌ يكلّفه مالاً، وأن نقول
 *      «لا تحتاج» لمن لا يملكه خطأٌ يمنع الجهاز من الإقلاع. فالميل إلى
 *      الأسلم لا إلى الأرجح.
 *
 * القيمة تُخزَّن إنجليزيةً و`VALUE_LABELS` يترجم «None» إلى «لا يوجد» —
 * كبقيّة المواصفات، فالترجمة طبقةُ عرضٍ لا بيانات.
 *
 *   npx tsx scripts/fill-cpu-cooler.ts          # عرض فقط
 *   npx tsx scripts/fill-cpu-cooler.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const NONE = 'None';
const STEALTH = 'Wraith Stealth';
const RM1 = 'Laminar RM1';
const RM2 = 'Laminar RM2';

/** القيم المقبولة — أي قيمةٍ خارجها غلطةٌ مطبعيّة لا مبرّدٌ جديد */
const ALLOWED = new Set([NONE, STEALTH, RM1, RM2]);

const MAP: Record<string, string> = {
  // ── AMD AM4 ──
  cmrzaf9x6000bc0ym2c58uc88: STEALTH, // Ryzen 5 5500
  cmrzaf9j20009c0ymwg08kmel: STEALTH, // Ryzen 5 5600

  // ── AMD AM5 · تأتي بمبرّد ──
  cmrd7ir6a000004l6ytznx4nk: STEALTH, // Ryzen 5 7500F
  cmsqb1spd0006gwymueg9bxbp: STEALTH, // Ryzen 5 7600
  cmpiecxkd006200ymru4pgipc: STEALTH, // Ryzen 5 8500G
  cmrd7irm5000304l6dus1sr7g: STEALTH, // Ryzen 5 8600G
  cmrd7irbq000104l6eca3r96r: STEALTH, // Ryzen 5 9600
  cmpiecx8z006100ymz8ys8m2h: STEALTH, // Ryzen 7 8700G — كان Spire حتى أغسطس ٢٠٢٥

  // ── AMD AM5 · بلا مبرّد ──
  cmplabz470000mwym2x95ji3y: NONE, // Ryzen 5 7600X
  cmpi15ht9000104l7brbcd2yy: NONE, // Ryzen 5 9600X
  cmrd7irgy000204l6f0eofmx8: NONE, // Ryzen 7 7700  ← كان Wraith Prism
  cmpiebf6p001m00ym46ilva94: NONE, // Ryzen 7 7700X
  cmpiebdjz001g00ymhtv4lhxg: NONE, // Ryzen 7 7800X3D
  cmpiebg0y001q00ym8gzdls7k: NONE, // Ryzen 7 9700X
  cmpfzir160007x4ym7w2xdh50: NONE, // Ryzen 7 9800X3D
  cmsqb1se30004gwym0p4tfevk: NONE, // Ryzen 7 9850X3D
  cmrd7isc9000804l6rhu42saz: NONE, // Ryzen 9 7900   ← كان Wraith Prism
  cmpiebew4001l00ymn05s24wg: NONE, // Ryzen 9 7900X
  cmpiebfmn001o00ymzr1b1x1x: NONE, // Ryzen 9 7950X3D
  cmpiecwxm006000ymohvbpg83: NONE, // Ryzen 9 9900X
  cmsqb1s2l0002gwym8ntgkn52: NONE, // Ryzen 9 9900X3D
  cmpiebfu0001p00ymfr3v5m1x: NONE, // Ryzen 9 9950X
  cmsqb1rq30000gwym28jxq94q: NONE, // Ryzen 9 9950X3D

  // ── Intel LGA1851 (Core Ultra سلسلة ٢) ──
  cmsqb1sxw0008gwym42i0r04s: RM2,  // Core Ultra 5 225F — RM2 لا RM1
  cmpiecyon006600ymq5jegejh: NONE, // Core Ultra 5 245K
  cmpiebgoe001t00ymddi46682: NONE, // Core Ultra 7 265K
  cmpiebghk001s00ym8n681pgr: NONE, // Core Ultra 9 285K

  // ── Intel LGA1700 · غير K ⇒ Laminar RM1 ──
  cmrd7irwl000504l6xm185w06: RM1, // i3-13100F
  cmpiecxvr006300ymacbg7gwz: RM1, // i3-14100F
  cmrd7is1t000604l65w1djfbi: RM1, // i5-12400F
  cmrd7irrd000404l605fdvxno: RM1, // i5-13400F
  cmpiebdsb001h00ymvfl5kfn2: RM1, // i5-14400F
  cmpiecy75006400ym2eec20m9: RM1, // i5-14500
  cmpiecyih006500ymvwt22xem: RM1, // i7-14700

  // ── Intel LGA1700 · K/KF ⇒ بلا مبرّد ──
  cmpiebgy2001u00yme4vwi21v: NONE, // i5-13600KF
  cmpiebenj001k00ymrnmmyvb8: NONE, // i5-14600K
  cmrd7ishg000904l6rvxxopne: NONE, // i5-14600KF
  cmrd7is70000704l6dz01y37b: NONE, // i7-12700K
  cmpiecwp3005z00ymz8wib19b: NONE, // i7-13700K
  cmpfzir170008x4ymbxuyvrxc: NONE, // i7-14700K
  cmpieczp6006a00ymrajpwoyc: NONE, // i9-13900KS
  cmpiebe3m001i00ymrmrw2zep: NONE, // i9-14900K
};

const apply = process.argv.includes('--apply');

async function main() {
  const bad = Object.entries(MAP).filter(([, v]) => !ALLOWED.has(v));
  if (bad.length) {
    console.error('⛔ قيم خارج المسموح: ' + bad.map(([k, v]) => `${k}=${v}`).join(', '));
    process.exit(1);
  }

  const cpus = await prisma.component.findMany({
    where: { category: { name: 'CPU' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: [{ brand: 'asc' }, { name: 'asc' }],
  });

  /* التغطية شرطٌ لا تقرير: `includedCooler` حقلُ مقارنةٍ إلزاميّ، فمعالجٌ
     بلا قيمةٍ يظهر «غير معلن» — وهو هنا كذبٌ لأننا نعرف الجواب لكلٍّ منها. */
  const uncovered = cpus.filter((c) => !(c.id in MAP));
  const ghosts = Object.keys(MAP).filter((id) => !cpus.some((c) => c.id === id));
  if (uncovered.length || ghosts.length) {
    if (uncovered.length) {
      console.error(`⛔ ${uncovered.length} معالجاً بلا قيمة:`);
      for (const c of uncovered) console.error(`   ${c.id}  ${c.brand} ${c.name}`);
    }
    if (ghosts.length) console.error(`⛔ ${ghosts.length} معرّف لا يقابله معالج: ${ghosts.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n${apply ? '✍️  كتابة' : '👁️  عرض فقط'} — ${cpus.length} معالجاً\n`);

  let withCooler = 0, without = 0, done = 0;
  for (const c of cpus) {
    const sp: any = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
    const val = MAP[c.id];
    val === NONE ? without++ : withCooler++;

    if (String(sp.includedCooler ?? '') === val) {
      console.log(`  ⏭️  ${c.name}`);
      continue;
    }
    const mark = val === NONE ? '  ' : '❄️';
    console.log(`  ${mark} ${(c.brand + ' ' + c.name).padEnd(30)} ${val}`);
    if (apply) {
      await prisma.component.update({ where: { id: c.id }, data: { specs: { ...sp, includedCooler: val } } });
    }
    done++;
  }

  console.log(`\n${'═'.repeat(46)}`);
  console.log(`يأتي بمبرّد: ${withCooler}   ·   بلا مبرّد: ${without}`);
  console.log(`${apply ? 'كُتبت' : 'ستُكتب'}: ${done}`);
  if (!apply) console.log('\nأضف --apply للكتابة.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
