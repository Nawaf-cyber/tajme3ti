// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';

import { PrismaPg } from '@prisma/adapter-pg';



const globalForPrisma = global as unknown as { prisma: PrismaClient };



// دالة لإنشاء الاتصال مع الـ Adapter

const createPrismaClient = () => {

  const connectionString = process.env.DATABASE_URL as string;

  const pool = new Pool({ connectionString });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });

};



// استخدام اتصال موجود في الذاكرة، أو إنشاء واحد جديد

export const prisma = globalForPrisma.prisma ?? createPrismaClient();



// حفظ الاتصال في الذاكرة لبيئة التطوير لمنع تكرار الاتصالات

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;