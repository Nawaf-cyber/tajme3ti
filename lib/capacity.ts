/* ============ قراءة السعة — نسخةٌ واحدة ============
 *
 * كانت السعة تُقرأ في أربعة مواضع بأربع طرق، ثلاثٌ منها صحيحة وواحدة
 * معطوبة — وهو بالضبط ما حدث في ساحبات الأسعار: خطأٌ يُشفى في نسخةٍ
 * ويعيش في أخرى.
 *
 * ⚠️ العطب كان في `analyzeBuild`: قرأت السعة بدالّةٍ تأخذ أوّل رقمٍ
 * وتُهمل وحدته.
 *
 *     '8TB'   → 8        '512GB' → 512
 *     '2TB'   → 2        '500GB' → 500
 *
 * فتجميعةٌ بقرص ٥٠٠ جيجابايت تتفوّق في مقارنة التجميعات على تجميعةٍ بقرص
 * ٨ تيرابايت وتنال نجمة «الأفضل»، والجدول يكتب «2GB» لقرص ٢ تيرابايت.
 *
 * ولم يظهر العطب في الرام لأن سعاتها كلَّها بالجيجابايت — فعاش في
 * التخزين وحده حيث تختلط الوحدتان.
 *
 * والقياس بـ1024 لا 1000 كي يعود التنسيق إلى ما كُتب: '2TB' → 2048 → '2TB'.
 */

/**
 * تُعيد السعة بالجيجابايت من أي صيغةٍ في الكتالوج:
 *
 *   '2TB'          → 2048
 *   '512GB'        → 512
 *   '64GB (2x32GB)'→ 64     (الرقم الصريح أولاً لا حاصل الضرب)
 *   '2x16GB'       → 32     (صيغة الضرب حين لا يوجد رقمٌ صريح)
 *   ''             → 0
 */
export const capacityGb = (raw: unknown): number => {
  if (raw == null) return 0;
  const s = String(raw).toUpperCase();

  const unit = (re: RegExp, factor: number): number | null => {
    const m = s.match(re);
    if (!m) return null;
    const n = parseFloat(m[1]);
    return isFinite(n) ? n * factor : null;
  };

  const tb = unit(/([\d.]+)\s*TB/, 1024);
  if (tb != null) return tb;

  /* ⚠️ الترتيب وحده لا يكفي — الموضع هو الفاصل.
   *
   *   «64GB (2x32GB)» سعتها ٦٤: الرقم الصريح يسبق الضرب فهو المجموع.
   *   «2x16GB»        سعتها ٣٢: لا رقمَ صريحاً، و«16GB» جزءٌ من الضرب.
   *
   * وقراءة أوّل «GB» عمياءً تُعطي ١٦ للثانية — وهو ما كانت تفعله النسخة
   * القديمة رغم أن تعليقها يقول ٣٢. كشفه الفحص، لا القراءة. */
  const mult = s.match(/(\d+)\s*X\s*(\d+)/);
  const gbMatch = s.match(/([\d.]+)\s*GB/);

  if (mult && gbMatch) {
    const multAt = s.indexOf(mult[0]);
    const gbAt = s.indexOf(gbMatch[0]);
    /* الرقم الصريح خارج الضرب (قبله) ⇒ هو المجموع */
    if (gbAt < multAt) return parseFloat(gbMatch[1]);
    return parseInt(mult[1], 10) * parseInt(mult[2], 10);
  }
  if (mult) return parseInt(mult[1], 10) * parseInt(mult[2], 10);
  if (gbMatch) return parseFloat(gbMatch[1]);

  /* «MB/s» سرعةٌ لا سعة — تُستثنى صراحةً */
  const mb = unit(/([\d.]+)\s*MB(?!\/)/, 1 / 1024);
  if (mb != null) return mb;

  const bare = s.match(/[\d.]+/);
  return bare ? parseFloat(bare[0]) : 0;
};

/** يُعيد السعة إلى صيغتها المقروءة — 2048 → «2TB»، و512 → «512GB» */
export const formatCapacity = (gb: number): string => {
  if (!(gb > 0)) return '—';
  if (gb < 1024) return `${Math.round(gb)}GB`;
  const tb = gb / 1024;
  return `${Number.isInteger(tb) ? tb : +tb.toFixed(1)}TB`;
};
