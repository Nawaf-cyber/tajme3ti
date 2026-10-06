/* ============ الرفع بالذكاء الاصطناعي — ما يدعمه كلّ كرت ============
 *
 * الإطارات في lib/gpu-perf بلا رفع، وأغلب اللاعبين يشغّلونه. والزائر يسأل:
 * DLSS أفضل أم FSR؟ وهل يدعمه كرتي؟ وفي كم لعبة؟
 *
 * ⚠️ «أفضل» هنا من اختبارٍ أعمى لا من رأينا: ComputerBase (فبراير 2026)،
 * أكثر من ٦٬٥٠٠ مصوّت، 4K وضع Quality، ستّ ألعاب — DLSS 4.5 ‏48.2٪،
 * الأصليّ 24.0٪، FSR 4 ‏15.0٪، «لا فرق» 12.8٪. **ولم يشمل XeSS** — فلا
 * نرتّب XeSS أمام غيره.
 *
 * ⚠️ والدعم بحسب الجيل، ومصادره (قُرئت 2026-10-06):
 *   • DLSS 4.5 في أكثر من ٤٠٠ لعبة وتطبيق — NVIDIA في CES 2026.
 *   • FSR 4 في أكثر من ٣٠٠ لعبة — AMD، 2026-05-31 (TweakTown).
 *   • FSR 4.1 لرفع الدقة على RX 7000 من تعريف 26.6.2 (يونيو 2026)، بلا
 *     توليد إطاراته؛ وRX 6000 «بداية 2027».
 *   • XeSS في أكثر من ١٦٠ لعبة — 2025 (Notebookcheck)؛ لا رقم أحدث موثوق.
 * تتغيّر هذه بسرعة — تُراجع مع كلّ قراءةٍ لجدول الإطارات.
 */

export type Upscaler = {
  /** «DLSS 4.5» · «FSR 4» · «XeSS» · «FSR 3.1» */
  tech: string;
  /** يرفع بالذكاء الاصطناعي؟ (FSR 3.1 لا) */
  ai: boolean;
  /** توليد الإطارات وما يُقال عنه */
  frameGen: string | null;
  /** عدد الألعاب بمصدره وسنته */
  games: string | null;
  /** للترتيب: ٣ DLSS، ٢ FSR 4 وXeSS على Arc، ١ بلا ذكاء اصطناعي */
  rank: 1 | 2 | 3;
  note?: string;
};

export const UPSCALING_SOURCES = {
  blindTest: {
    name: 'ComputerBase — اختبار أعمى (فبراير 2026)',
    url: 'https://www.notebookcheck.net/Nvidia-DLSS-4-5-slams-AMD-FSR-4-by-a-huge-margin-in-massive-blind-test-with-over-6-700-gamers.1230113.0.html',
  },
  read: '2026-10-06',
} as const;

const DLSS_GAMES = 'أكثر من 400 لعبة وتطبيق (NVIDIA، 2026)';
const FSR4_GAMES = 'أكثر من 300 لعبة (AMD، 2026)';

/** ما يدعمه الكرت — من اسمه. null لما لا نعرف جيله */
export function gpuUpscaler(name: string): Upscaler | null {
  const n = name.toUpperCase();
  if (/\bRTX\s*50\d0/.test(n)) return { tech: 'DLSS 4.5', ai: true, frameGen: 'توليد إطارات متعدد', games: DLSS_GAMES, rank: 3 };
  if (/\bRTX\s*40\d0/.test(n)) return { tech: 'DLSS 4.5', ai: true, frameGen: 'توليد إطارات', games: DLSS_GAMES, rank: 3 };
  if (/\bRTX\s*[23]0\d0/.test(n)) return { tech: 'DLSS 4.5', ai: true, frameGen: null, games: DLSS_GAMES, rank: 3, note: 'رفع الدقة فقط — توليد الإطارات لـ RTX 40 وما بعده' };
  if (/\bRX\s*90\d0/.test(n)) return { tech: 'FSR 4', ai: true, frameGen: 'توليد إطارات', games: FSR4_GAMES, rank: 2 };
  if (/\bRX\s*7\d{3}\b/.test(n)) return { tech: 'FSR 4.1', ai: true, frameGen: 'توليد إطارات FSR 3.1 (بلا ذكاء اصطناعي)', games: FSR4_GAMES, rank: 2, note: 'رفع الدقة من تعريف 26.6.2 (يونيو 2026)' };
  if (/\bRX\s*6\d{3}\b/.test(n)) return { tech: 'FSR 3.1', ai: false, frameGen: 'توليد إطارات FSR 3.1', games: null, rank: 1, note: 'FSR 4.1 متوقّع بداية 2027 بحسب AMD' };
  if (/\bARC\s*[AB]\d{3}/.test(n)) return { tech: 'XeSS', ai: true, frameGen: 'توليد إطارات', games: 'أكثر من 160 لعبة (2025)', rank: 2 };
  if (/\bGTX\b/.test(n)) return { tech: 'بلا DLSS', ai: false, frameGen: null, games: null, rank: 1, note: 'يستعمل FSR 3.1 أو XeSS العامّ' };
  return null;
}

/** «DLSS 4.5 مع توليد إطارات متعدد» */
/* اسم التقنية معزولٌ والباقي عربيّ: «DLSS 4.5 مع توليد إطارات» — اللاتينيّ أوّل الجملة يقلب ترتيبها */
const iso = (x: string) => `\u2068${x}\u2069`;
export const upscalerLine = (u: Upscaler): string => (u.frameGen && u.ai && !/FSR 3\.1/.test(u.frameGen) ? `${iso(u.tech)} مع ${u.frameGen}` : iso(u.tech));
