import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '../components/Providers';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import PCBBackground from '../components/PCBBackground';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // الدومين الرسمي — يُستخدم لتوليد روابط canonical تلقائياً (يمنع تكرار المحتوى www/non-www)
  metadataBase: new URL('https://www.tajme3ti.com'),
  title: {
    default: 'تجميعتي | منصة تجميع الحواسيب ومقارنة الأسعار في السعودية',
    template: '%s | تجميعتي',
  },
  description: 'تجميعتي منصة عربية لتجميع الحواسيب الشخصية: افحص توافق القطع برمجياً، قارن أسعار المتاجر السعودية لحظياً، واختر أفضل قطعة بأفضل سعر بثقة.',
  keywords: ['تجميع كمبيوتر', 'تجميع حاسوب', 'مقارنة أسعار قطع', 'كمبيوتر قيمنق', 'تجميعة PC', 'قطع كمبيوتر السعودية', 'كرت شاشة', 'معالج', 'تجميعتي'],
  authors: [{ name: 'تجميعتي' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://www.tajme3ti.com',
    siteName: 'تجميعتي',
    title: 'تجميعتي | منصة تجميع الحواسيب ومقارنة الأسعار',
    description: 'افحص توافق القطع برمجياً، قارن أسعار المتاجر السعودية لحظياً، واختر أفضل قطعة بأفضل سعر بثقة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تجميعتي | منصة تجميع الحواسيب',
    description: 'افحص توافق القطع، قارن الأسعار، وابنِ حاسوبك بثقة.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'GBg7x6GMv3D-qDubx8xZUnPWBk0drTXKkcbwcHlc9Sk',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="overflow-x-hidden">
      
      <body className="bg-[#F5F7FA] dark:bg-[#0B1120] text-slate-800 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden w-full relative" suppressHydrationWarning>
        
        {/* سكربت Google AdSense (تم نقله هنا لتجنب أخطاء الـ Hydration) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3317971310305945"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />

        <Providers>
          <PCBBackground />
          <div className="relative z-10 flex flex-col min-h-screen overflow-x-hidden w-full">
            <Navbar />
            <main className="flex-grow w-full">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" reverseOrder={false} />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}