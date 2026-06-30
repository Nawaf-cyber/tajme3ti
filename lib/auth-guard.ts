// lib/auth-guard.ts
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

// التحقق من جلسة المستخدم (لصفحات/مسارات تتطلب تسجيل دخول فقط)
export async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) return null;
  return { session, userId, role: (session.user as any)?.role as string | undefined };
}

// التحقق من صلاحية الأدمن اعتماداً على حقل role في قاعدة البيانات (وليس قائمة إيميلات)
export async function requireAdmin() {
  const auth = await requireUser();
  if (!auth || auth.role !== 'ADMIN') return null;
  return auth;
}

// نسخة لمسارات الـ API التي تستقبل NextRequest (تعتمد على JWT token مباشرة)
export async function requireAdminToken(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== 'ADMIN') return null;
  return token;
}

// حماية مسارات الكرون عبر سر مشترك في الـ Authorization header
export function isValidCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // إن لم يُضبط السر، ارفض دائماً
  const header = req.headers.get('authorization') || '';
  return header === `Bearer ${secret}`;
}
