/**
 * ============ سدّ ثغرة vram ============
 *
 * ظهرت أثناء إعادة تصميم جدول المواصفات: كرتان لا يحملان مفتاح `vram`
 * إطلاقاً — RX 6600 XT وRX 6700 XT — فسقط عنهما شريط المواصفات العلوي،
 * وسقطت معه شارةُ السعة في بطاقات القطع.
 *
 * القيمة تُقرأ من اسم القطعة نفسه لا من تخمين: «RX 6600 XT 8GB» → 8GB.
 * وما لا سعةَ في اسمه يُترك ويُبلَّغ عنه.
 *
 *   node scripts/fix-missing-vram.mjs            # عرض فقط
 *   node scripts/fix-missing-vram.mjs --apply    # تطبيق مع نسخة احتياطية
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');

// القيمة من اسم القطعة نفسه — لا تخمين
const targets = await prisma.component.findMany({
  where: { category: { name: 'GPU' } },
  select: { id:true, name:true, specs:true },
});
const fixes = [];
for (const c of targets) {
  const sp = c.specs || {};
  if (sp.vram) continue;
  const m = /(\d+)\s*GB/i.exec(c.name);
  if (!m) { console.log('⚠ لا سعة في الاسم:', c.name); continue; }
  fixes.push({ id: c.id, name: c.name, vram: `${m[1]}GB`, before: sp });
}
console.log(`كروت بلا vram: ${fixes.length}`);
fixes.forEach(f => console.log(`  ${f.name} → vram = ${f.vram}`));
if (!apply) { console.log('\n(تجربة فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(0); }
if (fixes.length === 0) { await prisma.$disconnect(); process.exit(0); }
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const path = `backups/gpu-vram-before-${stamp}.json`;
writeFileSync(path, JSON.stringify(fixes.map(f => ({ id: f.id, name: f.name, specs: f.before })), null, 2));
console.log('نسخة احتياطية:', path);
for (const f of fixes) {
  await prisma.component.update({ where: { id: f.id }, data: { specs: { ...f.before, vram: f.vram } } });
  console.log('✔', f.name);
}
await prisma.$disconnect();
