/**
 * ============ تعديل مواصفةٍ على قطعة قائمة ============
 *
 * يحدث كثيراً أن تظهر مواصفةٌ محقَّقة بعد إنشاء القطعة — من عنوان متجر أو
 * صفحة صانع فُتحت لاحقاً. وفتحُ لوحة الإدارة لتعديل حقل JSON يدوياً يدعو
 * إلى كسر بنيته.
 *
 * يطبع القبل والبعد ويحفظ نسخةً احتياطية قبل الكتابة.
 *
 *   npx tsx scripts/patch-specs.ts <componentId> radiatorSupport=360mm color=White
 *   npx tsx scripts/patch-specs.ts <componentId> --remove color
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

async function main() {
  const [id, ...rest] = process.argv.slice(2);
  if (!id || rest.length === 0) {
    console.error('استعمال: npx tsx scripts/patch-specs.ts <componentId> <key>=<value> …');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const comp = await prisma.component.findUnique({
    where: { id },
    select: { id: true, brand: true, name: true, specs: true },
  });
  if (!comp) { console.error(`⛔ قطعة غير موجودة: ${id}`); process.exit(1); }

  const before = (comp.specs || {}) as Record<string, string>;
  const after: Record<string, string> = { ...before };

  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--remove') { delete after[rest[++i]]; continue; }
    const eq = rest[i].indexOf('=');
    if (eq < 0) { console.error(`⛔ صيغة غير مفهومة: ${rest[i]}`); process.exit(1); }
    after[rest[i].slice(0, eq)] = rest[i].slice(eq + 1);
  }

  console.log(`${comp.brand} ${comp.name}`);
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  for (const k of keys) {
    const b = before[k], a = after[k];
    if (b === a) continue;
    console.log(`   ${k}: ${b ?? '—'}  →  ${a ?? '(حُذف)'}`);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/specs-patch-${comp.id}-${stamp}.json`, JSON.stringify({ id: comp.id, before }, null, 2));
  await prisma.component.update({ where: { id }, data: { specs: after } });
  console.log(`✔ كُتبت (نسخة احتياطية: backups/specs-patch-${comp.id}-${stamp}.json)`);

  await prisma.$disconnect();
}

main();
