import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';
import { guideWhere, newsWhere } from '../lib/content';

// رابط الموقع الأساسي — عدّله إن تغيّر الدومين
const BASE_URL = 'https://www.tajme3ti.com';

/* تُبنى عند النشر ثمّ تُجدَّد يومياً — كانت ساكنةً منذ آخر نشر، فتواريخ الأسعار والمقالات
   والقطع الجديدة لا تصلها حتى النشر التالي */
export const revalidate = 86400;

/* تاريخ آخر تعديل جوهري لكلّ صفحةٍ ثابتة — حقيقيٌّ لا new Date().
   ⚠️ لا نضع new Date() هنا: خريطة تقول "تغيّر كل شيء" في كل طلب تفقد مصداقيتها
   عند جوجل فيتجاهل الإشارة. لكنّ تاريخاً واحداً لكلّ الصفحات (2026-08-20) كذب في
   الاتّجاه الآخر (مراجعة أدسنس 2026-10-15): فالصفحات التي محتواها بياناتٌ تأخذ تاريخ
   آخر بيانٍ فيها (الأسعار، المقالات)، والباقي تاريخ آخر تعديلٍ لها يُحدَّث يدوياً. */
const EDITED: Record<string, string> = {
  '/builder': '2026-10-15',   // العنوان والشرح من الخادم
  '/prebuilds': '2026-10-15', // سعر لحظيّ للمتوفّر
  '/about': '2026-10-15',     // كيف نجمع الأسعار ونتموّل
  '/how-we-rate': '2026-10-22', // تقييم الأداء: المصدر والحدود
  '/privacy': '2026-10-15',   // DoubleClick وشركاء أمازون والبريد
  '/compare': '2026-08-20',
  '/contact': '2026-08-20',
  '/terms': '2026-08-20',
  '/for-stores': '2026-10-05',
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  /* أحدث تاريخٍ في كلّ نوع — لصفحات القوائم التي تعرضه */
  let latestPrice = new Date('2026-08-20'), latestGuide = latestPrice, latestNews = latestPrice;
  const latest = (ds: Date[], fallback: Date) => (ds.length ? new Date(Math.max(...ds.map((d) => d.getTime()))) : fallback);

  try {
    // كل صفحات القطع + كل المقالات (تُولّد تلقائياً)
    const [components, guides, news] = await Promise.all([
      prisma.component.findMany({ select: { id: true, updatedAt: true } }),
      prisma.news.findMany({ where: guideWhere, select: { id: true, createdAt: true } }),
      prisma.news.findMany({ where: newsWhere, select: { id: true, createdAt: true } }),
    ]);
    latestPrice = latest(components.map((c) => c.updatedAt), latestPrice);
    latestGuide = latest(guides.map((g) => g.createdAt), latestGuide);
    latestNews = latest(news.map((n) => n.createdAt), latestNews);

    const componentRoutes: MetadataRoute.Sitemap = components.map((c) => ({
      url: `${BASE_URL}/components/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const guideRoutes: MetadataRoute.Sitemap = guides.map((g) => ({
      url: `${BASE_URL}/guides/${g.id}`,
      lastModified: g.createdAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
      url: `${BASE_URL}/news/${n.id}`,
      lastModified: n.createdAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

    dynamicRoutes = [...componentRoutes, ...guideRoutes, ...newsRoutes];
  } catch (error) {
    // في حال فشل الاتصال بقاعدة البيانات، نُرجع الصفحات الثابتة على الأقل
    console.error('Sitemap: failed to load dynamic routes', error);
  }

  const edited = (path: string) => new Date(EDITED[path]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,           lastModified: latest([latestPrice, latestGuide, latestNews], latestPrice), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/components`, lastModified: latestPrice, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/deals`,      lastModified: latestPrice, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/builder`,    lastModified: edited('/builder'),    changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/prebuilds`,  lastModified: edited('/prebuilds'),  changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/news`,       lastModified: latestNews,  changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/guides`,     lastModified: latestGuide, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/compare`,    lastModified: edited('/compare'),    changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/about`,      lastModified: edited('/about'),      changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/how-we-rate`, lastModified: edited('/how-we-rate'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/for-stores`, lastModified: edited('/for-stores'), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`,    lastModified: edited('/contact'),    changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,    lastModified: edited('/privacy'),    changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,      lastModified: edited('/terms'),      changeFrequency: 'yearly',  priority: 0.3 },
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
