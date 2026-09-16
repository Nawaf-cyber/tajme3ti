import { NextRequest, NextResponse } from 'next/server';
import { IMAGE_HOSTS } from '../../../lib/image-hosts';

export const runtime = 'nodejs';

/**
 * بروكسي صور بقائمة بيضاء صارمة.
 * السبب الوحيد لوجوده: تصدير المقارنة كصورة.
 * الصور الخارجية تلوّث الـ canvas (CORS) فيفشل toPng.
 * تمريرها عبر نطاقنا يجعلها same-origin.
 *
 * ⚠️ لا تفتح هذا للنطاقات الحرّة — يصير open proxy يُساء استخدامه.
 */
/* ⚠️ والقائمة نفسها في lib/image-hosts.ts — لا نسخةَ هنا. كانت نسختين
   فتباعدتا: نطاق نون أُضيف إلى ساحب الصور وحده، فصارت صورُه تُحفظ ثمّ
   يردّها هذا المسار 403. */

const MAX_BYTES = 3 * 1024 * 1024; // 3MB

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return new NextResponse('missing url', { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new NextResponse('bad url', { status: 400 });
  }

  if (target.protocol !== 'https:') {
    return new NextResponse('https only', { status: 400 });
  }

  if (!IMAGE_HOSTS.has(target.hostname)) {
    return new NextResponse('host not allowed', { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Tajme3tiBot/1.0)' },
      // تخزين مؤقت على مستوى Vercel — الصور لا تتغيّر
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return new NextResponse('upstream error', { status: 502 });
    }

    const type = upstream.headers.get('content-type') || '';
    if (!type.startsWith('image/')) {
      return new NextResponse('not an image', { status: 415 });
    }

    const buf = await upstream.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return new NextResponse('too large', { status: 413 });
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    });
  } catch {
    return new NextResponse('fetch failed', { status: 502 });
  }
}