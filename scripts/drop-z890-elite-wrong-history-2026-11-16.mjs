/**
 * حذف تاريخ سعرٍ خاطئ لـ«Gigabyte Z890 AORUS Elite WiFi7» (…0eke3e) — بإذن نوّاف 2026-11-16.
 *
 * كلّ قراءاته قبل تصحيح الرابط (scripts/add-noon-second-sources-2026-11-16.ts) كانت لقطعٍ أخرى:
 *   · أمازون ١٠٦ قراءة (2026-07-25 → 11-16) من B0DK7LZB1Q = نسخة **ICE** البيضاء (ولها قطعةٌ مستقلّة)
 *   · مايكرولس ٦٩ قراءة (2026-07-25 → 10-08) من عرض Z890M AORUS Elite WiFi7 ICE نُقل في add-batch5-2026-10-08
 * فكانت صفحة القطعة تقول «أدنى ما بلغته 1,131 وسعر اليوم أعلى بـ28%» عن لوحةٍ غيرها.
 * يبقى ما بعد التصحيح (أمازون B0DJP95MGB، 1,444).
 *
 *   node scripts/drop-z890-elite-wrong-history-2026-11-16.mjs           # عرض
 *   node scripts/drop-z890-elite-wrong-history-2026-11-16.mjs --apply   # نسخة ثمّ حذف
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const ID = 'cmr2k5vs40005jgymmq0eke3e';
const FIXED_AT = new Date('2026-11-16T14:38:30Z'); // لحظة تصحيح الرابط
const where = { componentId: ID, recordedAt: { lt: FIXED_AT } };
const rows = await prisma.priceHistory.findMany({ where, orderBy: { recordedAt: 'asc' } });
console.log(`${rows.length} قراءة قبل التصحيح`);
if (apply && rows.length) {
  const file = `backups/z890-elite-wrong-history-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  writeFileSync(file, JSON.stringify(rows, null, 1));
  const { count } = await prisma.priceHistory.deleteMany({ where });
  console.log(`نسخة: ${file}\nحُذف ${count}`);
}
console.log('الباقي:', (await prisma.priceHistory.findMany({ where: { componentId: ID } })).map(r => `${r.store} ${r.price}`));
await prisma.$disconnect();
