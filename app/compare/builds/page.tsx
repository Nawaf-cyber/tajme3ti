import type { Metadata } from 'next';
import CompareBuildsClient from './CompareBuildsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'قارن تجميعاتك جنباً إلى جنب',
  description: 'قارن تجميعاتك المحفوظة: السعر الكلي، الأداء، الاستهلاك، وقطعة بقطعة — لتختار الجهاز الذي تبنيه فعلاً.',
  /* صفحة حساب: بلا دخولٍ لا تعرض إلّا دعوة تسجيل — صفحةٌ رقيقة في عين الزاحف (كتجميعاتي) */
  robots: { index: false, follow: true },
};

export default function CompareBuildsPage() {
  return <CompareBuildsClient />;
}
