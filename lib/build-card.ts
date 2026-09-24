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
import { bottleneck, type Balance } from './bottleneck';

export type CardState = 'fits' | 'warn' | 'block';

export type CardPart = {
  category: keyof BuildParts;
  label: string;
  /** «PNY GeForce RTX 5070 Ti…» — بالشركة */
  title: string;
  /** «GeForce RTX 5070 Ti…» — بلا شركة، حيث يضيق السطر عن الاسم كاملاً */
  model: string;
};

/** قطعةٌ كتبها صاحب الجهاز نصّاً — بلا سعرٍ ولا مواصفات */
export type CardCustom = { category: keyof BuildParts; label: string; text: string };

export type BuildCard = {
  name: string;
  parts: CardPart[];
  /** فئاتٌ بلا قطعةٍ من الكتالوج ولها نصٌّ يدويّ — والقطعة تغلب النصّ */
  custom: CardCustom[];
  /** مجموعُ قطع الكتالوج وحدها */
  total: number;
  state: CardState;
  balance: Balance['kind'] | null;
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

/** ترتيبُ الفئات نفسه، لمن يدمج القطع والنصوص اليدويّة في قائمةٍ واحدة */
export const CARD_CATEGORIES = ORDER.map((o) => o.category);

export const buildCard = cache(async (id: string): Promise<BuildCard | null> => {
  const build = await prisma.savedBuild.findUnique({
    where: { id },
    select: {
      name: true, customParts: true,
      cpuId: true, gpuId: true, ramId: true, motherboardId: true,
      caseId: true, psuId: true, storageId: true, coolerId: true,
    },
  });
  if (!build) return null;

  const ids = ORDER.map((o) => (build as any)[o.column] as string | null).filter(Boolean) as string[];
  const comps = ids.length
    ? await prisma.component.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, brand: true, price: true, specs: true, tdpWattage: true, performanceTier: true },
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
    parts.push({ category: o.category, label: o.label, title: titleOf(c.brand, c.name), model: (c.name ?? '').trim() });
    total += c.price || 0;
  }

  /* نفسُ الفحص الذي يراه صاحبها في الباني — لا حكمٌ ثانٍ للمشاركة */
  const issues = checkBuild(rig);
  const state: CardState = issues.some((i) => i.level === 'block')
    ? 'block'
    : issues.length
      ? 'warn'
      : 'fits';

  /* ⚠️ نفسُ تصفية `/api/rig`: النصُّ يسقط أمام قطعةٍ حقيقيّة في فئته */
  const raw = build.customParts as any;
  const custom: CardCustom[] = [];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const o of ORDER) {
      const text = typeof raw[o.category] === 'string' ? raw[o.category].trim() : '';
      if (text && !rig[o.category]) custom.push({ category: o.category, label: o.label, text });
    }
  }

  const cpu = byId.get(build.cpuId as string);
  const gpu = byId.get(build.gpuId as string);

  return {
    name: build.name,
    parts,
    custom,
    total: Math.round(total),
    state,
    balance: bottleneck(cpu, gpu)?.kind ?? null,
  };
});

export const STATE_TEXT: Record<CardState, string> = {
  fits: 'القطع متوافقة',
  warn: 'متوافقة — مع ملاحظة',
  block: 'فيها تعارض',
};

/** «22,249» — أرقامٌ لاتينيّة كما تعرضها صفحة التجميعة */
export const formatTotal = (n: number) => n.toLocaleString('en-US');

/**
 * اسمٌ وضعه الباني تلقائياً — «تجميعة» + تاريخ اليوم.
 *
 * ⚠️ والتاريخ بصيغتين لأنّ `toLocaleDateString('ar-SA')` هجريٌّ في متصفّحٍ
 * وميلاديٌّ في آخر: «تجميعة ٢٢‏/٩‏/٢٠٢٦» و«تجميعة ١١ ربيع الآخر، ١٤٤٨ هـ»،
 * وكلاهما في القاعدة. والاسمُ الذي كتبه صاحبه («تجميعة 5070 Ti»،
 * «تجميعة - ١») يبقى.
 */
export function isAutoName(name: string): boolean {
  const t = name.replace(/[\u200E\u200F\u061C]/g, '').replace(/\s+/g, ' ').trim();
  if (t === 'تجميعة' || t === 'تجميعة مخصصة') return true;
  const rest = t.match(/^تجميعة (.+)$/)?.[1];
  if (!rest || !/[0-9\u0660-\u0669]/.test(rest)) return false;
  return rest.includes('/') || /هـ$/.test(rest);
}
