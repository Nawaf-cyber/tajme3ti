import { prisma } from '../lib/prisma';
import PCBuilderClient from '../components/PCBuilderClient';

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: { components: true },
  });
  
  return (
    <main className="bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <PCBuilderClient categories={categories} />
    </main>
  );
}