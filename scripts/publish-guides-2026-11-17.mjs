/**
 * 2026-11-17 — نشر أدلّة أدسنس: عشرة أدلّة موسّعة ودليلان جديدان (نوّاف: «اختر الي تشوفها + سو التحسينات»).
 *
 * السبب: رُفض أدسنس «محتوى منخفض القيمة»، وعشرة من الأدلّة الخمسة عشر كانت ٢٦٠–٣٣٠ كلمة.
 * النصوص في scripts/data/guides-2026-11-17.json (ونسخة المراجعة _share/guides-2026-11-17.md):
 * كتبها أربعة وكلاء من لقطة الكتالوج 2026-11-17 (الأسعار) وlib/gpu-perf (الإطارات) وجدول
 * «شاشة تلائم كرتك»، وروجعت: لا Markdown، ٨٩٧–١٬٣٣٨ كلمة، وأرقام الاستهلاك الرسميّة صحيحة.
 * الموسّعة تُحدَّث في مكانها (المعرّف والتاريخ كما هما، فالروابط المفهرسة لا تتغيّر)؛ والجديدان
 * يُنشآن بفئة «دليل».
 *
 *   node scripts/publish-guides-2026-11-17.mjs           # عرض
 *   node scripts/publish-guides-2026-11-17.mjs --apply   # نسخة احتياطيّة ثمّ نشر
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const { expanded, created } = JSON.parse(readFileSync('scripts/data/guides-2026-11-17.json', 'utf8'));

/* صورتا الجديدين من أدلّةٍ قائمة في الموضوع نفسه */
const IMAGE = {
  'monitor-per-gpu': '/covers/cmr1jbte40004x8ymngej7ufc.png',
  'budget-builds-2026-11': 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const bad = (g) => /(^|\n)\s*(#|[-*] |\d+\. )|\*\*|`/.test(g.content) || words(g.content) < 800 || !g.title || !g.summary;

const before = await prisma.news.findMany({ where: { id: { in: expanded.map((g) => g.id) } } });
if (before.length !== expanded.length) throw new Error(`وُجد ${before.length} من ${expanded.length}`);
for (const g of [...expanded, ...created]) if (bad(g)) throw new Error(`مرفوض: ${g.title}`);
for (const g of created) {
  if (!IMAGE[g.key]) throw new Error(`بلا صورة: ${g.key}`);
  const dup = await prisma.news.findFirst({ where: { title: g.title } });
  if (dup) throw new Error(`موجود: ${g.title}`);
}
for (const g of expanded) {
  const b = before.find((x) => x.id === g.id);
  console.log(`✎ ${words(b.content)} → ${words(g.content)} كلمة · ${g.title}`);
}
for (const g of created) console.log(`＋ ${words(g.content)} كلمة · ${g.title}`);
if (!apply) { console.log('(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }

const file = `backups/guides-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
writeFileSync(file, JSON.stringify(before, null, 1));
for (const g of expanded) await prisma.news.update({ where: { id: g.id }, data: { title: g.title, summary: g.summary, content: g.content } });
const ids = [];
for (const g of created) {
  const n = await prisma.news.create({ data: { title: g.title, summary: g.summary, content: g.content, category: 'دليل', imageUrl: IMAGE[g.key] } });
  ids.push(n.id);
}
console.log(`نسخة: ${file}\n✔ حُدّث ${expanded.length} · أُنشئ ${created.length}: ${ids.join(' ')}`);
await prisma.$disconnect();
