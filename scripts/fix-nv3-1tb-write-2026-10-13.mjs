/**
 * Kingston NV3 1TB (SNV3S/1000G): سرعة الكتابة 4000 لا 5000 ميجابايت/ث.
 * 5000 هي للسعتين 2TB و4TB؛ والـ1TB كتابتها 4000 — كما في عنوان صفحة مايكرولس
 * نفسها («6000 MB/s sequential read 4000 MB/s sequential write … 320 TBW …
 * snv3s-1000g»). كُشف 2026-10-13 أثناء مراجعة طلب قطعة طلبها زائرٌ وهي موجودة.
 * التشغيل: node scripts/fix-nv3-1tb-write-2026-10-13.mjs [--apply]
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const ID = 'cmr3fmu4a000404lhu1iu5ptw';
const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const c = await prisma.component.findUnique({ where: { id: ID }, select: { id: true, brand: true, name: true, specs: true, description: true } });
if (!c || c.name !== 'NV3 1TB') throw new Error('القطعة ليست NV3 1TB — توقّف');

const specs = { ...c.specs, writeSpeed: '4000 MB/s' };
const description = c.description.replace('قراءة 6000 وكتابة 5000 ميجابايت/ث', 'قراءة 6000 وكتابة 4000 ميجابايت/ث');

console.log('writeSpeed:', c.specs.writeSpeed, '→', specs.writeSpeed);
console.log('الوصف تغيّر:', description !== c.description);
if (description === c.description) throw new Error('لم يُعثر على عبارة السرعة في الوصف — توقّف');

if (!APPLY) {
  console.log('(تجربة — أضف --apply للكتابة)');
} else {
  const backup = `backups/nv3-1tb-write-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(backup, JSON.stringify(c, null, 2));
  await prisma.component.update({ where: { id: ID }, data: { specs, description } });
  console.log('كُتب. النسخة الاحتياطيّة:', backup);
}
await prisma.$disconnect();
