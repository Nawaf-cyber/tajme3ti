/**
 * ============ حذف «تجميعة RTX 5060 Ti» — 2026-10-27 ============
 *
 * بعد add-prebuilds-2026-10-27 صارت أغلى من «تجميعة ألعاب 1440p» (٩٬٠٧٤ مقابل ٨٬٧٠٠) وكرتها
 * أبطأ (73 مقابل 104 فريم في 1440p). قرار نوّاف: «احذف القديمة». نسخةٌ كاملة في backups/ أوّلاً.
 *
 *   npx tsx scripts/delete-prebuild-5060ti-2026-10-27.ts           # عرض
 *   npx tsx scripts/delete-prebuild-5060ti-2026-10-27.ts --apply
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const ID = 'cms8ggcro000005lb070zubod';
(async () => {
  const p = await prisma.prebuild.findUnique({ where: { id: ID } });
  if (!p) { console.log('غير موجودة — حُذفت مسبقاً'); await prisma.$disconnect(); return; }
  if (p.title !== 'تجميعة RTX 5060 Ti') throw new Error(`عنوانٌ غير متوقّع: ${p.title}`);
  console.log(`${p.title} · ${p.budgetType} · ${p.price}`);
  if (process.argv.includes('--apply')) {
    const file = `backups/delete-prebuild-5060ti-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
    writeFileSync(file, JSON.stringify(p, null, 2));
    await prisma.prebuild.delete({ where: { id: ID } });
    console.log(`حُذفت (النسخة في ${file})`);
  } else console.log('(عرضٌ فقط — أضف --apply)');
  console.log('الباقي:', (await prisma.prebuild.findMany({ select: { title: true }, orderBy: { price: 'asc' } })).map((x) => x.title).join('، '));
  await prisma.$disconnect();
})();
