export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import AdminManager from "./AdminManager";
import Link from 'next/link';
import { getCronStatus } from "./actions"; // 1. استيراد دالة جلب الحالة من الـ actions
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getStores, OFFER_INCLUDE } from "../../lib/stores-server";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // 1. التحقق من تسجيل الدخول
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  // 2. التحقق من الصلاحية اعتماداً على الدور (role) من قاعدة البيانات
  if ((session.user as any)?.role !== 'ADMIN') {
    redirect("/"); // طرد المستخدم العادي للصفحة الرئيسية
  }

  const categories = await prisma.category.findMany();
  const components = await prisma.component.findMany({
    // العروض مطلوبة هنا: منها يملأ النموذج روابط المتاجر وأسعارها،
    // ومنها تُحسب عدّادات فلتر المتاجر في الجدول.
    include: { category: true, ...OFFER_INCLUDE },
    orderBy: { createdAt: 'desc' }
  });
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // المتاجر المفعّلة — منها تُولَّد حقول النموذج وأزرار الفلتر وألوانها
  const stores = await getStores();

  /* طلبات لم يفتحها الأدمن بعد — عليها النقطة الحمراء في تبويب الطلبات */
  const newRequests =
    (await prisma.requestedPart.count({ where: { adminSeenAt: null } })) +
    // وردود المستخدمين التي لم تُقرأ — كلاهما يستدعي فتح الصفحة
    (await prisma.partRequestMessage.count({ where: { userId: { not: null }, seenByAdmin: false } }));

  // 2. جلب حالة التحديث التلقائي من قاعدة البيانات (سيرفر سايد)
  const cronStatus = await getCronStatus();

  /* 3. جلب إعدادات الأفلييت من جدول Setting.
     كانت مفقودة: updateSettings يحفظ بنجاح، لكن الصفحة لا تقرأ —
     فتعرض AdminManager قيمتها الافتراضية {} فتبدو الحقول فارغة بعد الحفظ. */
  const settingRows = await prisma.setting.findMany({
    where: { key: { in: ['amazon_affiliate', 'cazasouq_affiliate', 'microless_affiliate'] } },
  });
  const settings: Record<string, string> = Object.fromEntries(
    settingRows.map((r) => [r.key, r.value])
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-slate-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة تحكم النظام</h1>
          <span className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg shadow-sm">
            مدير النظام
          </span>
        </div>
        
        {/* 3. تمرير القيمة المستخرجة كمستند أساسي إلى المكون الإداري */}
        <AdminManager categories={categories} components={components} news={news} cronStatus={cronStatus} settings={settings} stores={stores} newRequests={newRequests} />
      </div>
    </main>
  );
}