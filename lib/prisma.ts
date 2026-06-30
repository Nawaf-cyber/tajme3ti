// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 (engine type "client") يتطلب adapter.
// نمرّر connectionString مباشرة للـ adapter — وهو يدير تجميع الاتصالات داخلياً،
// فلا حاجة لإنشاء Pool يدوي منفصل (الذي كان يفتح قنوات زائدة ويسبب P1017).
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// عميل واحد فقط يُعاد استخدامه عبر كل الطلبات، مثبّت في كل البيئات
// (وليس في التطوير فقط) لمنع استنزاف اتصالات Neon في الإنتاج (serverless).
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
