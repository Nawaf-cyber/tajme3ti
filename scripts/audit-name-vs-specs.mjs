/**
 * ============ هل يطابق الاسمُ المواصفات؟ ============
 *
 * اسم القطعة يحمل أرقامها الحاسمة (السعة، السرعة، الذاكرة). فحين يقول
 * الاسم 6000MHz وتقول المواصفة 5600، أحدهما خطأ — والزائر يقرأ الاثنين
 * في الصفحة نفسها. هذا الفحص يقارنهما ولا يُصلح: التصحيح يحتاج مرجعاً.
 *
 *   node scripts/audit-name-vs-specs.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const parse = (s) => { try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { return {}; } };
const num = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || null;

const comps = await prisma.component.findMany({ include: { category: { select: { name: true } } }, orderBy: { name: 'asc' } });
const issues = [];

for (const c of comps) {
  const s = parse(c.specs);
  const cat = c.category?.name;
  const name = c.name;

  if (cat === 'RAM') {
    const mS = name.match(/(\d{4})\s*MHz/i);
    if (mS && num(s.speed) && num(s.speed) !== Number(mS[1]))
      issues.push({ c: cat, n: name, k: 'speed', name: mS[1], spec: s.speed });
    const mC = name.match(/(\d+)\s*GB/i);
    if (mC && num(s.capacity) && num(s.capacity) !== Number(mC[1]))
      issues.push({ c: cat, n: name, k: 'capacity', name: mC[1] + 'GB', spec: s.capacity });
  }

  if (cat === 'GPU') {
    const m = name.match(/(\d+)\s*GB/i);
    if (m && num(s.vram) && num(s.vram) !== Number(m[1]))
      issues.push({ c: cat, n: name, k: 'vram', name: m[1] + 'GB', spec: s.vram });
  }

  if (cat === 'Storage') {
    const m = name.match(/(\d+)\s*(TB|GB)/i);
    if (m && s.capacity && String(s.capacity).replace(/\s/g, '').toUpperCase() !== (m[1] + m[2]).toUpperCase())
      issues.push({ c: cat, n: name, k: 'capacity', name: m[1] + m[2], spec: s.capacity });
  }

  if (cat === 'PSU') {
    const m = name.match(/(\d{3,4})\s*W?/);
    if (m && num(s.wattage) && Math.abs(num(s.wattage) - Number(m[1])) > 0 && Number(m[1]) >= 400)
      issues.push({ c: cat, n: name, k: 'wattage', name: m[1], spec: s.wattage });
  }
}

console.log(`تناقضات بين الاسم والمواصفة: ${issues.length}\n`);
for (const i of issues) console.log(`   ${i.c}/${i.n.slice(0, 36).padEnd(38)} ${i.k}: الاسم «${i.name}» · المواصفة «${i.spec}»`);
if (!issues.length) console.log('   ✅ لا تناقض.');
await prisma.$disconnect();
process.exit(issues.length ? 1 : 0);
