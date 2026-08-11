import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * ============ بلاغ فرق سعر ============
 *
 * مفتوح للزوّار بلا تسجيل: من يكتشف الفرق هو من فتح المتجر للتوّ، وإلزامه
 * بإنشاء حساب في تلك اللحظة يعني ألّا يُبلّغ أحد. والمقابل حدٌّ للسبام.
 */

let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(8, '1 h'),
    analytics: true,
  });
} catch {
  console.warn('Upstash غير مهيأ — تخطّي rate limit على بلاغات الأسعار.');
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const userId = (token?.id as string) || null;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (ratelimit) {
      const { success } = await ratelimit.limit(userId ? `pricerep_${userId}` : `pricerep_ip_${ip}`);
      if (!success) {
        return NextResponse.json({ message: 'أرسلت بلاغات كثيرة. جرّب بعد قليل.' }, { status: 429 });
      }
    }

    const body = await req.json().catch(() => null);
    const offerId = typeof body?.offerId === 'string' ? body.offerId : '';
    if (!offerId || offerId.length > 100) {
      return NextResponse.json({ message: 'بيانات غير صالحة.' }, { status: 400 });
    }

    /* السعر المُبلَّغ اختياري، ونقبله فقط ضمن مدى معقول: رقم خارجه يعني
       خطأ كتابة أو عبثاً، وتخزينه يضلّل المراجعة بدل أن يعينها. */
    let reportedPrice: number | null = null;
    if (body?.reportedPrice != null && body.reportedPrice !== '') {
      const n = Number(body.reportedPrice);
      if (!Number.isFinite(n) || n <= 0 || n > 200000) {
        return NextResponse.json({ message: 'السعر المُدخل غير معقول.' }, { status: 400 });
      }
      reportedPrice = Math.round(n * 100) / 100;
    }

    /* العرض هو مصدر الحقيقة لا ما يرسله العميل: componentId يُؤخذ من الصفّ
       نفسه، فلا يستطيع أحد ربط بلاغٍ بقطعة لا علاقة لها بالعرض. */
    const offer = await prisma.componentOffer.findUnique({
      where: { id: offerId },
      select: { id: true, componentId: true, price: true, store: { select: { active: true } } },
    });
    if (!offer || !offer.store.active) {
      return NextResponse.json({ message: 'العرض غير موجود.' }, { status: 404 });
    }

    /* بلاغ مفتوح على العرض نفسه؟ نرفع عدّاده. تعدّد المبلّغين عن الشيء
       نفسه إشارةٌ أقوى لا صفوفٌ أكثر — والأدمن يحتاج ترتيباً بالأهمّية. */
    const open = await prisma.priceReport.findFirst({
      where: { offerId, status: 'OPEN' },
    });

    if (open) {
      await prisma.priceReport.update({
        where: { id: open.id },
        data: {
          count: { increment: 1 },
          lastReportedAt: new Date(),
          // نُبقي أحدث رقم شاهده زائر — الأقرب زمناً أقرب للحقيقة
          ...(reportedPrice != null ? { reportedPrice } : {}),
        },
      });
    } else {
      await prisma.priceReport.create({
        data: {
          offerId,
          componentId: offer.componentId,
          reportedPrice,
          ourPrice: offer.price ?? 0,
          userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('فشل تسجيل بلاغ السعر:', error);
    return NextResponse.json({ message: 'تعذّر إرسال البلاغ.' }, { status: 500 });
  }
}
