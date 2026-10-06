/**
 * ============ طلبات انضمام المتاجر — منطق مشترك ============
 *
 * يستعمله النموذج (تحقّقٌ فوريّ قبل الإرسال) والمسار (التحقّق الحقيقيّ)
 * ولوحة الإدارة (التسميات والألوان) — فلا تتباعد القوائم بين الأطراف.
 * بلا prisma: يُستورد في مكوّنات العميل.
 */

export const PLATFORMS = [
  { value: 'salla', label: 'سلة' },
  { value: 'zid', label: 'زد' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'custom', label: 'منصّةٌ خاصّة بنا' },
  { value: 'other', label: 'غير ذلك / لا أعرف' },
] as const;
export type Platform = (typeof PLATFORMS)[number]['value'];

export const AFFILIATE = [
  { value: 'yes', label: 'نعم، عندنا برنامج' },
  { value: 'maybe', label: 'لا، لكن مستعدّون' },
  { value: 'no', label: 'لا' },
] as const;
export type Affiliate = (typeof AFFILIATE)[number]['value'];

export type StoreAppStatus = 'NEW' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';

export const STATUS_META: Record<StoreAppStatus, { label: string; badge: string }> = {
  NEW: { label: 'جديد', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' },
  REVIEWING: { label: 'قيد المراجعة', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  ACCEPTED: { label: 'مقبول', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  REJECTED: { label: 'مرفوض', badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300' },
};

export const labelOf = (list: readonly { value: string; label: string }[], v: string | null | undefined) =>
  list.find((x) => x.value === v)?.label ?? v ?? '—';

/**
 * رابط المتجر → `{ url, host }` أو `null`.
 * يقبل «mystore.com» بلا بروتوكول (أغلب الناس يكتبونه هكذا)، ويرفض ما
 * ليس نطاقاً حقيقيّاً (بلا نقطة، أو localhost، أو عنوان IP).
 * والـhost بلا www — فـ«www.x.com» و«x.com» طلبٌ واحد عند كشف التكرار.
 */
export function normalizeWebsite(raw: string): { url: string; host: string } | null {
  const s = (raw || '').trim();
  if (!s || s.length > 200) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const hostname = u.hostname.toLowerCase().replace(/^www\./, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(hostname)) return null;
  /* متجر سلة بلا نطاقٍ خاصّ رابطُه «salla.sa/اسم-المتجر» — فالنطاق وحده
     يجعل كلّ متاجر سلة متجراً واحداً عند كشف التكرار. هنا المفتاح يشمل
     أوّل جزءٍ من المسار. */
  const seg = decodeURIComponent(u.pathname.split('/')[1] || '').toLowerCase();
  const host = SHARED_HOSTS.includes(hostname) && seg ? `${hostname}/${seg}` : hostname;
  return { url: `${u.protocol}//${u.hostname}${u.pathname === '/' ? '' : u.pathname}`, host };
}

/** نطاقاتٌ تستضيف متاجر كثيرة تحت مساراتٍ مختلفة */
const SHARED_HOSTS = ['salla.sa', 'salla.store', 'zid.store', 'zid.sa'];

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((s || '').trim()) && s.length <= 120;

/** جوّالٌ أو هاتف: أرقامٌ و+ ومسافات وشرطات، بين ٨ و١٥ رقماً */
export const isValidPhone = (s: string) => {
  const digits = (s || '').replace(/[\s\-()]/g, '');
  return /^\+?\d{8,15}$/.test(digits);
};

/** حدود الأطوال — الحقل الحرّ لا يُترك بلا سقف */
export const LIMITS = { short: 80, medium: 200, notes: 1000 } as const;

/** قصّ ونظافة لحقلٍ نصّيّ اختياريّ: فارغ → null */
export const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(/[ \t]+/g, ' ');
  return t ? t.slice(0, max) : null;
};
