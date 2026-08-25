/* ============ هل يشير الرابط إلى القطعة نفسها؟ ============
 *
 * وقعنا على هذا الخطأ ثلاث مرّات بالصدفة لا بالفحص:
 *   • «Blue SN580 1TB» يشير إلى WDS500G3B0E — نصف السعة
 *   • «P3 Plus 4TB» يشير إلى CT4000P3SSD8 — P3 العاديّ لا Plus
 *   • «SX6000 Pro 512GB» يشير إلى ‏…sx6000-pro-series-**256gb**‏
 *
 * والثلاثة لا يُنتجن خطأ سحبٍ إطلاقاً: الصفحة تُقرأ بنجاح، والسعر يُكتب
 * — سعرَ منتجٍ آخر. فالحارس الوحيد هو المقارنة بين اسم قطعتنا ومسار
 * الرابط، وهي رخيصة: بلا شبكة، وتشمل الكتالوج كلّه لا العيّنة.
 *
 * ⚠️ ويُقارَن ما يمكن مقارنته فقط: روابط مايكرولس وكازاسوق تحمل مساراً
 * وصفيّاً، وروابط أمازون مُرمَّزة بالعربية فلا مسارَ فيها يُقرأ — فتُترك
 * لفحصٍ آخر بدل اختراع إنذاراتٍ كاذبة.
 *
 * **يقرأ ولا يكتب.**
 *   npx tsx scripts/audit-offer-links.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { capacityGb, formatCapacity } from '../lib/capacity';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';
const sp = (s: any) => (typeof s === 'string' ? JSON.parse(s) : s || {});

/** المتاجر التي مسارها وصفيّ فيصلح للمقارنة */
const READABLE = new Set(['microless', 'cazasouq', 'noon']);

type Flag = { part: string; cat: string; store: string; why: string; url: string };

async function main() {
  const all = await prisma.component.findMany({
    include: { category: true, offers: { include: { store: true } } },
  });

  const flags: Flag[] = [];
  let checked = 0, skipped = 0;

  for (const c of all) {
    const specs = sp(c.specs);
    const partCap = capacityGb(specs.capacity);
    const name = c.name.toUpperCase();

    for (const o of c.offers) {
      if (!o.url) continue;
      if (!READABLE.has(o.store.slug)) { skipped++; continue; }
      checked++;

      /* ⚠️ يُقطع ما بعد «؟»: رابط كازاسوق يحمل `?search=Ryzen 5 9600x` —
         أي اسم قطعتنا حرفياً — فيُطابق نفسه ويُخفي أن المسار نفسه يقول
         `amd-ryzen-7-9600x`. الفحص الذي يقرأ سؤاله في الجواب لا يفحص. */
      const slug = decodeURIComponent(o.url.split('?')[0]).toLowerCase();
      const add = (why: string) => flags.push({ part: `${c.brand} ${c.name}`, cat: c.category.name, store: o.store.name, why, url: o.url! });

      /* ١ — المخطّط: http يُرسل الطلب بلا تشفير ويُعرّض لإعادة توجيه */
      if (o.url.startsWith('http://')) add('الرابط بـ http لا https');

      /* ٢ — السعة: أوضح تعارضٍ وأكثره وقوعاً.
         تُقارَن سعةُ قطعتنا بكل سعةٍ مذكورة في المسار؛ فإن لم تكن سعتُنا
         بينها فالرابط لمنتجٍ آخر. */
      /* ============ السعة — ورمزُ الطراز هو الفيصل ============
       *
       * ⚠️ الكلمات الوصفية في المسار **نصُّ المتجر لا حقيقة المنتج**،
       * وقد كذبت في ثلاثٍ من أربع إنذارات:
       *
       *   …sx6000-pro-series-**256gb**-…-asx6000pnp-**512gt**-c   ← ٥١٢ فعلاً
       *   …dominator-titanium-**64gb-2-x-32gb**-…-cmp**48**gx5m2…  ← ٤٨ فعلاً
       *
       * فلا يُنذَر إلا إذا خلا المسار من رقم سعتنا **إطلاقاً** — لا ككلمة
       * ولا داخل رمز الطراز. وإنذارٌ يكذب ثلاث مرّات من أربع يُعلَّم تجاهُله،
       * فيصير وجودُه أسوأ من غيابه.
       *
       * و«600tbw» عمرُ كتابةٍ لا سعة، و«1-tb» سعةٌ بشرطة — كلاهما مُراعى.
       */
      if (partCap > 0) {
        const inUrl = [...slug.matchAll(/(\d+(?:\.\d+)?)[\s-]*(tb|gb)(?!w)\b/g)].map((m) => capacityGb(`${m[1]}${m[2]}`));
        const digits = String(Math.round(partCap >= 1024 ? partCap / 1024 : partCap));
        const anywhere = slug.replace(/[^0-9]/g, ' ').includes(digits) || slug.includes(digits);
        if (inUrl.length && !inUrl.some((v) => Math.abs(v - partCap) < 0.5) && !anywhere) {
          add(`السعة: قطعتنا ${formatCapacity(partCap)} والمسار يذكر ${[...new Set(inUrl.map(formatCapacity))].join('، ')}`);
        }
      }

      /* ٣ — رقم الطراز: أيّ رمزٍ في اسم القطعة فيه رقمٌ وحرف (RTX 4070،
         B760M، SN580، AG400). إن ذُكر في المسار طرازٌ من العائلة نفسها
         برقمٍ مختلف فهو منتجٌ آخر. */
      const model = name.match(/\b(?:RTX|GTX|RX)\s?(\d{3,4})\b/);
      if (model) {
        const inUrl = [...slug.matchAll(/\b(?:rtx|gtx|rx)[\s-]?(\d{3,4})\b/g)].map((m) => m[1]);
        if (inUrl.length && !inUrl.includes(model[1])) {
          add(`الطراز: قطعتنا ${model[0]} والمسار يذكر ${[...new Set(inUrl)].join('، ')}`);
        }
      }

      /* ٤ — عائلة Ryzen: «Ryzen 5» في اسمنا و«ryzen-7» في المسار تعارضٌ
         صريح، وقد وقع فعلاً على 9600X. */
      const ryz = name.match(/RYZEN\s?([3579])\b/);
      if (ryz) {
        const inUrl = [...slug.matchAll(/ryzen[\s-]?([3579])\b/g)].map((m) => m[1]);
        if (inUrl.length && !inUrl.includes(ryz[1])) {
          add(`العائلة: قطعتنا Ryzen ${ryz[1]} والمسار يذكر Ryzen ${[...new Set(inUrl)].join('، ')}`);
        }
      }
    }
  }

  console.log(`\nفُحص ${checked} رابطاً وصفيّاً · تُخطّي ${skipped} (أمازون: مسارٌ مُرمَّز لا يُقرأ)`);

  if (!flags.length) {
    console.log(`\n${G}لا تعارض${X}`);
  } else {
    const byWhy: Record<string, Flag[]> = {};
    flags.forEach((f) => (byWhy[f.why.split(':')[0]] ||= []).push(f));
    for (const [kind, list] of Object.entries(byWhy)) {
      console.log(`\n${Y}── ${kind} (${list.length}) ──${X}`);
      list.forEach((f) => {
        console.log(`  ${R}✘${X} [${f.cat}] ${f.part}  ${D}· ${f.store}${X}`);
        console.log(`      ${f.why}`);
        console.log(`      ${D}${f.url.slice(0, 108)}${X}`);
      });
    }
  }

  console.log(`\n${'─'.repeat(58)}\nمشتبهٌ بها: ${flags.length}`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
