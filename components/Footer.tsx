import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-right">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              منصة سعودية لتسهيل بناء أجهزة الـ PC 🇸🇦
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="mailto:your-email@example.com" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              ✉️ للاقتراحات والتواصل
            </a>
            <Link href="/about" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              من نحن
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}