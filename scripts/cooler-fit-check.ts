/* ============ فحص توافق المبرّدات قبل وجودها ============
 *
 * الكتالوج بلا مبرّدٍ واحد بعد، والدالّة يجب أن تُشغَّل قبل أن تُصدَّق.
 * فالطرف الذي يهمّ — **الكيس** — حقيقيّ من القاعدة، والمبرّدات مصنوعةٌ هنا
 * على مقاسات السوق المعروفة. وهذا يكشف أخطاء القراءة (صيغة
 * `radiatorSupport`، الوحدات، «2x 360mm») وهي مكمن الخطأ الفعليّ.
 *
 * ⚠️ وما لا يكشفه: سلوك الباني عند الاختيار والإزالة. ذاك يحتاج قطعاً
 * حقيقية، ويُفحص يوم تُضاف.
 *
 *   npx tsx scripts/cooler-fit-check.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { coolerFitsCase, coolerFitsCpu, coolerFitReason } from '../lib/fit';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); }
  else { fail++; console.log(`  ${R}✘ ${t}${X}${d ? `\n      ${d}` : ''}`); }
};

/** مبرّدات السوق النمطيّة — الطرف المصنوع */
const COOLERS = [
  { name: 'Noctua NH-L9i (منخفض)', type: 'Air', size: 37 },
  { name: 'Thermalright AK120',    type: 'Air', size: 155 },
  { name: 'Noctua NH-D15',         type: 'Air', size: 165 },
  { name: 'be quiet! Dark Rock Pro 5', type: 'Air', size: 168 },
  { name: 'Arctic LF III 240',     type: 'AIO', size: 240 },
  { name: 'NZXT Kraken 280',       type: 'AIO', size: 280 },
  { name: 'Arctic LF III 360',     type: 'AIO', size: 360 },
  { name: 'Corsair H170i 420',     type: 'AIO', size: 420 },
];

const sp = (c: any): any => (typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {});

async function main() {
  const cases = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { brand: true, name: true, specs: true },
  });

  console.log(`\n${cases.length} كيساً حقيقياً × ${COOLERS.length} مبرّداً = ${cases.length * COOLERS.length} زوجاً\n`);

  /* ١ — لا زوج يسقط في خطأ قراءة (كل حكمٍ يجب أن يكون منطقياً) */
  console.log('١) قراءة أعمدة الكيس');
  {
    const unreadable = cases.filter((c) => {
      const s = sp(c);
      return !String(s.maxCoolerHeight ?? '').trim() || !String(s.radiatorSupport ?? '').trim();
    });
    check(`كل الكيسات تحمل العمودين`, unreadable.length === 0,
      unreadable.map((c) => c.name).join('، '));
  }

  /* ٢ — «2x 360mm» تعني ٣٦٠ لا ٧٢٠ */
  console.log('\n٢) الصيغة الشاذّة');
  {
    const dual = cases.find((c) => /2x/i.test(String(sp(c).radiatorSupport)));
    if (!dual) { check('لا يوجد كيس بصيغة «2x» — تخطّي', true); }
    else {
      const s = sp(dual);
      console.log(`      ${D}${dual.brand} ${dual.name} · radiatorSupport = "${s.radiatorSupport}"${X}`);
      check('يقبل رادييتر 360', coolerFitsCase('AIO', 360, s.maxCoolerHeight, s.radiatorSupport));
      check('يرفض رادييتر 420 (لا يجمعهما في 720)',
        !coolerFitsCase('AIO', 420, s.maxCoolerHeight, s.radiatorSupport));
    }
  }

  /* ٣ — الكيس الصغير: حكمان متعاكسان لنفس الكيس */
  console.log('\n٣) حكمان متعاكسان لكيسٍ واحد');
  {
    const small = cases
      .map((c) => ({ c, h: Number(sp(c).maxCoolerHeight) }))
      .filter((x) => Number.isFinite(x.h))
      .sort((a, b) => a.h - b.h)[0];
    const s = sp(small.c);
    console.log(`      ${D}${small.c.brand} ${small.c.name} · ارتفاع ${s.maxCoolerHeight} · رادييتر ${s.radiatorSupport}${X}`);
    check('يرفض NH-D15 الهوائي (165)', !coolerFitsCase('Air', 165, s.maxCoolerHeight, s.radiatorSupport));
    check('يقبل مائياً بمقاس رادييتره',
      coolerFitsCase('AIO', Number(String(s.radiatorSupport).replace(/\D/g, '')) || 240, s.maxCoolerHeight, s.radiatorSupport));
  }

  /* ٤ — التوزيع العام: لا «يقبل كل شيء» ولا «يرفض كل شيء» */
  console.log('\n٤) توزيع الأحكام');
  {
    let fits = 0, total = 0;
    const perCooler = new Map<string, number>();
    for (const c of cases) {
      const s = sp(c);
      for (const k of COOLERS) {
        total++;
        const ok = coolerFitsCase(k.type, k.size, s.maxCoolerHeight, s.radiatorSupport);
        if (ok) { fits++; perCooler.set(k.name, (perCooler.get(k.name) ?? 0) + 1); }
      }
    }
    console.log(`      ${D}يدخل ${fits} من ${total} (${Math.round((fits / total) * 100)}٪)${X}`);
    for (const k of COOLERS) {
      console.log(`      ${D}${(perCooler.get(k.name) ?? 0).toString().padStart(2)}/${cases.length}  ${k.name}${X}`);
    }
    check('ليست كلُّها مقبولة (الفحص يعمل)', fits < total);
    check('ليست كلُّها مرفوضة (الفحص ليس متعنّتاً)', fits > total / 3);
    check('المبرّد المنخفض يدخل كل الكيسات', (perCooler.get('Noctua NH-L9i (منخفض)') ?? 0) === cases.length);
  }

  /* ٥ — المقبس: عضويّةٌ في مجموعة */
  console.log('\n٥) مطابقة المقبس');
  {
    check('AM5 داخل «AM5/AM4/LGA1700»', coolerFitsCpu('AM5/AM4/LGA1700', 'AM5'));
    check('LGA1851 ليست داخلها', !coolerFitsCpu('AM5/AM4/LGA1700', 'LGA1851'));
    check('تقبل الفاصلة أيضاً', coolerFitsCpu('AM5, LGA1851', 'LGA1851'));
    check('بلا حساسية لحالة الأحرف', coolerFitsCpu('am5/lga1700', 'AM5'));
    check('لا مطابقة جزئية (LGA170 ≠ LGA1700)', !coolerFitsCpu('AM5/LGA1700', 'LGA170'));
    check('الفراغ يمرّ (لا منعَ عند الجهل)', coolerFitsCpu('', 'AM5') && coolerFitsCpu('AM5', ''));
  }

  /* ٦ — الرسالة تشرح ولا تُعمّي */
  console.log('\n٦) رسالة الرفض');
  {
    const r = coolerFitReason('Air', 165, '90', '360mm');
    check('تذكر الرقمين', !!r && r.includes('165') && r.includes('90'), String(r));
    console.log(`      ${D}${r}${X}`);
  }

  console.log(`\n${'═'.repeat(44)}`);
  console.log(fail === 0 ? `${G}كل الفحوص نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail > 0) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
