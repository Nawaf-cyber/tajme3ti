import { Metadata } from 'next';
import { prisma } from '../../lib/prisma';
import { HAS_PARTS } from '../../lib/categories';
import PCBuilderClient from '../../components/PCBuilderClient';
import { OFFER_INCLUDE, getStoreNotices } from '../../lib/stores-server';
import StoreNotices from '../../components/StoreNotice';
import { BUILD_ORDER } from '../../lib/category-meta';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  
  // التحقق مما إذا كان الرابط يحتوي على تجميعة مخصصة عبر الـ IDs أو مستوردة عبر from
  const isCustomBuild = resolvedParams.cpu || resolvedParams.gpu || resolvedParams.from;
  
  const title = isCustomBuild 
    ? "تجميعة PC احترافية | منصة تجميعتي" 
    : "بناء وتجميع PC | منصة تجميعتي للتوافق الذكي";
    
  const description = isCustomBuild 
    ? "تفقد مواصفات هذه التجميعة، وتعرف على التكلفة الإجمالية والأداء المتوقع في الألعاب عبر منصة تجميعتي."
    : "أفضل منصة عربية لبناء الـ PC. اختر قطعك، تأكد من التوافق برمجياً، وتعرف على الفريمات وسحب الطاقة.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://tajme3ti.com',
      siteName: 'منصة تجميعتي',
      images: [
        {
          url: 'https://tajme3ti.com/og-image.jpg', 
          width: 1200,
          height: 630,
          alt: 'منصة تجميعتي لبناء الـ PC',
        },
      ],
      locale: 'ar_SA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;

  // جلب الفئات والقطع
  const categories = await prisma.category.findMany({
    where: HAS_PARTS,
    /* ترتيبٌ ثابت للقطع (الشركة ثمّ الاسم) — كان بلا ترتيب، فتأتي بترتيب القاعدة الفيزيائيّ
       الذي يتبدّل مع كلّ تحديث سعر، وأوّلُ اللوحات ProArt بـ2,317 (تجربة المستخدمين 2026-10-17) */
    include: { components: { include: OFFER_INCLUDE, orderBy: [{ brand: 'asc' }, { name: 'asc' }] } },
  });
  /* ترتيب العرض: المعالج فالمبرّد فاللوحة… (lib/category-meta) — كان مزوّد الطاقة ثالثاً قبل الرام والكرت */
  const rank = (name: string) => {
    const i = (BUILD_ORDER as readonly string[]).indexOf(name);
    return i === -1 ? BUILD_ORDER.length : i;
  };
  categories.sort((a, b) => rank(a.name) - rank(b.name));

  /* إعلانات المتاجر (عطل/صيانة) — تُقرأ من جدول Store.
     معرّفات العمولة لم تعد تُجلب هنا: صارت داخل صفّ كل متجر ويبنيها
     buildStoreUrl من العرض نفسه. */
  const notices = await getStoreNotices();

  // قراءة التجميعة إذا كان هناك متغير from في الرابط
  let importedSelections: Record<string, string> = {};
  if (from) {
    const prebuild = await prisma.prebuild.findUnique({ where: { id: from } });
    if (prebuild && prebuild.components) {
      importedSelections = typeof prebuild.components === 'string'
        ? JSON.parse(prebuild.components)
        : (prebuild.components as Record<string, string>);
    }
  }

  return (
    <div className="pb-2 px-4 sm:px-6 lg:px-8">
      {/* إعلان حالة أي متجر — قبل أن يبني الزائر تجميعته لا بعدها */}
      <div className="max-w-7xl mx-auto">
        <StoreNotices stores={notices as any} />
      </div>
      <PCBuilderClient categories={categories} importedSelections={importedSelections} />
    </div>
  );
}