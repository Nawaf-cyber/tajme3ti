import { prisma } from './prisma';

/**
 * الفصل بين "الأدلّة" و"الأخبار" يعتمد على حقل category.
 * أي محتوى تصنيفه ضمن GUIDE_CATEGORIES يُعدّ دليلاً تعليمياً؛
 * ما عداه يُعدّ خبراً.
 *
 * لماذا هذا الفصل؟ مُراجِع AdSense يصنّف الموقع من أول انطباع.
 * موقع "أخبار تقنية" شبه مستحيل الموافقة؛ موقع "أدلّة" مرحّب به.
 * الأدلّة دائمة وتخدم SEO والأفلييت؛ الأخبار تتقادم.
 *
 * لتحويل مقال من خبر إلى دليل: غيّر category إلى "دليل" من لوحة الإدارة.
 */
export const GUIDE_CATEGORIES = ['دليل', 'أدلة', 'أدلّة', 'guide'];

/** شرط Prisma يطابق الأدلّة فقط */
export const guideWhere = {
  category: { in: GUIDE_CATEGORIES },
};

/** شرط Prisma يستبعد الأدلّة (أي: الأخبار فقط) */
export const newsWhere = {
  NOT: { category: { in: GUIDE_CATEGORIES } },
};

/** جلب كل الأدلّة، الأحدث أولاً */
export function getGuides() {
  return prisma.news.findMany({
    where: guideWhere,
    orderBy: { createdAt: 'desc' },
  });
}

/** جلب الأخبار فقط (بلا أدلّة) */
export function getNews() {
  return prisma.news.findMany({
    where: newsWhere,
    orderBy: { createdAt: 'desc' },
  });
}

/** جلب مقال واحد بمعرّفه، مع تحديد نوعه */
export async function getArticle(id: string) {
  const article = await prisma.news.findUnique({ where: { id } });
  if (!article) return null;
  const isGuide = GUIDE_CATEGORIES.includes(article.category);
  return { ...article, isGuide };
}

/**
 * سطر الكاتب الموحّد — إشارة E-E-A-T.
 * غيّر الاسم والنبذة هنا فيُحدَّثان في كل الأدلّة دفعة واحدة.
 */
export const AUTHOR = {
  name: 'نواف',
  bio: 'أجمّع أجهزة الحاسب وأتابع سوق القطع، وبنيت تجميعتي لأساعد المستخدم العربي يختار بثقة. أكتب كل دليل بنفسي من واقع تجربة.',
};