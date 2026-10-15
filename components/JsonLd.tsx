/* ============ بيانات منظّمة (JSON-LD) للبحث ============
 * مكوّن خادم: يكتب <script type="application/ld+json"> في HTML الخادم.
 * ⚠️ «<» يُهرَّب: وصفٌ أو عنوانٌ فيه «</script>» كان سيُغلق الوسم ويُدخل ما بعده صفحةً.
 * (مراجعة أدسنس 2026-10-15 — للبحث لا لأدسنس: Product للقطع، Article للمقالات، ومسار التنقّل.)
 */

export const SITE_URL = 'https://www.tajme3ti.com';

/** رابطٌ مطلق — الصور والمسارات المحلّية تُكتب نسبيّة في الموقع */
export const absUrl = (u: string) => (/^https?:\/\//.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

/** نصّ عاديّ من وصفٍ بوسوم ألوان ونجوم — للحقل description */
export const plainText = (s: string | null | undefined, max = 300) => {
  const t = (s || '').replace(/\[\/?[a-z]+\]/gi, '').replace(/[*#>`_]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, t.lastIndexOf(' ', max) || max)}…` : t;
};

export const breadcrumbs = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absUrl(path) })),
});

export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
