/**
 * ============ أغلفة مقالاتٍ مستضافة عندنا بدل صورٍ مربوطة من مواقع أخرى — 2026-10-15 ============
 *
 * مراجعة رفض أدسنس: عشرة أدلّة (كلّ المؤرّخة 1/7) تستعمل **الرابط نفسه** لصورةٍ مصغّرة من
 * encrypted-tbn0.gstatic.com (ذاكرة بحث صور Google)، وخبر الأسعار صورته من arabhardware.net،
 * وخبر RTX 50 SUPER من gstatic أيضاً. الربط من الخارج إشارة نسخ، وينكسر متى شاء صاحبه.
 *
 * والبديل أغلفةٌ فريدة رُسمت بخطّ الموقع وألوانه (public/covers/<id>.png، 1200×630 تصلح
 * لمعاينات المشاركة) — لكلّ مقالٍ عنوانه وأيقونة موضوعه.
 *
 * ⚠️ يُشغَّل بـ--apply **بعد** رفع public/covers إلى الإنتاج: القاعدة هي قاعدة الإنتاج، وتشغيله
 * قبل الرفع يكسر صور المقالات في الموقع الحيّ (الملفّات لم تصله بعد). السكربت يتحقّق من ذلك.
 *
 *   node scripts/use-local-covers-2026-10-15.mjs           # عرض
 *   node scripts/use-local-covers-2026-10-15.mjs --apply   # تنفيذ (بعد الرفع)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync, existsSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const rows = await prisma.news.findMany({ select: { id: true, title: true, imageUrl: true } });
const targets = rows.filter((r) => /gstatic\.com|arabhardware\.net/.test(r.imageUrl || ''));
if (!targets.length) { console.log('لا صور مربوطة من الخارج — مُنفَّذٌ سابقاً'); await prisma.$disconnect(); process.exit(0); }

let missing = 0;
for (const r of targets) {
  const local = `public/covers/${r.id}.png`;
  const ok = existsSync(local);
  if (!ok) missing++;
  console.log(`${ok ? '✓' : '⛔ لا ملف'} ${r.title.slice(0, 50)}  ←  /covers/${r.id}.png`);
}
if (missing) { console.log(`\n⛔ ${missing} غلافاً غير موجود محلّياً`); await prisma.$disconnect(); process.exit(1); }

if (!apply) { console.log(`\n(عرضٌ فقط — ${targets.length} مقالاً. أضف --apply بعد رفع public/covers)`); await prisma.$disconnect(); process.exit(0); }

/* حارس الإنتاج: الغلاف يجب أن يُخدَم من الموقع الحيّ قبل أن تشير إليه القاعدة */
const probe = await fetch(`https://tajme3ti.com/covers/${targets[0].id}.png`, { method: 'HEAD' });
if (!probe.ok) { console.log(`⛔ الأغلفة لم تصل الإنتاج بعد (${probe.status}) — ارفع أوّلاً`); await prisma.$disconnect(); process.exit(1); }

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/use-local-covers-${stamp}.json`, JSON.stringify(targets, null, 2));
for (const r of targets) await prisma.news.update({ where: { id: r.id }, data: { imageUrl: `/covers/${r.id}.png` } });
console.log(`\n✔ نُفّذ (${targets.length}) — النسخة في backups/use-local-covers-${stamp}.json`);
await prisma.$disconnect();
