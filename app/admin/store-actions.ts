'use server';

/**
 * ============ إدارة المتاجر ============
 * إضافة/تعديل/حذف متجر، وترتيبه، وتفعيله. كل تغيير هنا يسري فوراً على
 * كل صفحة تعرض أسعاراً — لأن الصفحات تقرأ الجدول لا أسماء مكتوبة في الكود.
 */

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    throw new Error('غير مصرح: هذه العملية تتطلب صلاحية أدمن.');
  }
}

/** slug ثابت للأبد: يربط سجلّ الأسعار ومحرّكات السحب المخصّصة بالمتجر.
 *  لاتيني صغير بشرطات فقط — لأنه يدخل في مقارنات نصّية مباشرة. */
const toSlug = (raw: string): string =>
  raw.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/** لون hex صالح — القيمة تدخل في style مباشرة فلا نقبل نصّاً حرّاً */
const cleanColor = (raw: string | null, fallback = '#0EA5E9'): string => {
  const v = (raw || '').trim();
  return /^#[0-9A-Fa-f]{6}$/.test(v) ? v.toUpperCase() : fallback;
};

const SCRAPE_MODES = ['auto', 'custom', 'native', 'off'] as const;

function readStoreForm(formData: FormData) {
  const name = ((formData.get('name') as string) || '').trim();
  const latinName = ((formData.get('latinName') as string) || '').trim() || name;
  const modeRaw = (formData.get('scrapeMode') as string) || 'auto';

  return {
    name,
    latinName,
    color: cleanColor(formData.get('color') as string),
    domain: ((formData.get('domain') as string) || '').trim() || null,
    affiliateParam: ((formData.get('affiliateParam') as string) || '').trim() || null,
    affiliateId: ((formData.get('affiliateId') as string) || '').trim() || null,
    usesDeepLinks: formData.get('usesDeepLinks') === 'true',
    currency: ((formData.get('currency') as string) || 'SAR').trim().toUpperCase(),
    rateToSar: parseFloat((formData.get('rateToSar') as string) || '1') || 1,
    scrapeMode: (SCRAPE_MODES as readonly string[]).includes(modeRaw) ? modeRaw : 'auto',
    priceSelector: ((formData.get('priceSelector') as string) || '').trim() || null,
    listSelector: ((formData.get('listSelector') as string) || '').trim() || null,
    stockSelector: ((formData.get('stockSelector') as string) || '').trim() || null,
    premiumProxy: formData.get('premiumProxy') === 'true',
    active: formData.get('active') === 'true',
    sortOrder: parseInt((formData.get('sortOrder') as string) || '0', 10) || 0,
  };
}

export async function createStore(formData: FormData) {
  await assertAdmin();
  const data = readStoreForm(formData);
  if (!data.name) throw new Error('اسم المتجر مطلوب.');

  const base = toSlug((formData.get('slug') as string) || data.latinName || data.name);
  if (!base) throw new Error('تعذّر توليد معرّف للمتجر — اكتب اسماً لاتينياً.');

  // نضمن تفرّد الـslug بإضافة رقم عند التصادم بدل رفض الحفظ
  let slug = base;
  for (let i = 2; await prisma.store.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;

  await prisma.store.create({ data: { ...data, slug } });
  revalidatePath('/admin/stores');
  revalidatePath('/');
}

export async function updateStore(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  if (!id) return;
  // الـslug لا يُعدَّل: سجلّ الأسعار المخزَّن يشير إليه نصّاً، وتغييره يقطع التاريخ
  await prisma.store.update({ where: { id }, data: readStoreForm(formData) });
  revalidatePath('/admin/stores');
  revalidatePath('/');
}

/** إيقاف مؤقّت: يخفي المتجر من كل الصفحات بلا مسّ بياناته */
export async function toggleStore(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  const store = await prisma.store.findUnique({ where: { id }, select: { active: true } });
  if (!store) return;
  await prisma.store.update({ where: { id }, data: { active: !store.active } });
  revalidatePath('/admin/stores');
  revalidatePath('/');
}

/** حذف نهائي — يمحو عروض هذا المتجر لكل القطع (بسبب onDelete: Cascade).
 *  لذلك تطلب الواجهة تأكيداً مكتوباً وتُظهر عدد العروض التي ستُفقد. */
export async function deleteStore(formData: FormData) {
  await assertAdmin();
  const id = formData.get('id') as string;
  if (!id) return;
  await prisma.store.delete({ where: { id } });
  revalidatePath('/admin/stores');
  revalidatePath('/');
}
