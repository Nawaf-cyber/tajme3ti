/* اسم التجميعة — بلا prisma كي تستورده صفحات المتصفّح (تجميعاتي، مقارنة التجميعات).
   lib/build-card يعيد تصديره، فالمصدر واحد. */

/**
 * اسمٌ وضعه الباني تلقائياً — «تجميعة» + تاريخ اليوم.
 *
 * ⚠️ والتاريخ بصيغتين لأنّ `toLocaleDateString('ar-SA')` هجريٌّ في متصفّحٍ
 * وميلاديٌّ في آخر: «تجميعة ٢٢‏/٩‏/٢٠٢٦» و«تجميعة ١١ ربيع الآخر، ١٤٤٨ هـ»،
 * وكلاهما في القاعدة. والاسمُ الذي كتبه صاحبه («تجميعة 5070 Ti»،
 * «تجميعة - ١») يبقى.
 */
export function isAutoName(name: string): boolean {
  const t = name.replace(/[‎‏؜]/g, '').replace(/\s+/g, ' ').trim();
  if (t === 'تجميعة' || t === 'تجميعة مخصصة') return true;
  const rest = t.match(/^تجميعة (.+)$/)?.[1];
  if (!rest || !/[0-9٠-٩]/.test(rest)) return false;
  return rest.includes('/') || /هـ$/.test(rest);
}

/* «GeForce RTX 5070 12GB» ← «RTX 5070 12GB» */
export const shortPartName = (s?: string | null) => (s || '').replace(/^(GeForce|Radeon)\s+/i, '').trim();

/** عنوانٌ يقرأه الإنسان: الاسم الذي كتبه صاحبه، وإلّا «المعالج + الكرت» — عشرُ
 *  تجميعاتٍ باسم «تجميعة ٢٢/٩/٢٠٢٦» لا تُفرَّق بأسمائها. */
export function buildTitle(b: { name: string; parts?: Record<string, { name: string } | null | undefined> | null }): { title: string; auto: boolean } {
  if (!isAutoName(b.name)) return { title: b.name, auto: false };
  const cpu = b.parts?.CPU?.name;
  const gpu = b.parts?.GPU?.name;
  const t = [cpu, gpu && shortPartName(gpu)].filter(Boolean).join(' + ');
  return { title: t || b.name, auto: !!t };
}
