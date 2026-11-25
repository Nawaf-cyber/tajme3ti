import { prisma } from '../../lib/prisma';
import { HAS_PARTS } from '../../lib/categories';
import { OFFER_INCLUDE, verifyListPrices } from '../../lib/stores-server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تصفّح قطع الحاسب وأسعارها',
  description: 'تصفّح كتالوج قطع الحاسب: كروت الشاشة والمعالجات واللوحات والذاكرة والتخزين — بأسعار لحظية من المتاجر السعودية مع رصد التخفيضات.',
  alternates: { canonical: '/components' },
};
import ComponentsClient from './ComponentsClient';

// تحديث حي دائماً — يعرض أحدث الأسعار والصور والتوفّر بلا حاجة redeploy
export const dynamic = 'force-dynamic';

export default async function ComponentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  /* ?cat=Monitor&res=1440 — رابط «الشاشات» في القائمة و«شوف كل شاشات…» في الباني (ComponentsClient) */
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const query = { cat: one(sp.cat), res: one(sp.res), hz: one(sp.hz), panel: one(sp.panel), size: one(sp.size) };
  const components = await verifyListPrices(await prisma.component.findMany({
    include: { category: true, ...OFFER_INCLUDE },
    orderBy: { createdAt: 'desc' }
  }));
  
  const categories = await prisma.category.findMany({ where: HAS_PARTS });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">تصفح القطع</h1>
        <ComponentsClient key={JSON.stringify(query)} components={components} categories={categories} query={query} />
      </div>
    </div>
  );
}