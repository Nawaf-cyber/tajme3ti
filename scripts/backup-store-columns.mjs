/**
 * نسخة احتياطية كاملة لأعمدة المتاجر قبل الترحيل إلى جدول Store/ComponentOffer.
 * تُخرج ملف JSON يمكن استعادة القاعدة منه سطراً بسطر لو ساء أي شيء.
 *
 * التشغيل:  node scripts/backup-store-columns.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const rows = await prisma.component.findMany({
  select: {
    id: true, name: true, brand: true, price: true,
    amazonUrl: true, amazonPrice: true, amazonListPrice: true, amazonInStock: true,
    cazasouqUrl: true, cazasouqPrice: true, cazasouqListPrice: true, cazasouqInStock: true,
    cazasouqAffiliateUrl: true,
    microlessUrl: true, microlessPrice: true, microlessListPrice: true, microlessInStock: true,
  },
  orderBy: { id: 'asc' },
});

const dir = join(process.cwd(), 'backups');
mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const file = join(dir, `store-columns-${stamp}.json`);
writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), count: rows.length, rows }, null, 2), 'utf8');

const withUrl = (k) => rows.filter((r) => r[k]).length;
console.log(`✅ حُفظت ${rows.length} قطعة في ${file}`);
console.log(`   روابط: أمازون ${withUrl('amazonUrl')} · كازاسوق ${withUrl('cazasouqUrl')} · مايكرولس ${withUrl('microlessUrl')}`);
console.log(`   روابط تتبّع كازاسوق: ${withUrl('cazasouqAffiliateUrl')}`);

await prisma.$disconnect();
