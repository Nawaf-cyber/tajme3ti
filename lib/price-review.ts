import type { PrismaClient } from '@prisma/client';
import { risePercent } from './price';
import { recordPriceHistory } from './scrape-prices';

/**
 * ============ طابور مراجعة الارتفاعات ============
 *
 * يكتبه مسارا السحب (الدورة الشاملة وتحديث قطعة واحدة)، ويقرؤه الأدمن.
 * منطقٌ واحد للمسارين — راجع درس تكرار منطق السحب.
 */

/* بعد الرفض لا نُعيد السؤال عن الرقم نفسه فوراً: المتجر سيعرضه في كل دورة،
   فيمتلئ الطابور بسؤال أجبتَ عنه. وبعد أسبوع نسأل مجدّداً — فقد يكون الرقم
   صار حقيقياً وارتفع السوق فعلاً. */
const REJECT_SILENCE_DAYS = 7;
/** فرق ٢٪ يُعدّ "الرقم نفسه" — المتاجر تحرّك الكسور بلا معنى */
const SAME_PRICE_TOLERANCE = 0.02;

const sameNumber = (a: number, b: number) => Math.abs(a - b) / Math.max(a, b) <= SAME_PRICE_TOLERANCE;

export type Hold = { offerId: string; storeName: string; oldPrice: number; newPrice: number };

/**
 * يسجّل الارتفاعات المعلَّقة ويُنهي ما بطل منها.
 * @returns عدد الأسئلة الجديدة التي أُضيفت فعلاً
 */
export async function recordPriceHolds(
  prisma: PrismaClient,
  componentId: string,
  holds: Hold[],
  settledOfferIds: string[],
): Promise<number> {
  /* ١) ما عاد سعره طبيعياً: نُغلق سؤاله بـOBSOLETE لا بحذفه — أثر المراجعة
        جزء من تاريخ القطعة، وحذفه يمحو لماذا بقي السعر كما هو. */
  if (settledOfferIds.length) {
    await prisma.priceReview.updateMany({
      where: { offerId: { in: settledOfferIds }, status: 'PENDING' },
      data: { status: 'OBSOLETE', reviewedAt: new Date() },
    });
  }

  let created = 0;

  for (const h of holds) {
    // ٢) سؤال معلَّق على العرض نفسه؟ نُحدّثه بدل أن نُضيف نسخة
    const pending = await prisma.priceReview.findFirst({
      where: { offerId: h.offerId, status: 'PENDING' },
    });

    if (pending) {
      await prisma.priceReview.update({
        where: { id: pending.id },
        data: {
          newPrice: h.newPrice,
          changePct: risePercent(h.oldPrice, h.newPrice),
          lastSeenAt: new Date(),
          // التكرار حجّة: رقمٌ يعود في كل دورة أقرب إلى الحقيقة من خطأ عابر
          seenCount: { increment: 1 },
        },
      });
      continue;
    }

    // ٣) هل رفضتَ هذا الرقم قريباً؟ لا نُعِد السؤال
    const lastRejected = await prisma.priceReview.findFirst({
      where: { offerId: h.offerId, status: 'REJECTED' },
      orderBy: { reviewedAt: 'desc' },
    });
    if (
      lastRejected?.reviewedAt &&
      sameNumber(lastRejected.newPrice, h.newPrice) &&
      Date.now() - lastRejected.reviewedAt.getTime() < REJECT_SILENCE_DAYS * 86400000
    ) {
      continue;
    }

    await prisma.priceReview.create({
      data: {
        offerId: h.offerId,
        componentId,
        oldPrice: h.oldPrice,
        newPrice: h.newPrice,
        changePct: risePercent(h.oldPrice, h.newPrice),
      },
    });
    created++;
  }

  return created;
}

/* ============ تنفيذ القرار ============
 * الجوهر هنا لا في الإجراء الخادمي: الإجراء يتحقّق من الصلاحية ثم ينادي،
 * فيبقى المنطق قابلاً للاختبار بلا جلسة ولا متصفّح.
 */

/**
 * سعر القطعة المعروض = أقلّ أسعار عروضها المتوفّرة، لا سعر العرض المعتمد.
 * فاعتماد ارتفاع في متجرٍ قد لا يغيّر المعروض شيئاً إن كان غيره أرخص —
 * وكتابةُ السعر الجديد مباشرةً كانت سترفع سعر القطعة بلا وجه حقّ.
 */
export async function recalcComponentPrice(
  prisma: PrismaClient,
  componentId: string,
): Promise<number | null> {
  const offers = await prisma.componentOffer.findMany({
    where: { componentId, store: { active: true } },
    select: { price: true, inStock: true },
  });
  const live = offers.filter((o) => o.inStock && (o.price ?? 0) > 0).map((o) => o.price!);
  // كلّها نافدة → لا نمسّ المعروض: صفرٌ أسوأ من سعرٍ قديم
  if (!live.length) return null;
  return Math.round(Math.min(...live) * 100) / 100;
}

export type ReviewDecision = { success: true; newComponentPrice?: number | null } | { success: false; error: string };

export async function applyApproval(
  prisma: PrismaClient,
  reviewId: string,
  adminEmail: string,
): Promise<ReviewDecision> {
  const review = await prisma.priceReview.findUnique({
    where: { id: reviewId },
    include: { offer: { include: { store: { select: { slug: true } } } } },
  });
  if (!review) return { success: false, error: 'الطلب غير موجود.' };
  /* حارس الضغط المزدوج والتبويبين: القرار يُتّخذ مرّة، وإعادة تطبيقه على
     سعرٍ تغيّر بعده تكتب رقماً باطلاً. */
  if (review.status !== 'PENDING') return { success: false, error: 'هذا الطلب حُسم من قبل.' };

  await prisma.componentOffer.update({
    where: { id: review.offerId },
    data: { price: review.newPrice, lastError: null },
  });

  const lowest = await recalcComponentPrice(prisma, review.componentId);
  if (lowest != null) {
    await prisma.component.update({ where: { id: review.componentId }, data: { price: lowest } });
  }

  /* السعر المعتمد يدخل التاريخ كنقطة حقيقية: بدونه يُظهر الرسم قفزةً بلا
     مصدر، ويُحسب "أدنى سعر" على بيانات ناقصة. */
  await recordPriceHistory(prisma, review.componentId, [
    { store: review.offer.store.slug, price: review.newPrice },
  ]);

  await prisma.priceReview.update({
    where: { id: reviewId },
    data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: adminEmail },
  });

  return { success: true, newComponentPrice: lowest };
}

export async function applyRejection(
  prisma: PrismaClient,
  reviewId: string,
  adminEmail: string,
): Promise<ReviewDecision> {
  const review = await prisma.priceReview.findUnique({ where: { id: reviewId } });
  if (!review) return { success: false, error: 'الطلب غير موجود.' };
  if (review.status !== 'PENDING') return { success: false, error: 'هذا الطلب حُسم من قبل.' };

  /* لا نمسّ السعر: الرفض يعني «أبقِ القديم». والصفّ يبقى REJECTED فيقرؤه
     السحب ويصمت عن الرقم نفسه أسبوعاً — وإلا عاد السؤال في كل دورة. */
  await prisma.priceReview.update({
    where: { id: reviewId },
    data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: adminEmail },
  });

  return { success: true };
}
