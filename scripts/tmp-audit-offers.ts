/* ============ تدقيق العروض من نصّ الرابط ============
 *
 * ⚠️ بلا شبكة: روابط مايكرولس وكازاسوق وإنفيني آرك تحمل اسم المنتج في
 * مسارها، فيُقارن بما عندنا. وأمازون لا يحمل إلّا رمز ASIN فيُستثنى ويُذكر.
 *
 * والغرض إيجاد ما وقع فيه طقم XPG: عرضٌ لمنتجٍ آخر مربوطٌ بقطعتنا، يُنزل
 * السعر المعروض إلى سعر شيءٍ لا نبيعه.
 */
import 'dotenv/config';
import { prisma } from '../lib/prisma';

const slugText = (url: string): string =>
  decodeURIComponent(url)
    .replace(/^https?:\/\/[^/]+\//, ' ')
    .replace(/[?#].*$/, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .toLowerCase();

(async () => {
  const all = await prisma.component.findMany({
    include: { category: true, offers: { include: { store: true } } },
  });

  const suspects: string[] = [];
  let checked = 0, skipped = 0;

  for (const c of all) {
    const specs = (c.specs as any) || {};
    /* الرموز التي لا يجوز أن تغيب: الطراز من الاسم، والسرعة والسعة للذاكرة */
    const tokens: string[] = [];
    for (const m of `${c.name}`.matchAll(/[A-Za-z]*\d[A-Za-z0-9-]{1,}/g)) tokens.push(m[0].toLowerCase());
    const speed = String(specs.speed ?? '').replace(/\D/g, '');

    for (const o of c.offers) {
      if (o.store.slug === 'amazon') { skipped++; continue; }
      const s = slugText(o.url);
      if (s.length < 12) { skipped++; continue; }
      checked++;

      /* السرعة أوّلاً — هي التي فرّقت ARMAX 6000 عن 6400 */
      if (speed && speed.length === 4) {
        const inSlug = [...s.matchAll(/\b(\d{4})\s*(?:mhz|mts)?\b/g)].map((m) => m[1]);
        const speeds = inSlug.filter((n) => Number(n) >= 2000 && Number(n) <= 9000);
        if (speeds.length && !speeds.includes(speed)) {
          suspects.push(`[سرعة] ${c.brand} ${c.name} (${speed}) ← ${o.store.slug} يذكر ${speeds.join('/')}\n        ${o.url.slice(0, 110)}`);
          continue;
        }
      }

      /* ثم الطراز: رمزٌ من اسمنا لا يظهر في الرابط إطلاقاً */
      const missing = tokens.filter((t) => t.length >= 4 && !s.includes(t));
      if (tokens.length && missing.length === tokens.length) {
        suspects.push(`[طراز] ${c.brand} ${c.name} ← ${o.store.slug} لا يذكر ${tokens.join('/')}\n        ${o.url.slice(0, 110)}`);
      }
    }
  }

  console.log(`فُحص ${checked} عرضاً · استُثني ${skipped} (أمازون أو رابطٌ بلا اسم)`);
  console.log(`مشبوهٌ: ${suspects.length}\n`);
  for (const s of suspects.slice(0, 25)) console.log('  ' + s);
  await prisma.$disconnect();
})();
