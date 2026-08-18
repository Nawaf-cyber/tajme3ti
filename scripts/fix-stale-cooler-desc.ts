/* ============ وصفٌ يناقض بياناته ============
 *
 * صفحة Ryzen 9 7900 كانت تقول شيئين متضادّين في شاشةٍ واحدة:
 *
 *   جدول المواصفات →  «مبرّد مرفق: لا يوجد»
 *   نظرة عامة      →  «Cooler Included: يأتي بمبرّد كافٍ لتشغيله»
 *
 * والزائر يصدّق الجملة لا الجدول — الجملة تشرح والجدول يُسرد. فالبيانات
 * الصحيحة لا تنفع إن ناقضها نصٌّ بجانبها.
 *
 * والسبب بنيويّ: `description` نصٌّ حرّ لا يعرف المخطّط ولا يقرؤه فحص،
 * فبقي على حاله بعد أن أوقفت AMD مبرّد Wraith Prism في أغسطس ٢٠٢٥.
 *
 * ⚠️ ومسحُ ٤٢ وصفاً كشف أن الفخّ أوسع: جملة «النسخة بدون X غالبًا تأتي مع
 * مبرد مرفق» مكرّرةٌ في وصفَي 7700 و7900، وهي قاعدةٌ عامّة صارت خاطئة
 * لهذين تحديداً — أي أن الوصف يعلّم القارئ قاعدةً تخالف واقع القطعة التي
 * يقرأ عنها.
 *
 * (والمسح أنذر بخمسة، وثلاثةٌ منها كاذبة: «**بلا** مبرّد مرفق» طابقت نمط
 *  البحث. فالتصحيح على اثنين فقط.)
 *
 *   npx tsx scripts/fix-stale-cooler-desc.ts          # عرض
 *   npx tsx scripts/fix-stale-cooler-desc.ts --apply  # كتابة
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/** بديلٌ لكل سطرٍ قديم — المطابقة على جزءٍ مميّز لا على السطر كاملاً (فيه \r) */
type Fix = { find: string; replace: string };

const NOTE_X: Fix = {
  find: 'كما أن النسخة بدون X غالبًا تأتي مع مبرد مرفق، مما قد يؤثر على سعرها.',
  replace: 'وكانت النسخة بدون X تأتي بمبرّد مرفق، لكن AMD أوقفت ذلك في أغسطس ٢٠٢٥.',
};

const FIXES: Record<string, Fix[]> = {
  // Ryzen 7 7700
  cmrd7irgy000204l6f0eofmx8: [
    NOTE_X,
    {
      find: '[green]Cooler Included:[/green] يأتي مع مبرّد Wraith Prism كافٍ لتشغيله دون شراء مبرّد إضافي.',
      replace:
        '[yellow]لا يأتي بمبرّد:[/yellow] كان يُباع مع Wraith Prism حتى أوقفته AMD في أغسطس ٢٠٢٥ بلا بديل. احسب ثمن مبرّدٍ ضمن الميزانية.',
    },
  ],
  // Ryzen 9 7900
  cmrd7isc9000804l6rhu42saz: [
    NOTE_X,
    {
      find: '[green]Cooler Included:[/green] يأتي بمبرّد كافٍ لتشغيله.',
      replace:
        '[yellow]لا يأتي بمبرّد:[/yellow] كان يُباع مع Wraith Prism حتى أوقفته AMD في أغسطس ٢٠٢٥ بلا بديل. احسب ثمن مبرّدٍ ضمن الميزانية.',
    },
  ],
};

const apply = process.argv.includes('--apply');

async function main() {
  let done = 0;

  for (const [id, fixes] of Object.entries(FIXES)) {
    const c = await prisma.component.findUnique({ where: { id }, select: { name: true, description: true } });
    if (!c) { console.error(`⛔ لا قطعة بالمعرّف ${id}`); process.exit(1); }

    let desc = c.description || '';

    /* كل بديلٍ يجب أن يجد موضعه. النصّ الغائب يعني أن الوصف تغيّر منذ
       قراءتنا — فالتوقّف أسلم من كتابةٍ عمياء. */
    const missing = fixes.filter((f) => !desc.includes(f.find));
    if (missing.length) {
      console.error(`⛔ ${c.name}: ${missing.length} نصّاً لم يُوجد — الوصف تغيّر. لم يُكتب شيء.`);
      for (const m of missing) console.error(`   «${m.find.slice(0, 60)}…»`);
      process.exit(1);
    }

    console.log(`\n████ ${c.name}`);
    for (const f of fixes) {
      desc = desc.replace(f.find, f.replace);
      console.log(`  −  ${f.find.slice(0, 78)}`);
      console.log(`  +  ${f.replace.slice(0, 78)}`);
    }

    if (apply) await prisma.component.update({ where: { id }, data: { description: desc } });
    done++;
  }

  console.log(`\n${'═'.repeat(46)}\n${apply ? 'كُتبت' : 'ستُكتب'}: ${done}`);
  if (!apply) console.log('\nأضف --apply للكتابة.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
