import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.tajme3ti.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // نمنع فهرسة صفحات الإدارة والـ API والمسارات الخاصة
        disallow: ['/admin', '/api/', '/login', '/my-builds'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
