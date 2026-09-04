/* ============ ذاكرةُ الاكتشاف ============
 *
 * شيئان يُحفظان بين التشغيلات:
 *   • أين وقف الدوران في كلّ (متجر × فئة)
 *   • ما تجاهله الأدمن — كي لا يعود إليه في كلّ مرّة
 *
 * ⚠️ ويُحفظان في جدول `Setting` الموجود، لا في جدولٍ جديد: إضافة نموذجٍ إلى
 * المخطَّط تعني `db push` على قاعدة **الإنتاج**، وذلك ثمنٌ لا تستحقّه قائمةُ
 * روابطَ ونصفُ سطر. و`Setting.value` نصٌّ بلا سقفٍ عمليّ في Postgres.
 */

import type { PrismaClient } from '@prisma/client';
import { normUrl } from './discover';

const OFFSET_KEY = (source: string, category: string) => `discover:offset:${source}:${category}`;
const DISMISS_KEY = 'discover:dismissed';

/** ⚠️ وسقفٌ للقائمة: بلا حدٍّ تنمو أبداً ويُقرأ صفٌّ ضخمٌ في كلّ تشغيل */
const MAX_DISMISSED = 3000;

export async function readOffset(prisma: PrismaClient, source: string, category: string): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: OFFSET_KEY(source, category) } });
  const n = Number(row?.value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function writeOffset(prisma: PrismaClient, source: string, category: string, next: number): Promise<void> {
  const key = OFFSET_KEY(source, category);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: String(next) },
    update: { value: String(next) },
  });
}

export async function readDismissed(prisma: PrismaClient): Promise<Set<string>> {
  const row = await prisma.setting.findUnique({ where: { key: DISMISS_KEY } });
  if (!row?.value) return new Set();
  try {
    const arr = JSON.parse(row.value);
    return new Set(Array.isArray(arr) ? arr.map((u: string) => normUrl(u)) : []);
  } catch {
    /* قيمةٌ تالفة لا تُسقط الاكتشاف: تُقرأ فارغةً وتُكتب صحيحةً في أوّل تجاهل */
    return new Set();
  }
}

export async function addDismissed(prisma: PrismaClient, urls: string[]): Promise<number> {
  const current = await readDismissed(prisma);
  for (const u of urls) {
    const n = normUrl(u);
    if (n) current.add(n);
  }
  /* الأحدث يبقى: القديم أُضيف أو زال من المتجر أصلاً */
  const kept = [...current].slice(-MAX_DISMISSED);
  await prisma.setting.upsert({
    where: { key: DISMISS_KEY },
    create: { key: DISMISS_KEY, value: JSON.stringify(kept) },
    update: { value: JSON.stringify(kept) },
  });
  return kept.length;
}

export async function clearDismissed(prisma: PrismaClient): Promise<void> {
  await prisma.setting.upsert({
    where: { key: DISMISS_KEY },
    create: { key: DISMISS_KEY, value: '[]' },
    update: { value: '[]' },
  });
}
