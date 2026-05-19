import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '../components/Providers';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Providers>
          <Navbar />
          {children}
          {/* مكون الإشعارات المنبثقة */}
          <Toaster position="top-center" reverseOrder={false} />
          
          {/* إضافة مكون الإحصائيات هنا */}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}