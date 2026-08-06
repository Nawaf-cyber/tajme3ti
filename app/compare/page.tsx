import { prisma } from '../../lib/prisma';
import CompareClient from './CompareClient';
import { OFFER_INCLUDE } from '../../lib/stores-server';
import type { Metadata } from 'next';

// تحديث حي — الأسعار والتوفّر تتغيّر
export const dynamic = 'force-dynamic';

type SearchParams = { ids?: string };

/* الحقول التي تحتاجها نافذة الاختيار: السعر والتوفّر وسعر ما قبل الخصم —
   كي تعرض الخصم والتوفّر قبل الإضافة لا بعدها. */
const PICKER_FIELDS = {
  id: true,
  name: true,
  brand: true,
  price: true,
  imageUrl: true,
  categoryId: true,
  ...OFFER_INCLUDE,
} as const;

// توليد عنوان ووصف ديناميكيين للمقارنة (مهم لـ SEO)
export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const ids = params.ids?.split(',').filter(Boolean).slice(0, 3) ?? [];

  if (ids.length < 2) {
    return {
      title: 'قارن القطع جنباً إلى جنب',
      description: 'قارن مواصفات وأسعار قطع الحاسوب جنباً إلى جنب، واختر الأنسب لتجميعتك بثقة.',
    };
  }

  try {
    const comps = await prisma.component.findMany({
      where: { id: { in: ids } },
      select: { name: true, brand: true, categoryId: true },
    });
    if (comps.length < 2) throw new Error('not enough');

    /* لا نولّد عنواناً لمقارنة مختلطة الفئات: الصفحة تستبعد الغرباء،
       فعنوان يذكرهم يخالف ما يراه الزائر ويضلّل نتائج البحث. */
    const catId = comps[0].categoryId;
    const sameCat = comps.filter((c) => c.categoryId === catId);
    if (sameCat.length < 2) {
      return { title: 'قارن القطع جنباً إلى جنب', robots: { index: false, follow: true } };
    }

    const names = sameCat.map((c) => `${c.brand} ${c.name}`);
    const title = `مقارنة ${names.join(' مقابل ')}`;
    return {
      title,
      description: `مقارنة تفصيلية بين ${names.join(' و ')} — المواصفات والأسعار والأداء، لتختار الأنسب لتجميعتك.`,
      alternates: { canonical: `/compare?ids=${ids.join(',')}` },
    };
  } catch {
    return { title: 'قارن القطع جنباً إلى جنب' };
  }
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const ids = params.ids?.split(',').filter(Boolean).slice(0, 3) ?? [];

  // القطع المختارة للمقارنة
  const selected = ids.length
    ? await prisma.component.findMany({
        where: { id: { in: ids } },
        include: { category: true, ...OFFER_INCLUDE },
      })
    : [];

  // نحافظ على ترتيب الـ IDs كما في الرابط
  const requested = ids
    .map((id) => selected.find((c) => c.id === id))
    .filter(Boolean) as typeof selected;

  /* ============ فرض وحدة الفئة ============
     المقارنة عبر فئات مختلفة تُنتج جدولاً بلا معنى: معظم الصفوف "—"،
     وشارة "أفضل قيمة" قد تُمنح لمزوّد طاقة أمام معالج، والخلاصة تقارن
     استهلاك معالج بقدرة مزوّد. الصفحة كانت تعِد بـ"نفس الفئة" ولا تفرضه،
     ورابط المقارنة قابل للمشاركة والفهرسة — فالهراء كان يُنشر.
     نُبقي فئة القطعة الأولى ونُبلّغ المستخدم بما استُبعد. */
  const activeCategoryId = requested[0]?.categoryId ?? null;
  const ordered = activeCategoryId
    ? requested.filter((c) => c.categoryId === activeCategoryId)
    : requested;

  const droppedNames = requested
    .filter((c) => c.categoryId !== activeCategoryId)
    .map((c) => `${c.brand} ${c.name}`);

  const keptIds = ordered.map((c) => c.id);

  // القطع المتاحة للإضافة (نفس الفئة، غير المختارة)
  const available = activeCategoryId
    ? await prisma.component.findMany({
        where: { categoryId: activeCategoryId, id: { notIn: keptIds } },
        select: PICKER_FIELDS,
        orderBy: { name: 'asc' },
      })
    : [];

  // كل الفئات (لاختيار فئة عند بدء مقارنة جديدة)
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  // إن لم تُختر قطع بعد: نجلب قطعاً من كل فئة للبدء
  const starterComponents = !activeCategoryId
    ? await prisma.component.findMany({
        select: PICKER_FIELDS,
        orderBy: { name: 'asc' },
      })
    : [];

  /* ============ تاريخ الأسعار للمقارنة ============
     نجمّع أدنى سعر يومي لكل قطعة عبر كل المتاجر خلال ٩٠ يوماً.
     السؤال الذي يجيبه: "هل هذا السعر لقطة أم هو الطبيعي؟" — وهو ما لا
     تجيبه أي صفحة أخرى. التجميع على الخادم كي لا نرسل ١٨٠٠ نقطة للعميل. */
  let history: { componentId: string; points: { d: string; p: number }[] }[] = [];
  if (keptIds.length >= 2) {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    /* المتاجر المعطّلة تُستثنى من الرسم — لو أوقفت متجراً فأسعاره القديمة
       لا يجوز أن تبقى ترسم "أدنى سعر" لا يستطيع الزائر شراءه اليوم. */
    const activeSlugs = (
      await prisma.store.findMany({ where: { active: true }, select: { slug: true } })
    ).map((s) => s.slug);

    const rows = await prisma.priceHistory.findMany({
      where: { componentId: { in: keptIds }, recordedAt: { gte: since }, store: { in: activeSlugs } },
      orderBy: { recordedAt: 'asc' },
      select: { componentId: true, price: true, recordedAt: true },
    });

    const perComp = new Map<string, Map<string, number>>();
    for (const r of rows) {
      const day = r.recordedAt.toISOString().slice(0, 10);
      let m = perComp.get(r.componentId);
      if (!m) { m = new Map(); perComp.set(r.componentId, m); }
      const cur = m.get(day);
      // أدنى سعر في اليوم = ما كان الزائر سيدفعه فعلاً
      if (cur == null || r.price < cur) m.set(day, r.price);
    }

    // نحفظ ترتيب الأعمدة نفسه كي تتطابق الألوان مع الجدول
    history = keptIds.map((id) => ({
      componentId: id,
      points: Array.from(perComp.get(id)?.entries() ?? [])
        .map(([d, p]) => ({ d, p }))
        .sort((a, b) => a.d.localeCompare(b.d)),
    }));
  }


  return (
    <CompareClient
      selected={JSON.parse(JSON.stringify(ordered))}
      available={JSON.parse(JSON.stringify(available))}
      categories={JSON.parse(JSON.stringify(categories))}
      starterComponents={JSON.parse(JSON.stringify(starterComponents))}
      activeCategoryId={activeCategoryId}
      droppedNames={droppedNames}
      history={history}
    />
  );
}
