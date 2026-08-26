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
 *
 * ============ خبرٌ وحال ============
 *
 * أوّل صياغةٍ خلطت الاثنين: نافذةٌ ثابتة ٣٠ يوماً، فمن فتح اللوحة اليوم
 * ورجع غداً رأى **نفس الصفوف حرفيّاً** تسعةً وعشرين يوماً. والنقطة الحمراء
 * تنطفئ والمحتوى لا يتغيّر — وهذا يعلّم المستخدم تجاهل القسم.
 *
 *   **خبر**: «نزل سعر الكرت ٥٪» — يفيد مرّةً واحدة.
 *   **حال**: «الكرت أرخص ما كان منذ شهر» — يفيد كلّ يومٍ حتى يكذب.
 *
 * فصار الفصل صريحاً في ثلاث مجموعات:
 *
 *   `fresh`  — ما نزل **منذ آخر زيارته** (من `dropsSeenAt`)، فيفرغ نفسه.
 *   `pinned` — ما حفظه بيده، فيبقى حتى يرفعه.
 *   `lowest` — ما هو أدنى سعرٍ له منذ شهر: حالٌ يستحقّ التكرار لأنه صحيحٌ
 *              اليوم لا لأنه وقع أمس، ويموت وحده حين يرتفع السعر.
 */

import type { PrismaClient } from '@prisma/client';
import { dropPercent } from './price';

/** الأعمدة الثمانية التي تحمل قطع التجميعة — مكتوبةً مرّة */
export const BUILD_PART_COLUMNS = [
  'cpuId', 'gpuId', 'ramId', 'motherboardId', 'caseId', 'psuId', 'storageId', 'coolerId',
] as const;

/** أقصى ما يُنظَر إليه إلى الوراء، مهما طال غيابه */
const MAX_WINDOW_DAYS = 30;

/** نافذة «أدنى سعر» */
const LOW_WINDOW_DAYS = 30;

/* شروط ادّعاء «أدنى سعر منذ شهر» — بلا هذه يكون الادّعاء كاذباً:
 * قطعةٌ أُضيفت أمس «أدنى سعرٍ لها» بالضرورة، وهذا ليس خبراً. */
const LOW_MIN_RECORDS = 5;
const LOW_MIN_SPAN_DAYS = 7;
/** فرقُ تقريبٍ في الفاصلة العشرية لا يُعدّ ارتفاعاً */
const EPS = 0.5;

export type Drop = {
  componentId: string;
  name: string;
  brand: string;
  categoryName: string;
  imageUrl: string | null;
  price: number;
  previousPrice: number | null;
  droppedAt: Date | null;
  /** نسبة الانخفاض مقرَّبة (٠ إن لم يكن ثمّة انخفاضٌ مسجَّل) */
  pct: number;
  /** كم وفّر بالريال */
  saved: number;
  /** من أين جاءت المتابعة — يُعرض للمستخدم كي يعرف لماذا يراها */
  source: 'build' | 'watch';
  /** اسم التجميعة ومعرّفها إن كان المصدر تجميعة */
  buildName?: string;
  buildId?: string;
  /** أدنى سعرٍ لها منذ شهر — حالٌ لا خبر */
  atLowest: boolean;
  /** السعر الذي حفظه المستخدم بيده، وتاريخه */
  pinnedPrice?: number;
  pinnedAt?: Date;
  /** الفرق عن المحفوظ: سالبٌ = نزل أكثر، موجبٌ = ارتفع فانتهى الخصم */
  vsPinned?: number;
};

export type DropsView = {
  /** ما جدّ منذ آخر زيارته */
  fresh: Drop[];
  /** ما حفظه بيده */
  pinned: Drop[];
  /** أدنى سعرٍ منذ شهر — يُعرض حين لا جديد */
  lowest: Drop[];
  /** مجموع ما وفّره الجديد */
  totalSaved: number;
};

type Pin = { price: number; at: Date };

/** القطع التي يتابعها المستخدم: قطع تجميعاته + متابعاته الصريحة */
export async function watchedComponentIds(
  prisma: PrismaClient,
  userId: string,
): Promise<{
  ids: string[];
  fromBuild: Map<string, { id: string; name: string }>;
  pins: Map<string, Pin>;
}> {
  const builds = await prisma.savedBuild.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      cpuId: true, gpuId: true, ramId: true, motherboardId: true,
      caseId: true, psuId: true, storageId: true, coolerId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  /* أوّل تجميعةٍ تحتوي القطعة هي التي تُنسب إليها — والأحدث أولاً، فالاسم
     المعروض هو آخر ما بناه لا أوّل ما بناه. */
  const fromBuild = new Map<string, { id: string; name: string }>();
  for (const b of builds) {
    for (const col of BUILD_PART_COLUMNS) {
      const id = (b as any)[col] as string | null;
      if (id && !fromBuild.has(id)) fromBuild.set(id, { id: b.id, name: b.name });
    }
  }

  const watches = await prisma.priceWatch.findMany({
    where: { userId },
    select: { componentId: true, pinnedPrice: true, pinnedAt: true },
  });

  const pins = new Map<string, Pin>();
  for (const w of watches) {
    if (w.pinnedPrice != null && w.pinnedAt) pins.set(w.componentId, { price: w.pinnedPrice, at: w.pinnedAt });
  }

  const ids = new Set<string>([...fromBuild.keys(), ...watches.map((w) => w.componentId)]);
  return { ids: [...ids], fromBuild, pins };
}

/**
 * اللوحة كاملةً: الجديد، والمحفوظ، والأدنى منذ شهر.
 *
 * ⚠️ ويُشترط في الجديد أن يكون السعر الحالي **أقلّ** من السابق فعلاً:
 * الحقلان يُكتبان عند رصد الانخفاض، لكن السعر قد يعود بعده — وعرضُ انخفاضٍ
 * ارتفع ثانيةً يُرسل المشتري إلى سعرٍ لم يعد موجوداً.
 */
export async function userDropsView(
  prisma: PrismaClient,
  userId: string,
  opts: { seenAt?: Date | null } = {},
): Promise<DropsView> {
  const { ids, fromBuild, pins } = await watchedComponentIds(prisma, userId);
  if (!ids.length) return { fresh: [], pinned: [], lowest: [], totalSaved: 0 };

  const now = Date.now();
  const cap = new Date(now - MAX_WINDOW_DAYS * 86400000);
  /* النافذة من آخر زيارته لا من ٣٠ يوماً ثابتة — لكن بسقفٍ ٣٠: من غاب
     شهرين لا يُغرَق بشهرين، ومن رجع غداً يرى ما جدّ أمس فقط. */
  const seen = opts.seenAt ?? null;
  const since = seen && seen > cap ? seen : cap;

  const comps = await prisma.component.findMany({
    where: { id: { in: ids } },
    select: {
      id: true, name: true, brand: true, imageUrl: true,
      price: true, previousPrice: true, priceDroppedAt: true,
      category: { select: { name: true } },
    },
  });

  /* أدنى سعرٍ مسجَّل لكلٍّ منها خلال الشهر، مع ما يكفي للحكم */
  const lowFrom = new Date(now - LOW_WINDOW_DAYS * 86400000);
  const hist = await prisma.priceHistory.groupBy({
    by: ['componentId'],
    where: { componentId: { in: ids }, recordedAt: { gte: lowFrom } },
    _min: { price: true, recordedAt: true },
    _count: { _all: true },
  });
  const lowOf = new Map(hist.map((h) => [h.componentId, h]));

  const isAtLowest = (id: string, price: number): boolean => {
    const h = lowOf.get(id);
    if (!h || h._min.price == null || !h._min.recordedAt) return false;
    /* بلا قراءاتٍ كافيةٍ ولا مدّةٍ كافية لا يُقال «أدنى سعر»: قطعةٌ أُضيفت
       أمس أدنى سعرٍ لها بالضرورة، والادّعاء حينها كذبٌ لا اختصار. */
    if (h._count._all < LOW_MIN_RECORDS) return false;
    if (now - h._min.recordedAt.getTime() < LOW_MIN_SPAN_DAYS * 86400000) return false;
    return price <= h._min.price + EPS;
  };

  const base = (c: (typeof comps)[number]): Drop => {
    const b = fromBuild.get(c.id);
    const pin = pins.get(c.id);
    const pct = c.previousPrice != null ? dropPercent(c.previousPrice, c.price) : 0;
    return {
      componentId: c.id,
      name: c.name,
      brand: c.brand,
      categoryName: c.category.name,
      imageUrl: c.imageUrl,
      price: c.price,
      previousPrice: c.previousPrice,
      droppedAt: c.priceDroppedAt,
      pct,
      saved: c.previousPrice != null ? Math.round((c.previousPrice - c.price) * 100) / 100 : 0,
      source: b ? 'build' : 'watch',
      buildName: b?.name,
      buildId: b?.id,
      atLowest: isAtLowest(c.id, c.price),
      pinnedPrice: pin?.price,
      pinnedAt: pin?.at,
      vsPinned: pin ? Math.round((c.price - pin.price) * 100) / 100 : undefined,
    };
  };

  const all = comps.map(base);

  const fresh = all
    .filter((d) => d.droppedAt && d.droppedAt >= since && d.pct > 0 && d.price > 0)
    .sort((a, b) => b.pct - a.pct);

  const pinned = all
    .filter((d) => d.pinnedPrice != null)
    .sort((a, b) => (a.vsPinned ?? 0) - (b.vsPinned ?? 0));

  /* ما هو أدنى سعرٍ له ولم يُذكر في الجديد — لئلّا يُعرض الصفّ مرّتين */
  const freshIds = new Set(fresh.map((d) => d.componentId));
  const lowest = all
    .filter((d) => d.atLowest && !freshIds.has(d.componentId) && d.price > 0)
    .sort((a, b) => b.pct - a.pct);

  return {
    fresh,
    pinned,
    lowest,
    totalSaved: Math.round(fresh.reduce((s, d) => s + d.saved, 0)),
  };
}
