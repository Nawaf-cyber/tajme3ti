import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';

// رابط الموقع الأساسي — عدّله إن تغيّر الدومين
const BASE_URL = 'https://www.tajme3ti.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // الصفحات الثابتة الرئيسية
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,          changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/components`, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/builder`,    changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/prebuilds`,  changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/news`,       changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/about`,      changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,    changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,    changeFrequency: 'yearly',  priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // كل صفحات القطع + كل مقالات الأخبار (تُولّد تلقائياً)
    const [components, news] = await Promise.all([
      prisma.component.findMany({ select: { id: true, updatedAt: true } }),
      prisma.news.findMany({ select: { id: true, createdAt: true } }),
    ]);

    const componentRoutes: MetadataRoute.Sitemap = components.map((c) => ({
      url: `${BASE_URL}/components/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
      url: `${BASE_URL}/news/${n.id}`,
      lastModified: n.createdAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    dynamicRoutes = [...componentRoutes, ...newsRoutes];
  } catch (error) {
    // في حال فشل الاتصال بقاعدة البيانات، نُرجع الصفحات الثابتة على الأقل
    console.error('Sitemap: failed to load dynamic routes', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
