// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// المسارات الإدارية التي تتطلب صلاحية ADMIN
const ADMIN_PAGE_PREFIX = '/admin';
const ADMIN_API_PREFIXES = ['/api/admin', '/api/clean-duplicates', '/api/get-components'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith(ADMIN_PAGE_PREFIX);
  const isAdminApi = ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = await getToken({ req });

  // غير مسجّل دخول
  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }
    const url = new URL('/api/auth/signin', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // مسجّل لكن ليس أدمن
  if (token.role !== 'ADMIN') {
    if (isAdminApi) {
      return NextResponse.json({ message: 'صلاحيات غير كافية' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/clean-duplicates', '/api/get-components'],
};
