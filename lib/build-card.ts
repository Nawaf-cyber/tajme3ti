/* ============ ملخّصُ التجميعة للمشاركة ============
 *
 * ما تعرضه معاينةُ الرابط في واتساب وX: الاسم، والقطع، والمجموع، والتوافق.
 * ومصدرٌ واحد للصورة (`opengraph-image`) وللعنوان (`generateMetadata`) —
 * وإلّا قالت الصورة «متوافقة» والوصفُ تحتها «فيها تعارض».
 *
 * ⚠️ وقبل هذا الملفّ كان الرابط المُرسَل **بلا صورةٍ أصلاً**، وعنوانُه في
 * المعاينة عنوانُ الموقع العامّ لا اسمُ التجميعة: `generateMetadata` تكتب
 * `title` فقط، و`openGraph` يُورَّث من الجذر كاملاً.
 */

import { cache } from 'react';
import { prisma } from './prisma';
import { checkBuild, type BuildParts } from './build-check';

export type CardState = 'fits' | 'warn' | 'block';

export type CardPart = { category: keyof BuildParts; label: string; title: string };

export type BuildCard = {
  name: string;
  parts: CardPart[];
  total: number;
  state: CardState;
};

/** ترتيبُ العرض: الكرت والمعالج أوّلاً — هما عنوانُ أيّ تجميعة */
const ORDER: { category: keyof BuildParts; column: string; label: string }[] = [
  { category: 'GPU', column: 'gpuId', label: 'كرت الشاشة' },
  { category: 'CPU', column: 'cpuId', label: 'المعالج' },
  { category: 'Motherboard', column: 'motherboardId', label: 'اللوحة الأم' },
  { category: 'RAM', column: 'ramId', label: 'الذاكرة' },
  { category: 'Storage', column: 'storageId', label: 'التخزين' },
  { category: 'PSU', column: 'psuId', label: 'مزوّد الطاقة' },
  { category: 'Case', column: 'caseId', label: 'الكيس' },
  { category: 'Cooler', column: 'coolerId', label: 'المبرّد' },
];

/** «PNY» + «GeForce RTX 5070 Ti» — ولا يُكرَّر إن كان الاسم يبدأ بها */
const titleOf = (brand?: string | null, name?: string | null) => {
  const n = (name ?? '').trim();
  const b = (brand ?? '').trim();
  return b && !n.toLowerCase().startsWith(b.toLowerCase()) ? `${b} ${n}` : n;
};

export const buildCard = cache(async (id: string): Promise<BuildCard | null> => {
  const build = await prisma.savedBuild.findUnique({
    where: { id },
    select: {
      name: true,
      cpuId: true, gpuId: true, ramId: true, motherboardId: true,
      caseId: true, psuId: true, storageId: true, coolerId: true,
    },
  });
  if (!build) return null;

  const ids = ORDER.map((o) => (build as any)[o.column] as string | null).filter(Boolean) as string[];
  const comps = ids.length
    ? await prisma.component.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, brand: true, price: true, specs: true, tdpWattage: true },
      })
    : [];
  const byId = new Map(comps.map((c) => [c.id, c]));

  const rig: BuildParts = {};
  const parts: CardPart[] = [];
  let total = 0;
  for (const o of ORDER) {
    const c = byId.get((build as any)[o.column]);
    if (!c) continue;
    rig[o.category] = c;
    parts.push({ category: o.category, label: o.label, title: titleOf(c.brand, c.name) });
    total += c.price || 0;
  }

  /* نفسُ الفحص الذي يراه صاحبها في الباني — لا حكمٌ ثانٍ للمشاركة */
  const issues = checkBuild(rig);
  const state: CardState = issues.some((i) => i.level === 'block')
    ? 'block'
    : issues.length
      ? 'warn'
      : 'fits';

  return { name: build.name, parts, total: Math.round(total), state };
});

export const STATE_TEXT: Record<CardState, string> = {
  fits: 'القطع متوافقة',
  warn: 'متوافقة — مع ملاحظة',
  block: 'فيها تعارض',
};

/** «22,249» — أرقامٌ لاتينيّة كما تعرضها صفحة التجميعة */
export const formatTotal = (n: number) => n.toLocaleString('en-US');
