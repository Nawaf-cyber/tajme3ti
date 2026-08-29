/* ============ إضافة متجر إنفيني آرك ============
 *
 * قيس قبل الإضافة، لا بعدها:
 *   • صفحة المنتج: 200 في ٥١١ ملّي ثانية بطلبٍ عاديّ من خادم — بلا Scrape.do.
 *   • السعر من JSON-LD بعملة **SAR** صراحةً: 3699 / 5699 / 3849 — قُرئت
 *     بـ`readJsonLd` نفسها التي تعمل في الإنتاج، لا بقارئٍ كُتب للفحص.
 *   • البحث يعمل على الخادم: «RTX 5070» أعاد ١٢ منتجاً، و«Peerless Assassin»
 *     أعاد «لا نتائج» صراحةً — أي أنّ الصفر صفرٌ حقيقيّ لا عجزُ قراءة.
 *
 * فـ`scrapeMode: 'auto'` يكفي: الساحب العامّ يقرأ JSON-LD أوّلاً، ولا حاجة
 * إلى محرّكٍ مخصّص كأمازون وكازاسوق ومايكرولس.
 *
 *   npx tsx scripts/add-store-infiniarc.ts [--commit]
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ROW = {
  slug: 'infiniarc',
  name: 'إنفيني آرك',
  latinName: 'InfiniArc',
  color: '#7C3AED',
  domain: 'infiniarc.com',
  active: true,
  sortOrder: 4,
  currency: 'SAR',
  rateToSar: 1,
  /* JSON-LD مقروءٌ ومؤكَّد — فلا محرّك مخصّص */
  scrapeMode: 'auto',
  /* ⚠️ لا وكيل مميّز: المتجر يستجيب لطلبٍ عاديّ، وتشغيل `super` يضاعف الكلفة
     بلا سبب. (وتبقى ملاحظةٌ قائمة: الساحب العامّ يمرّ عبر Scrape.do دائماً
     ولو لم يحتج المتجر إليه — وهي كلفةٌ تستحقّ إصلاحاً مستقلّاً.) */
  premiumProxy: false,
  affiliateParam: null as string | null,
  affiliateId: null as string | null,
  usesDeepLinks: false,
};

async function main() {
  const commit = process.argv.includes('--commit');
  const existing = await prisma.store.findUnique({ where: { slug: ROW.slug } });
  console.log(commit ? '== كتابة ==' : '== تجربة بلا كتابة (أضف --commit) ==');
  console.log(existing ? `موجودٌ أصلاً: ${existing.name}` : `جديد: ${ROW.name} (${ROW.latinName})`);
  console.log(JSON.stringify(ROW, null, 2));
  if (!commit) { await prisma.$disconnect(); return; }

  const s = await prisma.store.upsert({
    where: { slug: ROW.slug },
    create: ROW as any,
    update: { name: ROW.name, latinName: ROW.latinName, domain: ROW.domain, currency: ROW.currency, scrapeMode: ROW.scrapeMode },
  });
  console.log(`RESULT ${existing ? 'حُدِّث' : 'أُضيف'} · id=${s.id} · عروضه=${await prisma.componentOffer.count({ where: { storeId: s.id } })}`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
