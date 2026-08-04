import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description: 'تواصل مع فريق تجميعتي: اقترح قطعة، بلّغ عن سعر خاطئ، أو اسأل عن تجميعتك — نقرأ كل رسالة.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
