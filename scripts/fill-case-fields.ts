/**
 * ============ الحقول الثلاثة التي يحتاجها فحص التوافق ============
 *
 * الكيس كان يحمل ٢٢ مفتاحاً أغلبها زينة، و**صفراً** من المفاتيح التي
 * يحتاجها فحص المبرّد. الغنى في المكان الخطأ. بعد التنظيف بقي أن يُملأ
 * ما يقرّر التركيب فعلاً:
 *
 *   maxCoolerHeight   ٠ من ٢٧   ← غائبٌ كلّياً، وهو ما يمنع فئة المبرّدات
 *   radiatorSupport   ٨ من ٢٧
 *   psuFormFactor     ٤ من ٢٧   ← ومعناه اليوم «اقبل كل شيء»
 *
 * المصدر صفحات المصنّعين وقواعد التوافق (Noctua NCC) — **لا صفحات
 * المتاجر**: وصف كازاسوق للوحة B850 قال «Intel الجيل الرابع، LGA 1150،
 * DDR3» عن لوحة AMD AM5.
 *
 * ============ لماذا لا يكسر هذا شيئاً ============
 *
 * حقلٌ فارغ في `psuFormFactor` يعني «اقبل كل شيء»، فملؤه يوقظ حارساً
 * نائماً. ولذلك سبقته الخطوة الأولى: `psuFitsCase` صار يقارن **رتباً**
 * (ATX ⊇ SFX-L ⊇ SFX) لا عضويةً حرفية. فبرجٌ سُجّل عليه «ATX» يظلّ يقبل
 * مزوّد SFX — وهو يقبله فعلاً بالحامل المرفق.
 *
 * وبلا ذلك الترتيب كان هذا الملء وحده سيولّد **١١٥ منعاً خاطئاً من ٨٦٤**.
 * يؤكّده `scripts/fit-diff.ts` قبل التطبيق وبعده.
 *
 * ⚠️ وقيمتان تستحقّان الانتباه لأنهما تبدوان خطأً وليستا كذلك:
 *   · Corsair 2000D Airflow = **٩٠ مم** — كيس SFF مصمَّم للتبريد المائي.
 *   · Lian Li A4-H2O X5 = **٥٥ مم** — هيكل مائيّ بحت لا يقبل برجاً هوائياً.
 *
 * ⚠️ وMorpheus مُدرجٌ بـ١٩٥ مم وهي قيمة **الغرفة الواحدة**؛ ينزل إلى ١٣٢
 * في وضع الغرفتين. سُجّلت الأعلى لأنها التهيئة الافتراضية للوحات ATX،
 * والقيد مذكورٌ هنا لمن يراجع.
 *
 *   npx tsx scripts/fill-case-fields.ts            # عرض
 *   npx tsx scripts/fill-case-fields.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** المعرّف → [ارتفاع المبرّد مم، دعم الراديتر، مقاس المزوّد] */
const DATA: Record<string, [string, string, string]> = {
  cmsq0k1u2000264ym2sby76ai: ['174', '360mm', 'ATX'],            // DeepCool CH260
  cmpiebxxk002900ym6hzx5w2l: ['165', '360mm', 'ATX'],            // CM TD500 Mesh V2
  cmsq0k1kq000064ym7ldos7uf: ['160', '240mm', 'ATX'],            // MSI MAG Forge M100A
  cmpiebxm6002800ymk4bd3ep4: ['175', '360mm', 'ATX'],            // DeepCool CH560 Digital
  cmpieb39w000c00ym9n758myw: ['170', '360mm', 'ATX'],            // Corsair 4000D Airflow
  cmpiebyel002b00ymx7o5s5g0: ['168', '360mm', 'ATX'],            // Montech Sky Two GX
  cmsqbhr4c0000s4ymld2p1ytn: ['90',  '360mm', 'SFX / SFX-L'],    // Corsair 2000D Mini-ITX
  cmpieb2em000900ymqr0r68gv: ['165', '280mm', 'ATX / SFX'],      // NZXT H210
  cmpfzir17000gx4ymtjjn4ag1: ['180', '360mm', 'ATX'],            // Lian Li LANCOOL 216
  cmpiec0gj002i00ymud3xdj2y: ['185', '420mm', 'ATX'],            // Fractal Meshify 2
  cmpiebx13002600ymdhs2okf9: ['180', '360mm', 'ATX'],            // Phanteks NV5
  cmpieby64002a00ym3f3vl6no: ['185', '420mm', 'ATX'],            // Lian Li Lancool III RGB
  cmpiebypz002c00ymfesox3jf: ['184', '360mm', 'ATX'],            // Phanteks XT View
  cmpieb4ma000h00ym6qm9hb5l: ['175', '360mm', 'ATX'],            // Montech King 95 Pro
  cmpiec081002h00ymnwss7xit: ['170', '2x 360mm', 'ATX'],         // Corsair 5000D Airflow
  cmpieb3ts000e00ymflyrzgd2: ['167', '420mm', 'ATX'],            // Lian Li O11 Dynamic EVO
  cmpiebxdd002700ymksl2q2f0: ['163', '360mm', 'ATX'],            // ASUS TUF GT502
  cmpiec0rx002j00ymwwtto4ip: ['210', '420mm', 'ATX'],            // Thermaltake Tower 300
  cmpiebzwo002g00ym85eswm2w: ['165', '420mm', 'ATX'],            // NZXT H9 Flow (نسخة 2023)
  cmpieb3if000d00ymz13tdkyt: ['163', '360mm', 'ATX'],            // NZXT H6 Flow RGB White
  cmpiec1hm002m00ympx1co750: ['195', '420mm', 'ATX'],            // DeepCool Morpheus
  cmpieb4ax000g00ymgj1zamtu: ['185', '420mm', 'ATX'],            // Fractal North XL
  cmpieb303000b00ymn7wfi2t2: ['155', '280mm', 'SFX / SFX-L'],    // CM NR200P
  cmpiebzcq002e00ymgbk1ipig: ['180', '420mm', 'ATX'],            // be quiet! Shadow Base 800 FX
  cmpiec10g002k00ym6tok8itf: ['160', '360mm', 'ATX'],            // HYTE Y60
  cmsqbhrd50002s4ym4win3hs1: ['55',  '240mm', 'SFX / SFX-L'],    // Lian Li A4-H2O X5
  cmpieb42o000f00yms1zh1sho: ['180', '360mm', 'ATX'],            // HYTE Y70 Touch
};

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cases = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { id: true, brand: true, name: true, specs: true },
    orderBy: { price: 'asc' },
  });

  const missing = cases.filter((c) => !(c.id in DATA));
  const extra = Object.keys(DATA).filter((id) => !cases.some((c) => c.id === id));
  if (missing.length) {
    console.log('⛔ كيسات بلا بيانات في هذا الملف — أُضيفت بعد كتابته:');
    for (const c of missing) console.log(`   ${c.id}  ${c.brand} ${c.name}`);
  }
  if (extra.length) console.log(`⛔ معرّفات لا تقابل كيساً: ${extra.join('، ')}`);
  if (missing.length || extra.length) { await prisma.$disconnect(); process.exit(1); }

  const updates: { id: string; specs: any }[] = [];
  let added = 0;
  let conflicts = 0;

  for (const c of cases) {
    const [height, rad, psu] = DATA[c.id];
    const s = { ...parse(c.specs) };
    const notes: string[] = [];

    /* الموجود لا يُداس: حقلٌ سُجّل من قبل قد يكون أدقّ من مصدرٍ عامّ.
       فإن اختلف، يُطبع ولا يُكتب — ويُراجَع بالعين. */
    const set = (key: string, val: string) => {
      const cur = s[key];
      if (cur == null || String(cur).trim() === '') { s[key] = val; added++; notes.push(`+ ${key}=${val}`); return; }
      if (String(cur).trim() !== val) { conflicts++; notes.push(`≠ ${key}: مسجّل "${cur}" · المصدر "${val}" — أُبقي المسجّل`); }
    };

    set('maxCoolerHeight', height);
    set('radiatorSupport', rad);
    set('psuFormFactor', psu);

    if (notes.length) {
      console.log(`${(c.brand + ' ' + c.name).padEnd(40).slice(0, 40)}  ${notes.join('  ·  ')}`);
      updates.push({ id: c.id, specs: s });
    }
  }

  console.log(`\nقيم أُضيفت: ${added} · اختلافات أُبقي فيها المسجَّل: ${conflicts} · قطع تُحدَّث: ${updates.length}`);

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/case-fields-before-${stamp}.json`, JSON.stringify(cases, null, 2));

  for (const u of updates) {
    await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  }
  console.log(`✔ حُدّث ${updates.length} كيساً · النسخة الاحتياطية في backups/case-fields-before-${stamp}.json`);
  console.log('⚠️ شغّل الآن: npx tsx scripts/fit-diff.ts  — يجب أن يبقى صفر انكسار.');
  await prisma.$disconnect();
}

main();
