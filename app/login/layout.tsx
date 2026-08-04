import type { Metadata } from 'next';

/* صفحة دخول: لا قيمة لها في نتائج البحث، ووجودها في الفهرس يُضعف
   انطباع "نسبة الصفحات المفيدة" عند مراجعة AdSense. */
export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
