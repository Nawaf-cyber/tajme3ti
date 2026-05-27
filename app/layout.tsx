import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '../components/Providers';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="overflow-x-hidden">
      {/* التعديل هنا: استخدام خلفية هادئة #F5F7FA للوضع الفاتح ولون نص slate-800 */}
      <body className="bg-[#F5F7FA] dark:bg-[#0B1120] text-slate-800 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden w-full relative" suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
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