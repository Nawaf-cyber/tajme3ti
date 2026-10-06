import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  PLATFORMS, AFFILIATE, LIMITS, normalizeWebsite, isValidEmail, isValidPhone, clean,
} from '../../../lib/store-application';

// حماية من السبام: ٣ طلبات في الساعة لكل عنوان — المتجر يُرسل مرّةً واحدة
let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
  });
} catch {
  console.warn('Upstash غير مهيأ — تخطّي rate limit على طلبات المتاجر.');
}

const bad = (message: string, field?: string) => NextResponse.json({ message, field }, { status: 400 });

/* ============ إرسال طلب انضمام متجر ============
   متاحٌ بلا حساب. والتحقّق هنا هو الحقيقيّ — تحقّق النموذج للراحة فقط. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return bad('طلبٌ غير صالح.');

    /* فخّ الروبوتات: حقلٌ مخفيّ لا يراه الإنسان. إن امتلأ نردّ بنجاحٍ
       ولا نحفظ — فلا يعرف الروبوت أنّه كُشف فيغيّر أسلوبه. */
    if (typeof body.company === 'string' && body.company.trim()) {
      return NextResponse.json({ message: 'تم استلام طلبك.' }, { status: 201 });
    }

    const storeName = clean(body.storeName, LIMITS.short);
    if (!storeName || storeName.length < 2) return bad('اكتب اسم المتجر.', 'storeName');

    const site = normalizeWebsite(typeof body.website === 'string' ? body.website : '');
    if (!site) return bad('رابط المتجر غير صحيح — مثال: mystore.com', 'website');

    const contactName = clean(body.contactName, LIMITS.short);
    if (!contactName || contactName.length < 2) return bad('اكتب اسم المسؤول.', 'contactName');

    const contactEmail = clean(body.contactEmail, 120)?.toLowerCase() ?? '';
    if (!isValidEmail(contactEmail)) return bad('البريد الإلكتروني غير صحيح.', 'contactEmail');

    const contactPhone = clean(body.contactPhone, 30);
    if (contactPhone && !isValidPhone(contactPhone)) return bad('رقم الجوال غير صحيح.', 'contactPhone');

    const platform = PLATFORMS.some((p) => p.value === body.platform) ? (body.platform as string) : null;
    if (!platform) return bad('اختر منصّة المتجر.', 'platform');

    const affiliate = AFFILIATE.some((a) => a.value === body.affiliate) ? (body.affiliate as string) : null;

    /* ============ التكرار ============
       ١) متجرٌ معروضٌ عندنا فعلاً — Store.domain قد يحمل أكثر من نطاق
          مفصولة بفاصلة («amazon.sa,amazon.com»).
       ٢) طلبٌ سابق لم يُبتّ فيه — لا نُنشئ ثانياً، ونخبره أنّه مسجّل.
       الطلب المرفوض لا يمنع طلباً جديداً: ربّما تغيّر حال المتجر. */
    const stores = await prisma.store.findMany({ where: { domain: { not: null } }, select: { domain: true } });
    const listed = stores.some((s) =>
      s.domain!.split(',').map((d) => d.trim().toLowerCase().replace(/^www\./, '')).includes(site.host)
    );
    if (listed) {
      return NextResponse.json({ message: 'متجرك معروضٌ لدينا فعلاً. للتعديل راسلنا من صفحة «اتصل بنا».', listed: true }, { status: 409 });
    }

    const pending = await prisma.storeApplication.findFirst({
      where: { host: site.host, status: { in: ['NEW', 'REVIEWING'] } },
      select: { id: true },
    });
    if (pending) {
      return NextResponse.json({ message: 'طلب هذا المتجر مسجّلٌ لدينا مسبقاً، وسنتواصل معكم.', alreadySubmitted: true }, { status: 200 });
    }

    /* الحدّ هنا لا في أوّل المسار: يُحسب ما سيُحفظ فقط. في أوّله كان
       المتجر الذي يخطئ في بريده ثلاث مرّاتٍ يُقفَل ساعةً كاملة — والطلب
       المرفوض لا يكلّفنا شيئاً أصلاً. */
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (ratelimit) {
      const { success } = await ratelimit.limit(`storeapp_ip_${ip}`);
      if (!success) {
        return NextResponse.json({ message: 'أرسلت طلبات كثيرة. جرّب بعد ساعة.' }, { status: 429 });
      }
    }

    await prisma.storeApplication.create({
      data: {
        storeName,
        website: site.url,
        host: site.host,
        contactName,
        contactEmail,
        contactPhone,
        platform,
        cities: clean(body.cities, LIMITS.medium),
        warranty: clean(body.warranty, LIMITS.medium),
        productList: body.productList === true,
        affiliate,
        notes: clean(body.notes, LIMITS.notes),
      },
    });

    return NextResponse.json({ message: 'تم استلام طلبك. سنراجعه ونتواصل معكم على البريد.' }, { status: 201 });
  } catch (error) {
    console.error('🔴 خطأ في طلب انضمام متجر:', error);
    return NextResponse.json({ message: 'حدث خطأ في السيرفر.' }, { status: 500 });
  }
}
