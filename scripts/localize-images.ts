/* ============ استضافة صور القطع عندنا بدل جلبها من المتجر ============
 *
 * ⚠️ السبب مقيسٌ لا مفترَض: بروكسي الصور على الإنتاج يردّ **502 «upstream
 * error»** لكل صورة من مايكرولس، بينما يردّ 200 لأمازون وكازاسوق — ومن
 * جهازي تنجح الثلاثة. أي أنّ مايكرولس يرفض الجلب من خوادم Vercel تحديداً.
 * والرفض ليس بسبب الترويسة: جُرّب الطلب بترويسة البوت التي يرسلها البروكسي
 * فعاد 200 من جهازي (والطلب بلا ترويسة User-Agent وحده يعود 403).
 *
 * فالصور تُنزَّل مرّةً وتُحفظ في `public/images/parts/`، ويصير `imageUrl`
 * مساراً محليّاً — و`productImage` تُعيد المسارات المحلية كما هي بلا بروكسي.
 * وهذا يحقّق ما أراده البروكسي أصلاً (صورةٌ من نطاقنا، لا ربطٌ ساخن بنطاق
 * غيرنا) بلا اعتمادٍ على متجرٍ قد يحجبنا.
 *
 *   npx tsx scripts/localize-images.ts <slug-or-all> [--commit]
 */

import 'dotenv/config';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const DIR = join(process.cwd(), 'public', 'images', 'parts');

/** أبعاد الصورة من ترويسة الملفّ — لا نصدّق `content-type` وحده */
function dims(b: Buffer): [number, number] | null {
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 8) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return [0, 0];
  return null;
}

const slugify = (brand: string, name: string) =>
  `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

async function main() {
  const commit = process.argv.includes('--commit');
  const only = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'all';

  const comps = await prisma.component.findMany({
    where: only === 'all'
      ? { imageUrl: { contains: 'microless' } }
      : { id: only },
    select: { id: true, brand: true, name: true, imageUrl: true },
  });
  console.log(commit ? '== كتابة ==' : `${D}== تجربة بلا كتابة (أضف --commit) ==${X}`);
  console.log(`${comps.length} قطعة صورتُها من مايكرولس\n`);

  if (commit) mkdirSync(DIR, { recursive: true });
  let ok = 0, bad = 0;

  for (const c of comps) {
    const ext = (c.imageUrl!.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i)?.[1] || 'jpg').toLowerCase();
    const file = `${slugify(c.brand, c.name)}.${ext === 'jpeg' ? 'jpg' : ext}`;
    try {
      const res = await fetch(c.imageUrl!, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error(`ليست صورة (${type})`);
      const buf = Buffer.from(await res.arrayBuffer());
      const d = dims(buf);
      if (!d) throw new Error('تعذّرت قراءة الأبعاد');
      if (d[0] > 0 && d[0] < 200) throw new Error(`دقّة منخفضة جداً ${d[0]}×${d[1]}`);

      if (commit) {
        writeFileSync(join(DIR, file), buf);
        await prisma.component.update({ where: { id: c.id }, data: { imageUrl: `/images/parts/${file}` } });
      }
      ok++;
      console.log(`  ${G}✔${X} ${String(Math.round(buf.length / 1024)).padStart(4)}KB ${String(d[0] || '?').padStart(4)}×${String(d[1] || '?').padEnd(4)} ${D}/images/parts/${file}${X}`);
    } catch (e: any) {
      bad++;
      console.log(`  ${R}✘ ${c.brand} ${c.name} — ${e.message}${X}`);
    }
  }
  console.log(`\nRESULT نُقلت=${ok} فشلت=${bad}`);
  await prisma.$disconnect();
  if (bad) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
