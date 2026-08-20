/* ============ صفحة التخفيضات ============
 *
 * كانت مؤجَّلةً بقرار: تُبنى حين تتجاوز الانخفاضات المرصودة ١٤ — سقفَ
 * الشريط في «تصفّح القطع». وقد بلغت ٢٣، فاستحقّت صفحةً تُقصد بذاتها.
 *
 * ⚠️ وهي **الواجهة نفسها** بفلترٍ مفعّل مسبقاً، لا نسخةٌ ثانية منها:
 * بطاقة القطعة فيها سعرٌ وخصمٌ وشارات متاجر وتوفّر — ونسخُها يعني عيباً
 * يُصلَح هنا ويعيش هناك. وهو الدرس نفسه من ساحبات الأسعار.
 *
 * والخصم يُحسب من `offerDeal` على **المتجر الأرخص المتوفّر وحده**: إعلان
 * خصم متجرٍ أغلى بينما نعرض سعر متجرٍ آخر تضليلٌ لا ترويج.
 */

import { prisma } from '../../lib/prisma';
import { HAS_PARTS } from '../../lib/categories';
import { OFFER_INCLUDE } from '../../lib/stores-server';
import ComponentsClient from '../components/ComponentsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تخفيضات قطع الحاسب اليوم',
  description:
    'القطع التي نزل سعرها في المتاجر السعودية — كروت شاشة ومعالجات ولوحات وذاكرة وتخزين، بنسبة الانخفاض وسعرها قبل الخصم، محدَّثة لحظياً.',
  alternates: { canonical: '/deals' },
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const components = await prisma.component.findMany({
    include: { category: true, ...OFFER_INCLUDE },
    orderBy: { createdAt: 'desc' },
  });
  const categories = await prisma.category.findMany({ where: HAS_PARTS });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            تخفيضات اليوم
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            القطع التي نزل سعرها عند أرخص متجرٍ متوفّر. النسبة محسوبة من السعر المشطوب في المتجر
            نفسه — ولا نُعلن خصماً على متجرٍ أغلى بينما نعرض سعر غيره.
          </p>
        </div>
        <ComponentsClient components={components} categories={categories} startOnDeals />
      </div>
    </div>
  );
}
