/**
 * ============ ماذا يتغيّر لو مُلئت حقول الكيسات؟ ============
 *
 * حقلٌ فارغ في `psuFormFactor` يعني «اقبل كل شيء» — فـ٢٣ كيساً اليوم لا
 * يُفحص مزوّدها إطلاقاً. وملؤه يوقظ حارساً نائماً: بياناتٌ صحيحة تبدأ
 * فجأةً بالرفض، وقد يقع الرفض على تجميعةٍ حفظها مستخدمٌ ولم يلمسها.
 *
 * فهذه الأداة تُشغّل الحارس الحقيقي من `lib/fit.ts` على كل زوج (كيس ×
 * مزوّد) مرّتين — بالحقول كما هي، وبالحقول كما ستصير — وتعدّ الفرق. ثم
 * تُعيدها على تجميعات المستخدمين المحفوظة.
 *
 * تُشغَّل **قبل** أي ملء، ويُقرأ رقمها قبل الضغط على --apply.
 *
 *   npx tsx scripts/fit-diff.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { psuFitsCase } from '../lib/fit';
import 'dotenv/config';

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

/** ما سيُسجَّل على كيسٍ لا حقل له — Mini-ITX صغير، وما عداه برجٌ يقبل ATX */
const proposed = (c: any): string => {
  const s = parse(c.specs);
  if (s.psuFormFactor) return s.psuFormFactor;
  return /Mini-ITX/i.test(String(s.formFactor || '')) ? 'SFX / SFX-L' : 'ATX';
};

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const cases = await prisma.component.findMany({
    where: { category: { name: 'Case' } },
    select: { id: true, name: true, specs: true },
  });
  const psus = await prisma.component.findMany({
    where: { category: { name: 'PSU' } },
    select: { id: true, name: true, specs: true },
  });

  const flips: string[] = [];
  for (const c of cases) {
    for (const p of psus) {
      const ff = parse(p.specs).formFactor;
      const before = psuFitsCase(ff, parse(c.specs).psuFormFactor);
      const after = psuFitsCase(ff, proposed(c));
      if (before !== after) {
        flips.push(`${before ? '✔→✖' : '✖→✔'}  ${c.name} [${proposed(c)}]  ×  ${p.name} [${ff || '—'}]`);
      }
    }
  }

  console.log(`أزواج (كيس × مزوّد): ${cases.length * psus.length}`);
  console.log(`ينقلب حكمها: ${flips.length}`);
  for (const f of flips) console.log('   ' + f);

  const builds = await prisma.savedBuild.findMany({
    select: { id: true, name: true, caseId: true, psuId: true },
  });
  const byId = Object.fromEntries([...cases, ...psus].map((x) => [x.id, x]));

  let paired = 0;
  const broken: string[] = [];
  for (const b of builds) {
    const c = byId[b.caseId as string];
    const p = byId[b.psuId as string];
    if (!c || !p) continue;
    paired++;
    const ff = parse(p.specs).formFactor;
    if (psuFitsCase(ff, parse(c.specs).psuFormFactor) && !psuFitsCase(ff, proposed(c))) {
      broken.push(`«${b.name}» — ${c.name} × ${p.name}`);
    }
  }

  console.log(`\nتجميعات محفوظة: ${builds.length} (منها ${paired} فيها كيس ومزوّد معاً)`);
  console.log(`تصير غير متوافقة: ${broken.length}`);
  for (const b of broken) console.log('   ⚠️ ' + b);

  if (broken.length === 0) console.log('\n✔ آمن: لا تجميعةَ مستخدمٍ تنكسر بهذا الملء.');

  await prisma.$disconnect();
}

main();
