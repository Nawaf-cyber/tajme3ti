import type { Metadata } from 'next';

/* صفحة "عن المنصة" مكوّن عميل ('use client')، ومكوّنات العميل لا تصدّر
   metadata — فنضعها في layout مجاور. */
export const metadata: Metadata = {
  title: 'عن المنصة',
  description: 'تجميعتي منصة عربية مستقلّة لفحص توافق قطع الحاسب ومقارنة أسعارها في المتاجر السعودية. نوجّه المجتمع ولا نبيع — تعرّف على رسالتنا وطريقة عملنا.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
