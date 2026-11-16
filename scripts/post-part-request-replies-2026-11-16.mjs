/**
 * تنزيل ردود الإدارة على طلبات الزوّار — بطلب نوّاف 2026-11-16 («نزلها»).
 *
 * النصوص من _share/part-request-replies-2026-11-15.md (كلّ قسمٍ «### …» ردّ)، وتُكتب كما يكتبها
 * replyToPartRequest في app/admin/actions.ts: رسالة userId=null، ثمّ تحريك updatedAt للطلب
 * وتصفير seenAt لأصوات أصحابه كي تظهر لهم نقطة «ردّ جديد» في «تجميعاتي».
 * لا تُغيَّر حالة أيّ طلب (قرار نوّاف). وi5-10400 بلا ردّ جديد (له ردّان).
 * ولا يتكرّر: ردٌّ بالنصّ نفسه على الطلب نفسه يُتخطّى.
 *
 *   node scripts/post-part-request-replies-2026-11-16.mjs           # عرض
 *   node scripts/post-part-request-replies-2026-11-16.mjs --apply   # نسخة ثمّ تنزيل
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

/** عنوان القسم في الملف (بدايته) ← معرّفات الطلبات */
const MAP = [
  ['«جميع صناديق كمبيوتر ماجيستي»', ['cmv6ttcmn000b06l9vl610yda']],
  ['«Majsteay Power Supply»', ['cmuhu3ea6000504jsh323biuo']],
  ['«Majestay Speace C»', ['cmuhu2rr4000304js1s9st068']],
  ['«Gigabyte B850M Force WiFi 6E V2»', ['cmwhu1dxh000008l12xogruk3', 'cmwhu40lh000208l1yy7yufpp']],
  ['«Dost 60 plus ARGB ATX»', ['cmvg307br000607l4pi2utocv']],
  ['«Ryzen 7 5800»', ['cmuc28esc000204i4n548159i']],
  ['«3070ti»', ['cmu9vpy00000004l4l0qcab9r']],
  ['«Goxlr»', ['cmt4gynow000004jokioapnqo']],
  ['«Ram laptop»', ['cmsztc9d9000004jsn4e4jusw']],
  ['«اتمنى تضيفون متاجر اخرى', ['cmug2rf61000304k0cyobfuz9']],
];

const md = readFileSync('_share/part-request-replies-2026-11-15.md', 'utf8');
const sections = md.split(/\n### /).slice(1).map((s) => {
  const [head, ...rest] = s.split('\n');
  return { head, body: rest.join('\n').split('\n---')[0].trim() };
});

const todo = [];
for (const [prefix, ids] of MAP) {
  const sec = sections.find((s) => s.head.startsWith(prefix));
  if (!sec || !sec.body) throw new Error(`لا ردّ لـ ${prefix}`);
  if (sec.body.length > 400) throw new Error(`${prefix}: ${sec.body.length} حرفاً (الحدّ ٤٠٠)`);
  for (const id of ids) {
    const r = await prisma.requestedPart.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!r) throw new Error(`لا طلب ${id}`);
    const dup = await prisma.partRequestMessage.findFirst({ where: { requestedPartId: id, userId: null, body: sec.body } });
    if (dup) { console.log(`· نُزّل سابقاً: ${r.name}`); continue; }
    todo.push({ id, name: r.name, body: sec.body });
    console.log(`＋ ${r.name} (${sec.body.length} حرفاً)`);
  }
}

if (apply && todo.length) {
  const backup = await prisma.requestedPart.findMany({ where: { id: { in: todo.map((t) => t.id) } }, include: { messages: true, votes: true } });
  const file = `backups/part-request-replies-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`نسخة: ${file}`);
  for (const t of todo) {
    await prisma.partRequestMessage.create({ data: { requestedPartId: t.id, userId: null, body: t.body, seenByAdmin: true } });
    await prisma.requestedPart.update({ where: { id: t.id }, data: { updatedAt: new Date() } });
    await prisma.partVote.updateMany({ where: { requestedPartId: t.id, userId: { not: null } }, data: { seenAt: null } });
  }
}
console.log(apply ? `\nنُزّل ${todo.length} ردّاً.` : `\n${todo.length} ردّاً (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
