/**
 * ============ إصلاحان في بيانات اللوحات ============
 *
 * **١) وحدتان في عمودٍ واحد.** ٤٣ لوحة تقول «MHz» و٨ تقول «MT/s»، فيقرأ
 * الزائر في صفٍّ واحد: «9000 MT/s» و«7600+ MHz» و«8000+ MHz».
 *
 * وسببه أنّي نسختُ صياغة كل مصنّع كما هي عند الملء. والصحيح تقنياً
 * **MT/s**: رام DDR5-6000 ترددها الفعلي ٣٠٠٠ ميجاهرتز، والستّة آلاف
 * نقلةٌ في الثانية لا هرتز. والاصطلاح نفسه في DDR4 (3200 MT/s).
 * وهو ما تستعمله فئة الرام عندنا أصلاً (`UNITS.speed = 'MT/s'`).
 *
 * **٢) استهلاك اللوحات أرقامٌ مُختلَقة.** داخل شيبست B650 وحده: 0 و10
 * و15 و30 و35 و40 واط — أربعة أضعاف بلا سبب. و**١٤ لوحة من ٥١ بصفر**.
 * والنتيجة ظاهرة في صفحة المقارنة: X870E Carbon عند ٢٥ واط يفوز على
 * B650 TOMAHAWK عند ٤٠ — وهو **مقلوبٌ فيزيائياً**، فـX870E فيه شريحتا
 * شيبست وB650 فيه واحدة.
 *
 * ⚠️ وليست عرضاً فقط: تُجمع في تقدير الطاقة في `PCBuilderClient` و
 * `AutoBuildsSection` و`lib/build-compare`. فلوحتان من الشيبست نفسه،
 * إحداهما ٠ والأخرى ٤٠، تُزحزحان شريط «سعة المزوّد» أربعين واطاً —
 * والزائر يشتري مزوّداً على هذا الرقم.
 *
 * ولا ينشر مصنّعو اللوحات استهلاكاً، فلا مصدر يُنسخ منه. فالبديل قاعدةٌ
 * بالشيبست: متسقة، وقريبة من الواقع المقيس، ومفهومة لمن يراجعها.
 *
 *   npx tsx scripts/fix-mb-units-power.ts            # عرض
 *   npx tsx scripts/fix-mb-units-power.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

/** استهلاك تقريبي بالواط حسب فئة الشيبست */
const CHIPSET_WATTS: Record<string, number> = {
  // مدخلية — شريحة واحدة صغيرة
  A620: 7, H610: 7, H810: 7,
  // متوسطة
  B550: 10, B650: 10, B650E: 10, B760: 10, B850: 10, B860: 10,
  // عليا
  Z790: 15, Z890: 15, X870: 15,
  // شريحتا شيبست
  X670E: 20, X870E: 20,
};

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const mbs = await prisma.component.findMany({
    where: { category: { name: 'Motherboard' } },
    select: { id: true, brand: true, name: true, specs: true, tdpWattage: true },
    orderBy: { name: 'asc' },
  });

  const updates: { id: string; specs: any; tdpWattage: number }[] = [];
  const unknownChipset: string[] = [];
  let unitFixed = 0, wattFixed = 0;

  for (const m of mbs) {
    const specs = { ...parse(m.specs) };
    const notes: string[] = [];

    // ── الوحدة
    const speed = String(specs.memorySpeed ?? '');
    if (speed.includes('MHz')) {
      specs.memorySpeed = speed.replace(/MHz/g, 'MT/s');
      unitFixed++;
      notes.push(`وحدة: ${speed} → ${specs.memorySpeed}`);
    }

    // ── الاستهلاك
    const chip = String(specs.chipset ?? '').trim();
    const watts = CHIPSET_WATTS[chip];
    if (watts == null) { unknownChipset.push(`${chip} (${m.brand} ${m.name})`); continue; }
    let tdp = m.tdpWattage;
    if (tdp !== watts) { tdp = watts; wattFixed++; notes.push(`واط: ${m.tdpWattage} → ${watts}  [${chip}]`); }

    if (notes.length) {
      console.log(`${(m.brand + ' ' + m.name).padEnd(38).slice(0, 38)}  ${notes.join('  ·  ')}`);
      updates.push({ id: m.id, specs, tdpWattage: tdp });
    }
  }

  console.log(`\nوحدات صُحّحت: ${unitFixed} · قيم واط صُحّحت: ${wattFixed} · لوحات تُحدَّث: ${updates.length}`);
  if (unknownChipset.length) {
    console.log(`⛔ شيبست بلا قاعدة: ${[...new Set(unknownChipset)].join('، ')}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/mb-units-power-before-${stamp}.json`, JSON.stringify(mbs, null, 2));
  for (const u of updates) {
    await prisma.component.update({
      where: { id: u.id },
      data: { specs: u.specs, tdpWattage: u.tdpWattage },
    });
  }
  console.log(`✔ حُدّثت ${updates.length} لوحة`);
  await prisma.$disconnect();
}

main();
