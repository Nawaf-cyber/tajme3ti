/* ============ ملء ارتفاع شرائح الرام ============
 *
 * الارتفاع **ثابتُ سلسلةٍ لا ثابتُ قطعة**: السعة والسرعة لا تغيّران المشتّت.
 * فالـ٢٨ قطعة تنهار إلى ٢٢ سلسلة، وكل قيمةٍ هنا مأخوذةٌ من صفحة المصنّع
 * ومكتوبٌ بجانبها رابطُها — فبعد شهرٍ يُعرف من أين جاء الرقم بلا إعادة بحث.
 *
 * ⚠️ **فخُّ ترتيب الأبعاد.** المصنّعون يكتبون ثلاثة أرقامٍ بترتيبٍ مختلف،
 * وبعضهم يسمّي السُّمك «H»:
 *
 *     TeamGroup   46.1(H) × 144.2(L) × 7(W)     ← موسوم صراحةً
 *     Kingston    133.35 × 34.9 × 6.62          ← طول × ارتفاع × سُمك
 *     XPG         133.35 × 45.93 × 8.4          ← يسمّيه (L×W×H) والارتفاع هو الأوسط
 *
 * والقراءة الآلية التقطت السُّمك (8.4 و8.8) وسمّته ارتفاعاً **مرّتين**. ولو
 * مرّ ذلك لقال الفحص «كل رامة تدخل كل مبرّد» — حكمٌ يقول نعم دائماً، وهو
 * أسوأ من لا فحص. فحارس MIN/MAX أدناه يمسك هذا آلياً لا بالانتباه.
 *
 * وقيمتان صحّحهما التحقّق من المصدر: البحث قال LPX = 34، وجدول Corsair
 * الرسمي يقول 33.53.
 *
 *   npx tsx scripts/fill-ram-height.ts          # عرض فقط
 *   npx tsx scripts/fill-ram-height.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/* لا شريحةَ ارتفاعُها أقلّ من ٢٥ (أقصر PCB عاريةٍ ~٣١) ولا أطولُ من ٦٠
   (أعلى ما وجدنا: Dominator Titanium ‏٥٧). خارج هذا المدى = قرأنا السُّمك
   أو الطول بالخطأ. */
const MIN_MM = 25;
const MAX_MM = 60;

type Row = { id: string; name: string; mm: number; src: string };

const SRC = {
  corsair: 'help.corsair.com/hc/en-us/articles/34381966388881 (جدول أبعاد رسمي)',
  corsairTitanium: 'corsair.com/…/how-tall-is-dominator-titanium/',
  gskill: 'gskill.com/faq/1502180912/DRAM-Memory («How tall are the memory modules?»)',
  kingston: 'kingston.com — سطر Dimensions في صفحة السلسلة',
  team: 'teamgroupinc.com — صفحة المنتج، الأبعاد موسومة (H)',
  xpg: 'xpg.com/…?tab=spec — الارتفاع هو الرقم الأوسط لا المسمّى H',
  sp: 'silicon-power.com — تبويب Product Specifications',
};

const ROWS: Row[] = [
  // ── Corsair ──────────────────────────────────────────────────────────
  { id: 'cmpiedh03006b00ym57kak80u', name: 'Vengeance 16GB (2x8GB) 5200MHz',              mm: 35,    src: SRC.corsair },
  { id: 'cmpiebd2l001e00ym1y8bzzlv', name: 'Vengeance DDR5 32GB 6000MHz',                 mm: 35,    src: SRC.corsair },
  { id: 'cmsqkaln50002ugym1alavhrp', name: 'Vengeance RGB 32GB DDR5 6000MHz CL30 White',  mm: 44,    src: SRC.corsair },
  { id: 'cmpiecrbz005g00ym3k9f15y0', name: 'Vengeance RGB 64GB 6400MHz',                  mm: 44,    src: SRC.corsair },
  { id: 'cmr3al4ap000004jy5yd63rjq', name: 'Vengeance LPX 16GB DDR4 3200MHz',             mm: 33.53, src: SRC.corsair },
  { id: 'cmr3al4g4000104jy62ztrmu8', name: 'Vengeance LPX 32GB DDR4 3600MHz',             mm: 33.53, src: SRC.corsair },
  { id: 'cmpiecq26005b00ymniswty6k', name: 'Dominator Titanium 48GB 7200MHz',             mm: 57,    src: SRC.corsairTitanium },

  // ── G.Skill ──────────────────────────────────────────────────────────
  { id: 'cmr2mmrrq000wjgymi7pcp21t', name: 'Trident Z5 Neo 32GB',                         mm: 44,    src: SRC.gskill },
  { id: 'cmpiebcpt001d00ymnktdbbjv', name: 'Trident Z5 RGB 32GB 6400MHz',                 mm: 44,    src: SRC.gskill },
  { id: 'cmrdf1wv6000804l24p49dtq8', name: 'Trident Z5 RGB 64GB 6400MHz',                 mm: 44,    src: SRC.gskill },
  { id: 'cmsrkfbnr0000rcymchfklhr8', name: 'Flare X5 16GB DDR5 6000MHz CL30',             mm: 33,    src: SRC.gskill },
  { id: 'cmpiecrkg005h00ymkt3mt6pp', name: 'Flare X5 DDR5 32GB 6000MHz',                  mm: 33,    src: SRC.gskill },
  { id: 'cmrdf1w58000304l2htzcis0x', name: 'Ripjaws S5 32GB DDR5 6000MHz',                mm: 33,    src: SRC.gskill },
  { id: 'cmr3al4q8000304jymzjx9fs6', name: 'Ripjaws V 32GB DDR4 3600MHz',                 mm: 42,    src: SRC.gskill },

  // ── Kingston ─────────────────────────────────────────────────────────
  { id: 'cmpiebdbz001f00ymszifpqs9', name: 'Fury Beast DDR5 32GB 6000MHz',                mm: 34.9,  src: SRC.kingston },
  { id: 'cmrdf1w01000204l2a9et3mr3', name: 'Fury Beast RGB 16GB DDR5 5600MHz',            mm: 42.23, src: SRC.kingston },
  { id: 'cmr3al4l6000204jypleq49z3', name: 'Fury Beast 16GB DDR4 3200MHz',                mm: 34.1,  src: SRC.kingston },
  /* الصفحة تذكر مقاسين: UDIMM ‏44 و CUDIMM ‏45. قطعتُنا كِتُّ UDIMM عاديّ. */
  { id: 'cmpiecr35005f00ymf6w8tqih', name: 'Fury Renegade 48GB 7200MHz',                  mm: 44,    src: SRC.kingston + ' (UDIMM لا CUDIMM)' },

  // ── TeamGroup ────────────────────────────────────────────────────────
  { id: 'cmpiecpi9005900ymuuylqjby', name: 'T-Force Delta RGB 32GB 6400MHz (DDR5)',       mm: 46.1,  src: SRC.team },
  { id: 'cmsqkaldp0000ugym0dga7spf', name: 'T-Force Delta RGB 32GB DDR5 6000MHz White',   mm: 46.1,  src: SRC.team },
  { id: 'cmsq1r5cf0006toymvvnlag08', name: 'T-Force Delta RGB 16GB DDR4 3600MHz',         mm: 49,    src: SRC.team },
  { id: 'cmpiecrvk005i00ym5hjcu7d7', name: 'T-Create Expert 64GB 6000MHz',                mm: 32,    src: SRC.team },
  { id: 'cmrdf1waf000404l2fwskdvlc', name: 'T-Force Vulcan 32GB DDR5 6000MHz',            mm: 32.7,  src: SRC.team },
  { id: 'cmpiedhk4006d00ymjqr6stcy', name: 'Elite 16GB (2x8GB) 4800MHz',                  mm: 32,    src: SRC.team },

  // ── ADATA / XPG ──────────────────────────────────────────────────────
  { id: 'cmpiecqao005c00ym91dkcumi', name: 'Lancer Blade 32GB 6000MHz',                   mm: 33.8,  src: SRC.xpg },
  { id: 'cmsq1r5jy0008toym9jlg5lv8', name: 'Spectrix D60G 32GB DDR4 3600MHz',             mm: 45.93, src: SRC.xpg },

  // ── Silicon Power ────────────────────────────────────────────────────
  { id: 'cmpiecqry005e00ymvr32waij', name: 'Zenith DDR5 32GB 6000MHz',                    mm: 38.5,  src: SRC.sp },

  /* ❌ Crucial Pro DDR5 32GB (cmpiecptm005a00ym19nh2ieb) — غائبةٌ عمداً.
     crucial.com و eu.crucial.com يردّان «Request Rejected»، ولا رقم في
     صفحاتهم المفهرسة: يقولون «مشتّت منخفض» بلا مقاس. فهي **غير منشورة**
     لا محجوبةً عنّا. تبقى فارغة وتظهر «غير معلن» — قيمةٌ واحدة مجهولة
     أصدق من ٢٨ إحداها مخترعة. */
];

const apply = process.argv.includes('--apply');

async function main() {
  /* الحارس قبل أي اتصال: خطأ الترتيب يُمسك هنا لا بعد الكتابة */
  const bad = ROWS.filter((r) => !(r.mm >= MIN_MM && r.mm <= MAX_MM));
  if (bad.length) {
    console.error(`⛔ ${bad.length} قيمة خارج المدى ${MIN_MM}–${MAX_MM} مم — غالباً سُمكٌ أو طولٌ قُرئ ارتفاعاً:`);
    for (const b of bad) console.error(`   ${b.name}: ${b.mm}`);
    process.exit(1);
  }

  const dup = ROWS.map((r) => r.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) { console.error('⛔ معرّفات مكرّرة: ' + dup.join(', ')); process.exit(1); }

  const rams = await prisma.component.findMany({
    where: { category: { name: 'RAM' } },
    select: { id: true, name: true, specs: true },
  });
  const byId = new Map(rams.map((r) => [r.id, r]));

  /* معرّفٌ لا وجود له = قائمةٌ كُتبت من الذاكرة. أوقف قبل أن تكتب. */
  const ghosts = ROWS.filter((r) => !byId.has(r.id));
  if (ghosts.length) {
    console.error(`⛔ ${ghosts.length} معرّف لا يقابله شيء في الكتالوج:`);
    for (const g of ghosts) console.error(`   ${g.id}  ${g.name}`);
    process.exit(1);
  }

  console.log(`\n${apply ? '✍️  كتابة' : '👁️  عرض فقط'} — ${ROWS.length} من ${rams.length} رامة\n`);

  let done = 0;
  for (const r of ROWS) {
    const comp = byId.get(r.id)!;
    const sp: any = typeof comp.specs === 'string' ? JSON.parse(comp.specs) : comp.specs || {};
    const before = sp.heightMm;
    const val = String(r.mm);

    if (String(before ?? '') === val) {
      console.log(`  ⏭️  ${comp.name}  (${val} مم — موجودة)`);
      continue;
    }

    console.log(`  ${before ? '🔄' : '➕'} ${comp.name.padEnd(52)} ${String(val).padStart(6)} مم`);
    if (apply) {
      await prisma.component.update({ where: { id: r.id }, data: { specs: { ...sp, heightMm: val } } });
    }
    done++;
  }

  const missing = rams.filter((r) => !ROWS.some((x) => x.id === r.id));
  console.log(`\n${'═'.repeat(46)}`);
  console.log(`${apply ? 'كُتبت' : 'ستُكتب'}: ${done}`);
  if (missing.length) {
    console.log(`بلا ارتفاع (غير منشور عند المصنّع): ${missing.length}`);
    for (const m of missing) console.log(`   • ${m.name}`);
  }
  if (!apply) console.log('\nأضف --apply للكتابة.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
