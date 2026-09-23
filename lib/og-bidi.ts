/* ============ السطرُ العربيّ لمولّد الصور ============
 *
 * `next/og` (Satori) يخطئ في العربيّ خطأين، قِيس كلاهما قبل كتابة هذا:
 *
 * ١. **يرصّ الكلمات من اليسار**: «تجميعة نواف — متوافقة» تُقرأ من اليمين
 *    «متوافقة — نواف تجميعة».
 * ٢. **يقيس الكلمة بحروفها المنفصلة ويرسمها موصولة**: فيبقى على يمين كلِّ
 *    كلمةٍ فراغٌ بقدر ما وفّره الوصل — «كرت ␣␣␣ الشاشة». وأُثبت بإطارٍ حول
 *    كلّ كلمة: الإطار أعرض من حروفها.
 *
 * والعلاج واحدٌ للاثنين: نعطيه **الترتيب المرئيّ بأشكال العرض الموصولة
 * جاهزةً** (U+FE70–FEFF). فلا يصل شيئاً، فيقيس ما يرسم، ويرسم كما أعطيناه
 * من اليسار. ⚠️ والخطُّ يجب أن يحمل الأشكال كلَّها: Cairo وTajawal وChanga ينقصها
 * الشكلُ المنفصل (٣٦ حرفاً) فتُرسم تلك الحروف بخطٍّ احتياطيٍّ نحيف.
 * IBM Plex Sans Arabic كامل — فُحص جدولُ حروفه قبل اختياره.
 *
 * ⚠️ سطرٌ واحد لا أكثر: لو التفّ لصار سطرُه الأوّل آخرَ الكلام. فمن
 * يستدعيها يقصّ بـ`maxChars` — والقصُّ على الترتيب المنطقيّ قبل العكس.
 */

/** علاماتُ الاتجاه الخفيّة — `toLocaleDateString('ar')` يضعها بين أجزاء التاريخ */
const MARKS = /[\u200E\u200F\u061C]/;
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN = /[A-Za-z0-9]/;
const HARAKAT = /[\u064B-\u0652\u0670]/g;
const TATWEEL = '\u0640';

/* ============ الوصل ============
 * [أوّلُ الأشكال في U+FExx، ثنائيُّ الوصل؟] — ثنائيُّ الوصل أربعةُ أشكالٍ
 * متتالية (منفصل، أخير، أوّل، وسط)، ويمينيُّه شكلان (منفصل، أخير). */
const FORMS: Record<string, [number, boolean]> = {
  'ء': [0xfe80, false], 'آ': [0xfe81, false], 'أ': [0xfe83, false], 'ؤ': [0xfe85, false],
  'إ': [0xfe87, false], 'ئ': [0xfe89, true], 'ا': [0xfe8d, false], 'ب': [0xfe8f, true],
  'ة': [0xfe93, false], 'ت': [0xfe95, true], 'ث': [0xfe99, true], 'ج': [0xfe9d, true],
  'ح': [0xfea1, true], 'خ': [0xfea5, true], 'د': [0xfea9, false], 'ذ': [0xfeab, false],
  'ر': [0xfead, false], 'ز': [0xfeaf, false], 'س': [0xfeb1, true], 'ش': [0xfeb5, true],
  'ص': [0xfeb9, true], 'ض': [0xfebd, true], 'ط': [0xfec1, true], 'ظ': [0xfec5, true],
  'ع': [0xfec9, true], 'غ': [0xfecd, true], 'ف': [0xfed1, true], 'ق': [0xfed5, true],
  'ك': [0xfed9, true], 'ل': [0xfedd, true], 'م': [0xfee1, true], 'ن': [0xfee5, true],
  'ه': [0xfee9, true], 'و': [0xfeed, false], 'ى': [0xfeef, false], 'ي': [0xfef1, true],
};
/** لام + ألف: شكلٌ واحد (منفصل، أخير) */
const LAM_ALEF: Record<string, number> = { 'آ': 0xfef5, 'أ': 0xfef7, 'إ': 0xfef9, 'ا': 0xfefb };

/** هل يصل بما بعده؟ */
const joinsNext = (c?: string) => c === TATWEEL || (!!c && !!FORMS[c]?.[1]);
/** هل يقبل الوصل ممّا قبله؟ */
const joinsPrev = (c?: string) => c === TATWEEL || (!!c && !!FORMS[c] && c !== 'ء');

/** حروفٌ عربيّة متتالية ← أشكالُها الموصولة، بالترتيب المنطقيّ */
export function shape(run: string): string {
  const s = [...run.replace(HARAKAT, '')];
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const fromPrev = joinsNext(s[i - 1]) && joinsPrev(c);

    if (c === 'ل' && LAM_ALEF[s[i + 1]]) {
      out += String.fromCharCode(LAM_ALEF[s[i + 1]] + (fromPrev ? 1 : 0));
      i++;
      continue;
    }
    const f = FORMS[c];
    if (!f || c === 'ء') { out += f ? String.fromCharCode(f[0]) : c; continue; }

    const toNext = f[1] && joinsPrev(s[i + 1]);
    const k = f[1] ? (fromPrev ? (toNext ? 3 : 1) : toNext ? 2 : 0) : fromPrev ? 1 : 0;
    out += String.fromCharCode(f[0] + k);
  }
  return out;
}

/* ============ الكلمة العربيّة بترتيبها المرئيّ ============
 * حروفٌ موصولةٌ معكوسة، وأرقامٌ على ترتيبها، وعلاماتٌ تُقلب جهتُها
 * («/٩» تُرى «٩/»، و«(» تصير «)») — ثمّ الكتلُ كلُّها معكوسة. */
const MIRROR: Record<string, string> = { '(': ')', ')': '(', '[': ']', ']': '[', '«': '»', '»': '«', '<': '>', '>': '<' };
const CLUSTER = /[\u0621-\u064A\u0640\u064B-\u0652\u0670]+|[0-9\u0660-\u0669\u06F0-\u06F9]+|[A-Za-z]+|./gu;

const visualWord = (w: string) =>
  (w.match(CLUSTER) ?? [])
    .map((c) =>
      /[\u0621-\u064A]/.test(c) ? [...shape(c)].reverse().join('') : MIRROR[c] ?? c,
    )
    .reverse()
    .join('');

type Kind = 'R' | 'L' | 'N';
type Seg = { text: string; kind: Kind; glue: boolean };

const kindOf = (s: string): Kind => (ARABIC.test(s) ? 'R' : LATIN.test(s) ? 'L' : 'N');

/** يقصّ منطقيّاً على حدّ كلمة، ويضع «…» في آخر الكلام */
export function clip(text: string, maxChars: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if ([...t].length <= maxChars) return t;
  const cut = [...t].slice(0, maxChars - 1).join('');
  const atWord = cut.replace(/\s+\S*$/, '');
  return (atWord.length > maxChars / 2 ? atWord : cut).trim() + '…';
}

/** قطعةٌ مرئيّة: `gap` = مسافةٌ بينها وبين التي على يسارها */
export type Piece = { text: string; gap: boolean };

/**
 * السطرُ قطعاً بترتيبها المرئيّ من اليسار — كلُّ قطعةٍ عنصرٌ مستقلّ،
 * والمسافة هامشٌ يرسمه المستدعي. سطرٌ لاتينيٌّ خالص يعود قطعةً واحدة.
 */
export function rtlPieces(text: string, maxChars = Infinity): Piece[] {
  const t = clip(text, maxChars);
  if (!ARABIC.test(t)) return [{ text: t.replace(new RegExp(MARKS.source, 'g'), ''), gap: false }];

  /* مقاطع: الكلمات بالمسافات، وداخل الكلمة بعلامات الاتجاه (`glue` = لا مسافة قبله) */
  const segs: Seg[] = [];
  for (const word of t.split(' ')) {
    word.split(MARKS).forEach((part, i) => {
      if (part) segs.push({ text: part, kind: kindOf(part), glue: i > 0 });
    });
  }

  /* اللاتينيّ المتتالي كتلةٌ واحدة بترتيبه — «RTX 5070 Ti» لا «Ti 5070 RTX» —
     ومعه المحايدُ الواقع بين لاتينيَّين */
  const runs: Seg[] = [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const prev = runs[runs.length - 1];
    const nextKind = segs.slice(i + 1).find((x) => x.kind !== 'N')?.kind;
    const joinsLatin =
      prev && prev.kind === 'L' && (s.kind === 'L' || (s.kind === 'N' && nextKind === 'L'));
    if (joinsLatin) prev.text += (s.glue ? '' : ' ') + s.text;
    else runs.push({ ...s, text: s.kind === 'L' ? s.text : visualWord(s.text) });
  }

  /* العكس: آخرُ الكلام يساراً. والمسافة على يسار القطعة هي التي كانت
     قبل القطعة التي تليها منطقيّاً */
  const out: Piece[] = [];
  for (let i = runs.length - 1; i >= 0; i--) {
    out.push({ text: runs[i].text, gap: i < runs.length - 1 && !runs[i + 1].glue });
  }
  return out;
}

/** للفحص: القطعُ مضمومةً بمسافاتها */
export const rtlLine = (text: string, maxChars = Infinity) =>
  rtlPieces(text, maxChars).map((p) => (p.gap ? ' ' : '') + p.text).join('');
