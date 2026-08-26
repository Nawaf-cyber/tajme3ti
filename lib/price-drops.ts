/* ============ انخفاضات أسعار قطع المستخدم ============
 *
 * ما الذي «يتابعه» المستخدم؟ سؤالٌ يُجاب بالبيانات لا بالتصميم:
 *
 *   ٤٠٧ زوجاً (مستخدم × قطعة) موجودةٌ **أصلاً** في التجميعات المحفوظة،
 *   بلا أيّ عملٍ منه. و٦٤ من ٩٩ مستخدماً بلا تجميعة — فصفحةٌ تطلب منه
 *   أن يختار تبدأ فارغةً عند ثُلثَيهم.
 *
 * فالمتابعة **تلقائية**: كل قطعة في تجميعةٍ محفوظة مرصودة. و`PriceWatch`
 * يضيف إليها ما ليس في تجميعة، ولا ينسخها.
 *
 * ⚠️ ولا يُنسخ شيء: لو كُتب صفُّ متابعةٍ لكل قطعةٍ في كل تجميعة لصارت
 * حالتان تتباعدان — يحذف تجميعةً فيبقى الصفّ يتيماً، أو يبدّل قطعةً فلا
 * يُبدَّل الصفّ. فالتجميعة هي المصدر، وتُقرأ لحظةَ السؤال.
 */

import type { PrismaClient } from '@prisma/client';
import { dropPercent } from './price';

/** الأعمدة الثمانية التي تحمل قطع التجميعة — مكتوبةً مرّة */
export const BUILD_PART_COLUMNS = [
  'cpuId', 'gpuId', 'ramId', 'motherboardId', 'caseId', 'psuId', 'storageId', 'coolerId',
] as const;

export type Drop = {
  componentId: string;
  name: string;
  brand: string;
  categoryName: string;
  imageUrl: string | null;
  price: number;
  previousPrice: number;
  droppedAt: Date;
  /** نسبة الانخفاض مقرَّبة */
  pct: number;
  /** كم وفّر بالريال */
  saved: number;
  /** من أين جاءت المتابعة — يُعرض للمستخدم كي يعرف لماذا يراها */
  source: 'build' | 'watch';
  /** اسم التجميعة إن كان المصدر تجميعة */
  buildName?: string;
  /** لم يره بعد */
  unseen: boolean;
};

/** القطع التي يتابعها المستخدم: قطع تجميعاته + متابعاته الصريحة */
export async function watchedComponentIds(
  prisma: PrismaClient,
  userId: string,
): Promise<{ ids: string[]; fromBuild: Map<string, string> }> {
  const builds = await prisma.savedBuild.findMany({
    where: { userId },
    select: {
      name: true,
      cpuId: true, gpuId: true, ramId: true, motherboardId: true,
      caseId: true, psuId: true, storageId: true, coolerId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  /* أوّل تجميعةٍ تحتوي القطعة هي التي تُنسب إليها — والأحدث أولاً، فالاسم
     المعروض هو آخر ما بناه لا أوّل ما بناه. */
  const fromBuild = new Map<string, string>();
  for (const b of builds) {
    for (const col of BUILD_PART_COLUMNS) {
      const id = (b as any)[col] as string | null;
      if (id && !fromBuild.has(id)) fromBuild.set(id, b.name);
    }
  }

  const watches = await prisma.priceWatch.findMany({
    where: { userId },
    select: { componentId: true },
  });

  const ids = new Set<string>([...fromBuild.keys(), ...watches.map((w) => w.componentId)]);
  return { ids: [...ids], fromBuild };
}

/**
 * انخفاضات قطع المستخدم خلال `days` يوماً.
 *
 * ⚠️ ويُشترط أن يكون السعر الحالي **أقلّ** من السابق فعلاً: الحقلان
 * يُكتبان عند رصد الانخفاض، لكن السعر قد يعود بعده — وعرضُ انخفاضٍ ارتفع
 * ثانيةً يُرسل المشتري إلى سعرٍ لم يعد موجوداً.
 */
export async function userPriceDrops(
  prisma: PrismaClient,
  userId: string,
  opts: { days?: number; seenAt?: Date | null } = {},
): Promise<Drop[]> {
  const days = opts.days ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const { ids, fromBuild } = await watchedComponentIds(prisma, userId);
  if (!ids.length) return [];

  const comps = await prisma.component.findMany({
    where: {
      id: { in: ids },
      priceDroppedAt: { gte: since },
      previousPrice: { not: null },
    },
    select: {
      id: true, name: true, brand: true, imageUrl: true,
      price: true, previousPrice: true, priceDroppedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { priceDroppedAt: 'desc' },
  });

  const seen = opts.seenAt ?? null;

  /* ⚠️ العتبة من `dropPercent` المشتركة لا من حسابٍ هنا.
   *
   * أوّل صياغةٍ حسبت النسبة بنفسها، فأعطت «‎-0%» لقطعةٍ نزلت ريالاً واحداً
   * (459 ← 458) — وتنبيهٌ بانخفاضِ صفرٍ أسوأ من الصمت. والعتبة موجودةٌ في
   * الموقع أصلاً (٣٪، وسقفُ ٥٠٪ لما فوقه خطأُ قراءة) ويستعملها قسم
   * الرئيسية. فحسابان يعنيان رقمين مختلفين على الشاشة نفسها.
   */
  return comps
    .map((c) => ({ c, pct: dropPercent(c.previousPrice, c.price) }))
    .filter(({ c, pct }) => pct > 0 && c.price > 0)
    .map(({ c, pct }) => {
      const prev = c.previousPrice!;
      return {
        componentId: c.id,
        name: c.name,
        brand: c.brand,
        categoryName: c.category.name,
        imageUrl: c.imageUrl,
        price: c.price,
        previousPrice: prev,
        droppedAt: c.priceDroppedAt!,
        pct,
        saved: Math.round((prev - c.price) * 100) / 100,
        source: fromBuild.has(c.id) ? 'build' : 'watch',
        buildName: fromBuild.get(c.id),
        unseen: !seen || c.priceDroppedAt! > seen,
      } satisfies Drop;
    });
}
