import { prisma } from '../../lib/prisma';
import PCBuilderClient from '../../components/PCBuilderClient';

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