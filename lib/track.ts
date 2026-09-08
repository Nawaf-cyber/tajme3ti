/* ============ إرسال حدثٍ من المتصفّح ============
 *
 * ⚠️ موضعٌ واحد لا أربعة: الأحداث تُرسل من الباني ومن صفحة القطعة ومن
 * الكتالوج ومن الملخّص. ونسخُ `sendBeacon` في كلٍّ منها يعني أربع نسخٍ
 * تتباعد — وهو الدرس الذي كلّفنا ساحبات الأسعار وقاعدةَ اختيار الاكتشاف
 * في هذه الجلسة نفسها.
 *
 * ⚠️ و`sendBeacon` أوّلاً كما في `VisitPing`: الزائر الذي ينقر رابط متجرٍ
 * يغادر الصفحة فوراً، فطلبُه العاديّ يُلغى معها — وهو **بالضبط** الحدث
 * الذي نريد أن نعرف أنّه وقع.
 */

/** الأحداث المسموحة — والقائمة نفسها تُفحص في الخادم فلا يُكتب ما لا نعرف */
export type TrackEvent = 'build_start' | 'build_complete' | 'offer_click' | 'search';

export function track(event: TrackEvent, opts: { componentId?: string | null; label?: string | null } = {}): void {
  if (typeof window === 'undefined') return;
  /* زياراتنا نحن ليست قياساً للسوق */
  if (location.pathname.startsWith('/admin')) return;

  const payload = JSON.stringify({
    p: location.pathname,
    e: event,
    c: opts.componentId || undefined,
    l: opts.label ? String(opts.label).slice(0, 80) : undefined,
    r: document.referrer || '',
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/hit', new Blob([payload], { type: 'application/json' }));
      return;
    }
  } catch { /* بعض المتصفّحات تمنع البيكون — نُكمل بالطلب العاديّ */ }

  fetch('/api/hit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

/**
 * حارسُ «مرّةً واحدة في الجلسة».
 *
 * ⚠️ وبدونه يصير القُمع كذباً: «بدأ بناءً» يُطلق مع كلّ قطعةٍ تُختار،
 * فيظهر زائرٌ واحدٌ اختار سبع قطعٍ سبعةَ زوّار — ونسبةُ الوصول تصير سُبع
 * الحقيقة. و`sessionStorage` يكفي: القياس بالجلسة لا بالعمر.
 */
export function trackOnce(key: string, event: TrackEvent, opts: { componentId?: string | null; label?: string | null } = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const k = 'trk:' + key;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, '1');
  } catch {
    /* التخزين ممنوع (تصفّحٌ خاصّ): يُرسل الحدث. تكرارٌ نادرٌ أهون من صمت */
  }
  track(event, opts);
}
