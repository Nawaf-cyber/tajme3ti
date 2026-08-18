/* ============ فحص قرارات الاستيراد ============
 *
 * يشغّل `lib/import-specs.ts` على قطعٍ حقيقيّة من الكتالوج ويطبع الحكم.
 * **يقرأ ولا يكتب** — لا استدعاء update/create فيه إطلاقاً.
 *
 * وُجد لأن مسار الاستيراد خلف تسجيل الدخول ويكتب في الإنتاج، فتجربته
 * الحقيقية تعني تلويث الكتالوج. فالمنطق نفسه يُشغَّل هنا على مدخلاتٍ
 * مصنوعة، والنتيجة تُرى قبل أن تُصدَّق.
 *
 *   npx tsx scripts/import-specs-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { judgeSpecs, asSpecs } from '../lib/import-specs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;

const check = (title: string, got: boolean, detail: string) => {
  if (got) { pass++; console.log(`  ${G}✔${X} ${title}`); }
  else { fail++; console.log(`  ${R}✘ ${title}${X}\n      ${detail}`); }
};

async function main() {
  const board = await prisma.component.findFirst({
    where: { category: { name: 'Motherboard' } },
    include: { category: true },
  });
  if (!board) throw new Error('لا توجد لوحة في الكتالوج');

  const cur = asSpecs(board.specs);
  console.log(`\nالقطعة المختبَرة: ${D}${board.name}${X}`);
  console.log(`مواصفاتها الحالية (${Object.keys(cur).length}): ${D}${Object.keys(cur).join(', ')}${X}\n`);

  /* ١ — الدمج: حقلٌ واحد لا يمحو الباقي */
  console.log('١) تعديل حقلٍ واحد على قطعة قائمة');
  {
    const v = judgeSpecs('Motherboard', cur, { chipset: 'B650E' });
    check('يُقبل بلا بقيّة المفاتيح', v.reject === null, `رُفض: ${v.reject}`);
    check('chipset تغيّر', v.effective?.chipset === 'B650E', `= ${v.effective?.chipset}`);
    check(
      'بقيّة المفاتيح باقية',
      Object.keys(cur).every((k) => k === 'chipset' || v.effective?.[k] === cur[k]),
      `المحصّلة: ${Object.keys(v.effective ?? {}).join(', ')}`,
    );
  }

  /* ٢ — ما كان يمحو ثمانيةً بصمت */
  console.log('\n٢) إرسال socket وحده (الفخّ القديم)');
  {
    const v = judgeSpecs('Motherboard', cur, { socket: 'AM5' });
    check('يُقبل', v.reject === null, `رُفض: ${v.reject}`);
    check(
      'لم يُفقد شيء',
      Object.keys(cur).length === Object.keys(v.effective ?? {}).length,
      `قبل ${Object.keys(cur).length} → بعد ${Object.keys(v.effective ?? {}).length}`,
    );
  }

  /* ٣ — الغلطة المطبعيّة: ثمن الدمج */
  console.log('\n٣) غلطة مطبعيّة');
  {
    const v = judgeSpecs('Motherboard', cur, { sockett: 'AM5' });
    check('تُرفض', v.reject !== null, 'مرّت!');
    check('الرسالة تسمّي المفتاح', !!v.reject?.includes('sockett'), `${v.reject}`);
    console.log(`      ${Y}${v.reject}${X}`);
  }

  /* ٤ — قطعة جديدة ناقصة التوافق */
  console.log('\n٤) قطعة جديدة بلا مفاتيح توافق');
  {
    const v = judgeSpecs('Motherboard', null, { chipset: 'B650' });
    check('تُرفض', v.reject !== null, 'مرّت!');
    console.log(`      ${Y}${v.reject}${X}`);
  }

  /* ٥ — تعديل السعر وحده */
  console.log('\n٥) صفٌّ بلا specs إطلاقاً (تعديل سعر)');
  {
    const v = judgeSpecs('Motherboard', cur, null);
    check('يمرّ بلا فحص', v.reject === null, `رُفض: ${v.reject}`);
    check('لا يمسّ المواصفات', v.effective === null, `المحصّلة ليست null`);
  }

  /* ٦ — الحذف الصريح */
  console.log('\n٦) الحذف بقيمةٍ فارغة');
  {
    const v1 = judgeSpecs('Motherboard', { ...cur, color: 'White' }, { color: '' });
    check('مفتاحٌ عاديّ يُحذف', v1.effective !== null && !('color' in v1.effective), 'ما زال موجوداً');
    const v2 = judgeSpecs('Motherboard', cur, { socket: '' });
    check('مفتاح توافق يُرفض حذفه', v2.reject !== null, 'حُذف!');
    console.log(`      ${Y}${v2.reject}${X}`);
  }

  /* ٧ — المزايا الحرّة تمرّ */
  console.log('\n٧) المزايا الحرّة');
  {
    const v = judgeSpecs('Motherboard', cur, { features: ['شاشة حالة'] });
    check('features ليست دخيلة', v.reject === null, `رُفضت: ${v.reject}`);
  }

  /* ٨ — الكتالوج كلّه: لا قطعة قائمة تُرفض لو أُعيد رفعها كما هي */
  console.log('\n٨) الكتالوج كلّه — إعادة رفع كل قطعة بمواصفاتها الحالية');
  {
    const all = await prisma.component.findMany({ include: { category: true } });
    const rejected: string[] = [];
    const gapped: string[] = [];
    for (const c of all) {
      const sp = asSpecs(c.specs);
      const v = judgeSpecs(c.category.name, sp, sp);
      if (v.reject) rejected.push(`${c.category.name} · ${c.name}: ${v.reject}`);
      if (v.gaps.length) gapped.push(`${c.name}: ${v.gaps.join('، ')}`);
    }
    check(`٠ مرفوضة من ${all.length}`, rejected.length === 0, rejected.slice(0, 5).join('\n      '));
    /* ليست ٠: Crucial لا تنشر ارتفاع شرائحها، وتركُها فارغةً قرارٌ لا سهو.
       فالشرط أن تبقى **هي وحدها** — ويسقط الفحص إن ظهرت فجوةٌ جديدة. */
    const KNOWN_GAPS = ['Pro DDR5 32GB 5600MHz: heightMm'];
    const unexpected = gapped.filter((g) => !KNOWN_GAPS.includes(g));
    check(`لا فجوة غير معروفة (المعروفة: ${KNOWN_GAPS.length})`, unexpected.length === 0, unexpected.slice(0, 5).join('\n      '));
  }

  console.log(`\n${'═'.repeat(40)}`);
  console.log(fail === 0 ? `${G}كل الفحوص نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail > 0) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
