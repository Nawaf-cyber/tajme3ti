export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import AdminManager from "./AdminManager";
import Link from 'next/link';
import { getCronStatus } from "./actions"; // 1. استيراد دالة جلب الحالة من الـ actions
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getStores, OFFER_INCLUDE } from "../../lib/stores-server";
import PriceReviewPanel from "./PriceReviewPanel";
import PriceReportsPanel from "./PriceReportsPanel";

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

  /* 4. الارتفاعات المعلَّقة — أقدمها أوّلاً: السؤال الذي طال انتظاره يعني
     سعراً قديماً معروضاً للزوار منذ أطول مدّة. */
  const pendingReviews = await prisma.priceReview.findMany({
    where: { status: 'PENDING' },
    orderBy: { detectedAt: 'asc' },
    take: 50,
    include: {
      component: { select: { name: true, brand: true } },
      offer: {
        select: {
          url: true,
          affiliateUrl: true,
          store: { select: { name: true, color: true } },
        },
      },
    },
  });

  const reviewRows = pendingReviews.map((r) => ({
    id: r.id,
    componentId: r.componentId,
    componentName: r.component.name,
    brand: r.component.brand,
    storeName: r.offer.store.name,
    storeColor: r.offer.store.color,
    /* الرابط المباشر لا رابط العمولة: الغرض فحصُ الصفحة لا كسبُ عمولة،
       ورابط التتبّع قد يمرّ بوسيط يعقّد التحقّق. */
    url: r.offer.url,
    oldPrice: r.oldPrice,
    newPrice: r.newPrice,
    changePct: r.changePct,
    seenCount: r.seenCount,
    detectedAt: r.detectedAt.toISOString(),
  }));

  /* 5. بلاغات الزوّار — الأكثر تبليغاً أوّلاً: تعدّد المبلّغين عن الشيء
     نفسه إشارةٌ أقوى من بلاغ واحد. */
  const openReports = await prisma.priceReport.findMany({
    where: { status: 'OPEN' },
    orderBy: [{ count: 'desc' }, { lastReportedAt: 'desc' }],
    take: 50,
    include: {
      component: { select: { name: true, brand: true } },
      offer: { select: { url: true, price: true, store: { select: { name: true, color: true } } } },
    },
  });

  const reportRows = openReports.map((r) => ({
    id: r.id,
    componentId: r.componentId,
    componentName: r.component.name,
    brand: r.component.brand,
    storeName: r.offer.store.name,
    storeColor: r.offer.store.color,
    url: r.offer.url,
    ourPriceNow: r.offer.price,
    ourPriceAtReport: r.ourPrice,
    reportedPrice: r.reportedPrice,
    count: r.count,
    lastReportedAt: r.lastReportedAt.toISOString(),
  }));

  /* 6. روابط داخلية مكسورة في الأوصاف.
     يُحسب من نفس القطع المجلوبة أعلاه — بلا استعلام إضافي. وسببه أن ١٨
     رابطاً عاشت مكسورة شهوراً لأن لا شيء كان يفحصها: نصوص نائبة لم تُستبدل،
     وقطعٌ حُذفت وبقيت الإشارة إليها. الحذف صار ينظّف أثره، وهذا يكشف ما
     يتسرّب من طريق آخر (لصق يدوي، استيراد، تعديل وصف). */
  const componentIds = new Set(components.map((c) => c.id));
  const brokenLinks: { name: string; id: string }[] = [];
  for (const c of components) {
    for (const m of (c.description || '').matchAll(/\/components\/([A-Za-z0-9_-]+)/g)) {
      if (!componentIds.has(m[1])) brokenLinks.push({ name: c.name, id: m[1] });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-slate-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة تحكم النظام</h1>
          <span className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg shadow-sm">
            مدير النظام
          </span>
        </div>
        
        {/* فوق كل شيء: سعرٌ خاطئ معروض للزوار أعجل من أي إعداد.
            والبلاغ البشري قبل الرصد الآلي — لأن أحداً رأى الخطأ بعينه. */}
        <PriceReportsPanel rows={reportRows} />
        <PriceReviewPanel rows={reviewRows} />

        {/* لا يظهر إلا عند وجود مكسور — لوحة تقول «كل شيء سليم» ضجيج دائم */}
        {brokenLinks.length > 0 && (
          <div className="mb-8 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-500/5 px-4 py-3">
            <h3 className="font-black text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <span>🔗</span> {brokenLinks.length} رابط داخلي مكسور في أوصاف القطع
            </h3>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 font-medium mt-1 mb-2">
              الزائر يضغط «البديل» فيصل إلى صفحة غير موجودة. أصلحها بـ
              <span className="font-mono mx-1">node scripts/fix-broken-links.mjs</span>
            </p>
            <ul className="text-[11.5px] font-mono text-rose-800 dark:text-rose-300 space-y-0.5">
              {brokenLinks.slice(0, 8).map((b, i) => (
                <li key={i} dir="ltr" className="truncate">
                  {b.name} → /components/{b.id}
                </li>
              ))}
              {brokenLinks.length > 8 && (
                <li className="opacity-70">… و{brokenLinks.length - 8} غيرها</li>
              )}
            </ul>
          </div>
        )}

        {/* 3. تمرير القيمة المستخرجة كمستند أساسي إلى المكون الإداري */}
        <AdminManager categories={categories} components={components} news={news} cronStatus={cronStatus} settings={settings} stores={stores} newRequests={newRequests} />
      </div>
    </main>
  );
}