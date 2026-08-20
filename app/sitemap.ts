import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';
import { guideWhere, newsWhere } from '../lib/content';

// رابط الموقع الأساسي — عدّله إن تغيّر الدومين
const BASE_URL = 'https://www.tajme3ti.com';

/* تاريخ آخر تعديل جوهري على الصفحات الثابتة.
   ⚠️ لا نضع new Date() هنا: خريطة تقول "تغيّر كل شيء" في كل طلب تفقد
   مصداقيتها عند جوجل فيتجاهل الإشارة. نضع تاريخاً حقيقياً ونحدّثه يدوياً
   عند أي تغيير جوهري. آخر تحديث: إعادة بناء العناوين وروابط canonical
   لكل الصفحات (2026-08-04)، ثم إضافة صفحة /deals (2026-08-20). */
const STATIC_LAST_MODIFIED = new Date('2026-08-20');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // الصفحات الثابتة الرئيسية
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,           lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/components`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/deals`,      lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/builder`,    lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/prebuilds`,  lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/news`,       lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/guides`,     lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/compare`,    lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/about`,      lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,    lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,    lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // كل صفحات القطع + كل مقالات الأخبار (تُولّد تلقائياً)
    const [components, guides, news] = await Promise.all([
      prisma.component.findMany({ select: { id: true, updatedAt: true } }),
      prisma.news.findMany({ where: guideWhere, select: { id: true, createdAt: true } }),
      prisma.news.findMany({ where: newsWhere, select: { id: true, createdAt: true } }),
    ]);

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

  return [...staticRoutes, ...dynamicRoutes];
}