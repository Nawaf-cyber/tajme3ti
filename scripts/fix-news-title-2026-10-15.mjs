/**
 * ============ خبرٌ عنوانه «كروت انفيديا.» — 2026-10-15 ============
 *
 * ظهر في مراجعة رفض أدسنس: العنوان كلمتان ونقطة، والعنوان الحقيقيّ كُتب في حقل
 * الملخّص. فيُنقل الملخّص عنواناً، ويُكتب ملخّصٌ من أوّل المقال (لا جديد فيه).
 *
 *   node scripts/fix-news-title-2026-10-15.mjs           # عرض
 *   node scripts/fix-news-title-2026-10-15.mjs --apply   # تنفيذ
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

const ID = 'cmsdmucuy000004l7fvr1odh4';
const NEW_TITLE = 'تسريبات جديدة: بطاقات NVIDIA RTX 50 SUPER تقترب.. ولكن الإطلاق قد يتأخر';
const NEW_SUMMARY = 'بدأت التسريبات حول سلسلة NVIDIA GeForce RTX 50 SUPER تتزايد، وتشير إلى تحديثٍ يركّز على زيادة سعة الذاكرة الرسومية (VRAM) أكثر من الأداء الخام.';

const n = await prisma.news.findUnique({ where: { id: ID } });
if (!n) { console.log('⛔ الخبر غير موجود'); await prisma.$disconnect(); process.exit(1); }
if (n.title === NEW_TITLE) { console.log('مُصحَّحٌ سابقاً'); await prisma.$disconnect(); process.exit(0); }
if (n.title !== 'كروت انفيديا.' || n.summary !== NEW_TITLE) { console.log(`⛔ تغيّر الخبر: «${n.title}» / «${n.summary.slice(0, 60)}»`); await prisma.$disconnect(); process.exit(1); }

console.log(`العنوان: «${n.title}» ← «${NEW_TITLE}»`);
console.log(`الملخّص: «${n.summary}» ← «${NEW_SUMMARY}»`);
if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`backups/fix-news-title-${stamp}.json`, JSON.stringify({ id: n.id, title: n.title, summary: n.summary }, null, 2));
await prisma.news.update({ where: { id: ID }, data: { title: NEW_TITLE, summary: NEW_SUMMARY } });
console.log(`\n✔ نُفّذ — النسخة في backups/fix-news-title-${stamp}.json`);
await prisma.$disconnect();
