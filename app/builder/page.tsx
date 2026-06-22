import { Metadata } from 'next';
import { prisma } from '../../lib/prisma';
import PCBuilderClient from '../../components/PCBuilderClient';

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
    include: { components: true },
  });

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
    <main className="bg-gray-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <PCBuilderClient categories={categories} importedSelections={importedSelections} />
    </main>
  );
}