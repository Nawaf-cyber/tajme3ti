import type { Metadata } from 'next';

/* صفحة خاصة بالمستخدم — محجوبة في robots.txt أصلاً، ونؤكّد المنع هنا
   كي لا تُفهرس عبر رابط خارجي. */
export const metadata: Metadata = {
  title: 'تجميعاتي',
  robots: { index: false, follow: false },
};

export default function MyBuildsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
