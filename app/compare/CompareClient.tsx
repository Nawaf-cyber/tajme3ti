'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '../../lib/price';
import { isAvailable, offerDeal } from '../../lib/stores';
import type { AffiliateIds } from '../../lib/affiliate';
import UseInBuildModal from './UseInBuildModal';
import CompareActions from './CompareActions';
import BuyCell from './BuyCell';
import ComparePriceHistory, { SERIES_COLORS, type HistorySeries } from './ComparePriceHistory';
import SuggestPartCard from '../../components/SuggestPartCard';
import { productImage } from '../../lib/image';
import { specLabelLoose } from '../../lib/spec-labels';
import { isFeatureKey } from '../../lib/spec-schema';
import { capacityGb } from '../../lib/capacity';

type Comp = any;

/* ============ أدوات ============ */

const RiyalIcon = ({ size = 'h-4 w-4', colorClass = 'bg-emerald-600 dark:bg-emerald-400' }: { size?: string; colorClass?: string }) => (
  <div
    className={`${size} ${colorClass} inline-block shrink-0`}
    style={{
      maskImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1124.14 1256.39'%3E%3Cpath d='M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z'/%3E%3Cpath d='M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.28-62.16c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.86c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-25.24,73.27-51.67l68.35-104.32c7.27-11.68,11.11-25.15,11.11-38.89v-160.18l132.25-28.11v285.99c50.67-28.45,95.67-66.32,132.25-110.99v-203.42l292.28-62.16Z'/%3E%3C/svg%3E\")",
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    }}
  />
);

// ألوان العلامات التجارية
const brandColor = (brand: string) => {
  const b = (brand || '').toLowerCase();
  if (b.includes('nvidia')) return 'text-lime-500';
  if (b.includes('amd')) return 'text-red-500';
  if (b.includes('intel')) return 'text-blue-500';
  return 'text-slate-500 dark:text-slate-400';
};

/* ============ التسميات: مصدرٌ واحد ============
 *
 * ⚠️ كانت هنا **نسخةٌ ثانية** من خريطة التسميات (~٨٠ مدخلاً) مستقلّة عن
 * `lib/spec-labels.ts`. وقد افترقتا فعلاً: ١٧ مفتاحاً كان يحمل اسمين
 * مختلفين حسب الصفحة التي فتحها الزائر — «المسارات/الخيوط» و«زمن
 * الاستجابة/زمن الوصول» و«حجرتان/غرفتان منفصلتان».
 *
 * وانكشف الأمر حين أُضيف `maxCoolerHeight` إلى الخريطة الأولى فظهر هنا
 * **بالإنجليزية خاماً**: كل مفتاح جديد كان يحتاج تذكّر مكانين.
 *
 * وهو درس السحب نفسه: منطقٌ مشترك في نسختين يحتاج كل إصلاحٍ مرّتين.
 *
 * فالخريطة صارت واحدة، وهذه الصفحة تستوردها. ويحرس التطابق
 * `scripts/label-drift.ts`.
 */
const specLabel = specLabelLoose;

/* ترتيب الصفوف — بالتسميات كما تكتبها `lib/spec-labels.ts` حرفياً.
   ⚠️ أي تغيير لتسميةٍ هناك يجب أن يقابله تغييرٌ هنا، وإلّا سقط الصفّ إلى
   آخر الجدول بصمت. `label-drift` يكشف الافتراق. */
const ROW_ORDER = [
  'المقبس', 'المعمارية', 'الأنوية', 'أنوية الأداء', 'أنوية الكفاءة', 'المسارات',
  'التردد الأساسي', 'التردد الأقصى', 'ذاكرة L3', 'رسوميات مدمجة',
  'ذاكرة الكرت', 'نوع الذاكرة', 'ناقل الذاكرة', 'موصّلات الطاقة', 'تبريد مائي مرفق',
  'الشيبست', 'نوع الرام', 'أقصى رام', 'سرعة الرام', 'فتحات M.2', 'إصدار PCIe',
  'النوع', 'السعة', 'السرعة', 'الطقم', 'زمن الاستجابة', 'البروفايل',
  'الواجهة', 'سرعة القراءة', 'سرعة الكتابة',
  'القدرة', 'شهادة الكفاءة', 'الكابلات',
  'الحجم', 'أقصى طول كرت', 'أقصى ارتفاع مبرّد', 'دعم الرادييتر', 'مقاس المزوّد المقبول',
  'المراوح المرفقة', 'الواجهة الأمامية', 'اللوح الجانبي', 'حجرتان',
  'تركيب عمودي للكرت', 'كابل رايزر', 'تنظيم الكابلات', 'شاشة',
  'المنافذ', 'الطول', 'الرام المدعوم', 'اللون', 'إضاءة RGB',
];



const HIGHER_IS_BETTER = [
  'الأنوية', 'أنوية الأداء', 'أنوية الكفاءة', 'المسارات',
  'التردد الأساسي', 'التردد الأقصى', 'ذاكرة L3',
  'ذاكرة الكرت', 'ناقل الذاكرة', 'سرعة الرام',
  'السعة', 'السرعة', 'أقصى رام', 'فتحات M.2',
  'سرعة القراءة', 'سرعة الكتابة', 'القدرة',
  'أقصى طول كرت',
];
/* زمن الوصول: الأقل أفضل.
 *
 * وثلاثة أُخرجت عمداً — كلّها **مقاييس توافق لا جودة**، فالنجمة عليها
 * تُضلّل: «الطول» (يدخل الكيس أو لا)، و«أقصى ارتفاع مبرّد»، و«دعم
 * الرادييتر». والأخير يكسر المقارنة أصلاً: قيمته قد تكون «2x 360mm»
 * فيقرأ منها الرقم ٢.
 *
 * و«المراوح» أُخرجت لسببٍ آخر: قيمتها نصٌّ مركّب مثل «2x 160mm + 1x 140mm»،
 * وعدُّ المراوح ليس مقياس تبريد — مروحتا ١٦٠ مم في LANCOOL 216 تدفعان
 * هواءً أكثر من أربع مراوح ١٢٠. فالنجمة كانت تُتوَّج للأكثر عدداً لا
 * للأفضل تبريداً.
 */
const LOWER_IS_BETTER = ['زمن الاستجابة'];

/* ============ رقمٌ قابل للمقارنة ============
 *
 * ⚠️ كان يأخذ **أوّل رقم في النص** — فتقرأ «2TB» اثنين و«512GB» خمسمئة
 * واثني عشر. والنتيجة على الشاشة أن قرص ٥١٢ جيجابايت يفوز بالسعة على
 * قرص ٤ تيرابايت، ويُكتب تحت الأخير «أقل بـ ٩٩٪» وهو **ثمانية أضعافه**.
 * أي أن الصفحة التي وظيفتها قول أيّهما أفضل كانت تقلبه.
 *
 * فتُوحَّد الوحدة قبل المقارنة: السعات إلى جيجابايت والترددات إلى
 * ميجاهرتز. والصفوف التي تشترك كلّها في وحدة واحدة (م.ب/ث مثلاً) لا
 * تتأثّر — القسمة على ثابتٍ لا تغيّر الترتيب ولا النسب.
 */
const parseNum = (v: any): number | null => {
  if (v == null) return null;
  const s = String(v);

  const unit = (re: RegExp, factor: number): number | null => {
    const m = s.match(re);
    return m ? parseFloat(m[1]) * factor : null;
  };

  /* السعة → جيجابايت. المنطق في `lib/capacity.ts` وحده: كانت هنا نسخةٌ
     ثالثة، وثلاثُ نسخٍ تعني ثلاثةَ أماكن يجب أن تُصلَح معاً — وقد سقطت
     رابعةٌ منها فعلاً في `analyzeBuild` فقرأت «8TB» ثمانيةً. */
  if (/\d\s*(TB|GB|MB)(?!\/)/i.test(s)) {
    const gb = capacityGb(s);
    if (gb > 0) return gb;
  }

  // التردد → ميجاهرتز
  const ghz = unit(/([\d.]+)\s*GHz/i, 1000);
  if (ghz != null) return ghz;

  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

const compareDirection = (label: string): 'higher' | 'lower' | null => {
  if (LOWER_IS_BETTER.includes(label)) return 'lower';
  if (HIGHER_IS_BETTER.includes(label)) return 'higher';
  return null;
};

/* شهادة كفاءة المزوّد: ترتيب معروف (كلما أعلى كان أفضل).
   نحوّل النص إلى رقم حتى يعمل معه منطق الفائز نفسه. */
const RATING_RANK: Record<string, number> = {
  'titanium': 6,
  'platinum': 5,
  'gold': 4,
  'silver': 3,
  'bronze': 2,
  'white': 1,
  'standard': 1,
};
const ratingRank = (v: any): number | null => {
  if (v == null) return null;
  const s = String(v).toLowerCase();
  for (const key of Object.keys(RATING_RANK)) {
    if (s.includes(key)) return RATING_RANK[key];
  }
  return null;
};

/* موصّلات الطاقة: لا "أفضل" مطلق، لكن 16-pin هو المعيار الأحدث
   (PCIe 5.0). نضع شارة "الأحدث" تعريفياً لا حكماً على الجودة. */
const isModernConnector = (v: any): boolean => {
  if (v == null) return false;
  return /16[\s-]?pin/i.test(String(v));
};

/* ============ المكوّن ============ */

export default function CompareClient({
  selected,
  available,
  categories,
  starterComponents,
  activeCategoryId,
  droppedNames = [],
  history = [],
}: {
  selected: Comp[];
  available: Comp[];
  categories: any[];
  starterComponents: Comp[];
  activeCategoryId: string | null;
  droppedNames?: string[];
  history?: HistorySeries[];
}) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>(activeCategoryId ?? '');
  // القطعة المراد إدراجها في تجميعة محفوظة (null = النافذة مغلقة)
  const [buildTarget, setBuildTarget] = useState<Comp | null>(null);
  // مرجع منطقة التصدير
  const exportRef = useRef<HTMLDivElement | null>(null);

  // عمود مسحوب حالياً (index) — للسحب على سطح المكتب
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const ids = selected.map((c) => c.id);

  /* خصم كل عمود — نفس دالة صفحتَي التصفّح والمنتج، فلا يتباعد الحساب */
  const deals = useMemo(() => selected.map((c) => offerDeal(c)), [selected]);

  /* ---- تحديث الرابط ---- */
  const updateUrl = (newIds: string[]) => {
    if (newIds.length === 0) router.push('/compare');
    else router.push(`/compare?ids=${newIds.join(',')}`);
  };

  const addComponent = (id: string) => {
    if (ids.length >= 3) return;
    updateUrl([...ids, id]);
    setPickerOpen(false);
    search && setSearch('');
  };

  const removeComponent = (id: string) => updateUrl(ids.filter((x) => x !== id));

  /* ---- إعادة ترتيب الأعمدة ---- */
  // الترتيب مصدره الوحيد هو الرابط (?ids=). تحريك عمود = تحريك معرّفه.
  const moveColumn = (from: number, to: number) => {
    if (from === to || to < 0 || to >= ids.length) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateUrl(next);
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };
  const onDrop = (i: number) => {
    if (dragIdx !== null) moveColumn(dragIdx, i);
    onDragEnd();
  };

  /* ---- صفوف المقارنة ---- */
  const specRows = useMemo(() => {
    if (selected.length === 0) return [];
    const labels = new Set<string>();
    selected.forEach((c) => {
      const sp = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
      /* ⚠️ المزايا تُستبعد من الصفوف: هي مصفوفة جُمَل تخصّ قطعةً بعينها،
         ولا يُنتظر لها نظيرٌ في القطع الأخرى — فصفّها يمتلئ بالشرطات،
         وهو بالضبط ما أُخرجت من أجله. مكانها صفحة القطعة وحدها. */
      Object.keys(sp).filter((k) => !isFeatureKey(k)).forEach((k) => labels.add(specLabel(k)));
    });
    return Array.from(labels).sort((a, b) => {
      const ia = ROW_ORDER.indexOf(a);
      const ib = ROW_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'ar');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [selected]);

  const rowData = (label: string) => {
    const values = selected.map((c) => {
      const sp = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
      const key = Object.keys(sp).filter((k) => !isFeatureKey(k)).find((k) => specLabel(k) === label);
      return key ? sp[key] : null;
    });
    let winnerIdx: number[] = [];
    /* فارق النسبة المئوية عن الأفضل في الصف — يُعرض تحت القيمة.
       "أعلى بـ 23%" أوضح بكثير من نجمة تقول "هذا الأفضل" بلا مقدار. */
    let deltas: (string | null)[] = values.map(() => null);

    if (selected.length > 1) {
      // شهادة الكفاءة تُقارَن بالترتيب المعروف لا بالأرقام
      if (label === 'شهادة الكفاءة') {
        const ranks = values.map(ratingRank);
        const valid = ranks.filter((n): n is number => n != null);
        if (valid.length > 1) {
          const best = Math.max(...valid);
          winnerIdx = ranks.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
          if (winnerIdx.length === valid.length) winnerIdx = [];
        }
      } else {
        const dir = compareDirection(label);
        if (dir) {
          const nums = values.map(parseNum);
          const valid = nums.filter((n): n is number => n != null);
          if (valid.length > 1) {
            const best = dir === 'higher' ? Math.max(...valid) : Math.min(...valid);
            winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
            const allEqual = winnerIdx.length === valid.length;
            if (allEqual) winnerIdx = [];

            /* النسبة تُقاس عن الأفضل. نتجاهلها عند التساوي أو القسمة على صفر. */
            if (!allEqual && best !== 0) {
              deltas = nums.map((n) => {
                if (n == null || n === best) return null;
                const pct = Math.round(Math.abs((n - best) / best) * 100);
                if (pct < 1) return null;   // فارق أقل من ١٪ ضجيج
                // الأفضل "أعلى" ⇒ الباقي أقل منه، والعكس
                return dir === 'higher' ? `أقل بـ ${pct}%` : `أعلى بـ ${pct}%`;
              });
            }
          }
        }
      }
    }
    return { values, winnerIdx, deltas };
  };

  /* ---- فلتر "أظهر الفروقات فقط" (#1) ----
     يُخفي الصفوف المتطابقة في كل الأعمدة. مفيد جداً لقطعتين متقاربتين
     حيث تختفي عشرات الصفوف المكرّرة ويبقى ما يفرّق فعلاً. */
  const [diffOnly, setDiffOnly] = useState(false);

  const rowDiffers = (label: string): boolean => {
    const { values } = rowData(label);
    const norm = values.map((v) => (v == null ? '' : String(v).trim().toLowerCase()));
    return new Set(norm).size > 1;
  };

  /* ⚠️ الصفوف المختلفة تُحسب **دائماً**، لا عند تفعيل الفلتر فقط.
     الربط بـdiffOnly كان يخلق حلقة مفرغة: العدّاد صفر ⇒ الزر معطّل ⇒
     لا فلترة ⇒ العدّاد يبقى صفراً. */
  const differingRows = useMemo(
    () => (selected.length > 1 ? specRows.filter(rowDiffers) : specRows),
    [specRows, selected]
  );
  const visibleSpecRows = diffOnly && selected.length > 1 ? differingRows : specRows;
  const identicalCount = specRows.length - differingRows.length;

  /* ⚠️ لا نجمة للوحات ولا للكيسات في صفّ الاستهلاك.
   *
   * «أقلّ استهلاكاً» ميزةٌ حقيقية في المعالج والكرت: أداءٌ مماثل بحرارةٍ
   * وضجيجٍ أقلّ. أمّا اللوحة فاستهلاكها ثابتٌ تقريباً بحكم شيبستها، ولا
   * أحد يفاضل بين لوحتين على خمسة واطات — بل قد يُقلب المعنى: X870E يستهلك
   * أكثر من B650 **لأن فيه شريحتَي شيبست**، أي أنه أقدر لا أسوأ.
   *
   * وقد رُصد ذلك على الشاشة فعلاً: X870E Carbon توّج على B650 TOMAHAWK في
   * هذا الصفّ. والصفّ يبقى معروضاً لأنه يغذّي تقدير الطاقة، لكن بلا حكم. */
  const TDP_JUDGED = ['CPU', 'GPU'];

  const tdpRow = () => {
    const values = selected.map((c) => (c.tdpWattage > 0 ? `${c.tdpWattage}W` : null));
    const nums = selected.map((c) => (c.tdpWattage > 0 ? c.tdpWattage : null));
    const valid = nums.filter((n): n is number => n != null);
    let winnerIdx: number[] = [];
    if (valid.length > 1 && TDP_JUDGED.includes(categoryName)) {
      const best = Math.min(...valid);
      winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
      if (winnerIdx.length === valid.length) winnerIdx = [];
    }
    return { values, winnerIdx };
  };

  const priceRow = () => {
    const nums = selected.map((c) => (c.price > 0 ? c.price : null));
    const valid = nums.filter((n): n is number => n != null);
    let winnerIdx: number[] = [];
    if (valid.length > 1) {
      const best = Math.min(...valid);
      winnerIdx = nums.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
      if (winnerIdx.length === valid.length) winnerIdx = [];
    }
    return { nums, winnerIdx };
  };

  const VALUE_EXPONENT = 2.0;

  /* ============ «القيمة مقابل السعر» ============
   *
   * الأصل: المستوى² ÷ السعر. يصحّ للمعالج والكرت لأن المستوى فيهما = أداء.
   *
   * ⚠️ ولا يصحّ للتخزين: مستوى القرص يعبّر عن **سرعته لا سعته**. فكان قرص
   * 512GB يأخذ ١٠٠/١٠٠ وقرص 2TB يأخذ ٣٥ — بينما القارئ يفهم من «القيمة
   * مقابل السعر» جيجابايتٍ لكل ريال. رقمٌ يقود إلى شراءٍ خاطئ.
   *
   * فللتخزين وحده: السعة × المستوى ÷ السعر. والمستوى يبقى عاملاً كي لا
   * يتصدّر قرصٌ ميكانيكيّ بطيء لمجرّد ضخامته:
   *
   *   NV3 2TB نVMe     2048×3 ÷ 1139 = 5.4  ← الأعلى
   *   BarraCuda 4TB HDD 4096×1 ÷ 1045 = 3.9
   *   S70 Blade 512GB   512×3 ÷  400 = 3.8
   */
  const capacityGb = (c: Comp): number | null => {
    const sp = typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs || {};
    return parseNum(sp.capacity);
  };

  const valueScore = (c: Comp): number | null => {
    if (!c.performanceTier || c.price <= 0) return null;
    if (c.category?.name === 'Storage') {
      const gb = capacityGb(c);
      if (gb) return (gb * c.performanceTier) / c.price;
    }
    return Math.pow(c.performanceTier, VALUE_EXPONENT) / c.price;
  };

  const analysis = useMemo(() => {
    if (selected.length < 2) {
      return { bestValueIdx: -1, topPerfIdx: -1, cheapestIdx: -1, lowTdpIdx: -1, minPrice: 0 };
    }
    const scores = selected.map(valueScore);
    const tiers = selected.map((c) => c.performanceTier ?? 0);
    const prices = selected.map((c) => (c.price > 0 ? c.price : null));
    const tdps = selected.map((c) => (c.tdpWattage > 0 ? c.tdpWattage : null));

    const validScores = scores.filter((s): s is number => s != null);
    const validPrices = prices.filter((p): p is number => p != null);
    const validTdps = tdps.filter((t): t is number => t != null);

    const topTier = Math.max(...tiers);
    const isTierUnique = tiers.filter((t) => t === topTier).length === 1;

    return {
      bestValueIdx: validScores.length > 1 ? scores.indexOf(Math.max(...validScores)) : -1,
      topPerfIdx: isTierUnique && topTier > 0 ? tiers.indexOf(topTier) : -1,
      cheapestIdx: validPrices.length > 1 ? prices.indexOf(Math.min(...validPrices)) : -1,
      /* ⚠️ ثلاث علل كانت هنا، كشفها توحيدُ استهلاك اللوحات:
       *
       * أ) **بلا حارس تساوٍ.** `indexOf(min)` يعيد **أوّل** من يحمل
       *    الأدنى — فلوحتان عند ١٠ واط تُتوَّج إحداهما اعتباطاً. وجدول
       *    الاستهلاك نفسه يحرس هذا (`winnerIdx = []` عند تساوي الجميع)،
       *    فافترق الجدول عن الخلاصة في الحكم على البيانات نفسها.
       *
       * ب) **الفارق يُطبع ولو كان صفراً**: «الأقل استهلاكاً بـ 0 واط».
       *
       * ج) والأهمّ: «أقلّ استهلاكاً» ليست ميزةً في لوحةٍ أو كيس أصلاً —
       *    وقد أُزيلت نجمتها من الجدول، وبقي الحكم في الخلاصة. فتناقض
       *    الصفّ مع خلاصته.
       *
       * ⚠️ ولا يُقرأ `categoryName` هنا: تعريفه يأتي **بعد** هذا الـmemo
       *    في ترتيب الملف، وجسم الـmemo يُنفَّذ وقت الاستدعاء لا وقت
       *    العرض — فقراءته تُلقي ReferenceError. تُقرأ الفئة من القطعة. */
      lowTdpIdx: (() => {
        const cat = selected[0]?.category?.name ?? '';
        if (!TDP_JUDGED.includes(cat)) return -1;
        if (validTdps.length < 2) return -1;
        const lo = Math.min(...validTdps);
        if (validTdps.every((t) => t === lo)) return -1;   // تساوٍ ⇒ لا فائز
        return tdps.indexOf(lo);
      })(),
      minPrice: validPrices.length ? Math.min(...validPrices) : 0,
    };
  }, [selected]);

  /* ---- «أيّهما أنصح؟» (#3) ----
     حكم واحد حاسم لكل حاجة، بدل أن يقرأ المستخدم ٢٠ صفاً ويحتار.
     كل توصية تُشير لعمود صراحةً وتشرح سببها بجملة واحدة. */
  const verdicts = useMemo(() => {
    if (selected.length < 2) return [];
    const { bestValueIdx, topPerfIdx, cheapestIdx, lowTdpIdx, minPrice } = analysis;
    const out: { icon: string; forWhat: string; name: string; why: string; idx: number }[] = [];

    if (topPerfIdx >= 0) {
      const c = selected[topPerfIdx];
      const extra = c.price > minPrice ? ` (أغلى بـ ${formatPrice(c.price - minPrice)} ﷼)` : '';
      out.push({
        icon: '🚀', forWhat: 'للأداء الأعلى', name: c.name, idx: topPerfIdx,
        why: `أعلى مستوى أداء في المقارنة${extra}`,
      });
    }
    if (bestValueIdx >= 0 && bestValueIdx !== topPerfIdx) {
      out.push({
        icon: '⚖️', forWhat: 'لأفضل قيمة', name: selected[bestValueIdx].name, idx: bestValueIdx,
        why: 'أعلى أداء مقابل كل ريال — التوازن الأمثل',
      });
    }
    if (cheapestIdx >= 0 && cheapestIdx !== bestValueIdx && cheapestIdx !== topPerfIdx) {
      out.push({
        icon: '💰', forWhat: 'لأقل ميزانية', name: selected[cheapestIdx].name, idx: cheapestIdx,
        why: `الأوفر سعراً (${formatPrice(selected[cheapestIdx].price)} ﷼)`,
      });
    }
    if (lowTdpIdx >= 0 && selected[lowTdpIdx].tdpWattage > 0
        && lowTdpIdx !== topPerfIdx && lowTdpIdx !== bestValueIdx) {
      const others = selected.filter((_, j) => j !== lowTdpIdx).map((x) => x.tdpWattage).filter((t) => t > 0);
      if (others.length) {
        out.push({
          icon: '🔋', forWhat: 'لأقل استهلاك', name: selected[lowTdpIdx].name, idx: lowTdpIdx,
          why: `أقل بـ ${Math.min(...others) - selected[lowTdpIdx].tdpWattage} واط — مزوّد أصغر وحرارة أقل`,
        });
      }
    }
    return out;
  }, [selected, analysis]);

  const summary = useMemo(() => {
    if (selected.length < 2) return [];
    const { bestValueIdx, topPerfIdx, cheapestIdx, lowTdpIdx } = analysis;
    const out: { name: string; text: string }[] = [];

    selected.forEach((c, i) => {
      const parts: string[] = [];

      if (i === topPerfIdx) {
        const others = selected.filter((_, j) => j !== i).map((x) => x.price).filter((p) => p > 0);
        const cheapestOther = others.length ? Math.min(...others) : 0;
        parts.push(
          cheapestOther && c.price > cheapestOther
            ? `أعلى أداء في المقارنة، لكنه الأغلى بفارق ${(c.price - cheapestOther).toLocaleString('en-US')} ريال`
            : 'أعلى أداء في المقارنة'
        );
      }
      if (i === bestValueIdx && i !== topPerfIdx) parts.push('أفضل قيمة مقابل السعر');
      if (i === cheapestIdx && i !== bestValueIdx && i !== topPerfIdx) parts.push('الأوفر سعراً');

      if (i === lowTdpIdx && c.tdpWattage > 0) {
        const others = selected.filter((_, j) => j !== i).map((x) => x.tdpWattage).filter((t) => t > 0);
        const gap = others.length ? Math.min(...others) - c.tdpWattage : 0;
        if (gap > 0) parts.push(`الأقل استهلاكاً بـ ${gap} واط`);
      }

      if (parts.length) out.push({ name: c.name, text: parts.join('، و') });
    });
    return out;
  }, [selected, analysis]);

  const PICKER_LIMIT = 40;
  /* نُعيد العدد الكامل والمعروض معاً: التذييل كان يعرض طول القائمة بعد
     القصّ (40 دائماً) فيبدو رقماً دقيقاً وهو مسقوف — والرقم الذي لا يطابق
     الواقع يُفقد الثقة. */
  const picker = useMemo(() => {
    const source = activeCategoryId ? available : starterComponents;
    const q = search.toLowerCase();
    const filtered = source.filter((c: Comp) => {
      const matchSearch = `${c.brand} ${c.name}`.toLowerCase().includes(q);
      const matchCat = activeCategoryId ? true : !pickerCategory || c.categoryId === pickerCategory;
      return matchSearch && matchCat;
    });
    return { list: filtered.slice(0, PICKER_LIMIT), total: filtered.length };
  }, [available, starterComponents, search, pickerCategory, activeCategoryId]);

  const pickerList = picker.list;

  const categoryName = selected[0]?.category?.name ?? '';

  /* ============ العرض ============ */

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ===== الرأس ===== */}
        <div className="text-center mb-12">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 bg-cyan-400/25 blur-2xl rounded-full"></div>
            <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-full h-full text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              <path d="M13 2L4.5 13.5H11L10 22L18.5 10.5H12L13 2Z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-tight">
            قارن القطع{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-300">
              جنباً إلى جنب
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            اختر حتى 3 قطع من نفس الفئة وقارن المواصفات والأسعار والأداء دفعة واحدة، لتختار الأنسب بثقة.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            {categoryName && (
              <span className="inline-flex items-center gap-2 font-mono text-[10px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-sm uppercase tracking-widest">
                الفئة: {categoryName}
              </span>
            )}

            {/* جسر لمقارنة التجميعات الكاملة — زرّ لا بطاقة (البطاقة كانت
                تكسر إيقاع الصفحة)، لكن بحجم ووزن يجعلانه ظاهراً فعلاً. */}
            <Link
              href="/compare/builds"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-sm text-[13px] font-black text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/50 dark:border-cyan-400/40 shadow-sm shadow-cyan-500/10 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 hover:shadow-md hover:shadow-cyan-500/30 transition-all active:scale-95"
            >
              <span className="text-base leading-none">⚖️</span>
              تبي تقارن تجميعات كاملة؟
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ===== تنبيه: قطع استُبعدت لأنها من فئة أخرى =====
            المقارنة عبر فئات مختلفة تُنتج جدولاً فارغاً وخلاصة مضلّلة
            (مزوّد طاقة "أعلى أداء" أمام معالج). نستبعدها ونُصرّح بذلك
            بدل أن نُسقطها بصمت فيحتار المستخدم أين ذهبت قطعته. */}
        {droppedNames.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 p-4 rounded-sm border border-amber-500/40 bg-amber-500/[0.07]">
            <span className="w-7 h-7 shrink-0 rounded-sm bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm font-black">!</span>
            <div className="min-w-0 text-right">
              <p className="text-[13px] font-black text-amber-600 dark:text-amber-400">
                استُبعدت {droppedNames.length === 1 ? 'قطعة' : droppedNames.length === 2 ? 'قطعتان' : `${droppedNames.length} قطع`} من فئة مختلفة
              </p>
              <p className="text-[11.5px] font-semibold text-amber-700/80 dark:text-amber-500/70 mt-1 leading-relaxed">
                {droppedNames.join(' · ')} — المقارنة تعمل داخل فئة واحدة فقط{categoryName ? ` (${categoryName})` : ''}،
                لأن مقارنة قطع مختلفة الفئات تُنتج مواصفات غير متقابلة ونتائج بلا معنى.
              </p>
            </div>
          </div>
        )}

        {/* ===== حالة الفراغ ===== */}
        {selected.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-10">
            <svg className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">ابدأ المقارنة</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7 font-medium">
              أضف قطعتين على الأقل من نفس الفئة لتبدأ المقارنة.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 text-sm"
            >
              اختر أول قطعة
            </button>
          </div>
        ) : (
          <>
          {/* ===== شريط الأدوات ===== */}
          <div data-noexport className="flex items-center justify-end mb-4">
            <CompareActions targetRef={exportRef} names={selected.map((c) => c.name)} />
          </div>

          {/* ===== منطقة التصدير ===== */}
          <div ref={exportRef}>

          {/* ===== عنوان الجدول — نفس نمط "الخلاصة" و"المواصفات التقنية" ===== */}
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 px-1">
            <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
            جدول المقارنة
            {categoryName && (
              <span className="font-mono text-[10px] font-normal text-slate-400 tracking-wider">{categoryName}</span>
            )}
          </h2>

          {/* ===== أدوات الجدول: إظهار الفروقات فقط ===== */}
          {selected.length > 1 && specRows.length > 0 && (
            <div data-noexport className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <button
                onClick={() => setDiffOnly(!diffOnly)}
                disabled={identicalCount === 0 && !diffOnly}
                title={identicalCount === 0 && !diffOnly ? 'كل الصفوف مختلفة أصلاً' : 'أخفِ الصفوف المتطابقة'}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[12px] font-black border transition-all active:scale-95 ${
                  diffOnly
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-500/30'
                    : identicalCount === 0
                    ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700/50 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500/60 hover:text-cyan-600 dark:hover:text-cyan-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                أظهر الفروقات فقط
                {identicalCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-black tabular-nums ${diffOnly ? 'bg-white/25' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {diffOnly ? `أُخفي ${identicalCount}` : `${identicalCount} متطابق`}
                  </span>
                )}
              </button>

              {diffOnly && visibleSpecRows.length === 0 && (
                <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  ⚠ كل المواصفات متطابقة — الفرق في السعر والتوفّر فقط
                </span>
              )}
            </div>
          )}

          {/* ===== جدول المقارنة ===== */}
          <div data-export-scroll className="relative bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm overflow-x-auto shadow-sm">
            {/* الزاوية الهندسية — بصمة بطاقات الموقع */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent z-30 pointer-events-none"></div>

            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {/* خانة فارغة (عمود التسميات) — مثبّتة عند التمرير الأفقي */}
                  <th className="sticky right-0 z-20 w-[140px] md:w-[180px] border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm"></th>

                  {/* أعمدة القطع */}
                  {selected.map((c, colIdx) => {
                    const avail = isAvailable(c);
                    const isBest = colIdx === analysis.bestValueIdx;
                    const deal = deals[colIdx];
                    // اللون يطابق خط القطعة في رسم تاريخ السعر أدناه
                    const seriesColor = SERIES_COLORS[colIdx % SERIES_COLORS.length];
                    return (
                      <th
                        key={c.id}
                        draggable
                        onDragStart={() => onDragStart(colIdx)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOverIdx(colIdx);
                        }}
                        onDrop={() => onDrop(colIdx)}
                        className={`p-4 border-b border-r border-slate-200 dark:border-slate-800 align-top relative group/col transition-all cursor-grab active:cursor-grabbing ${
                          isBest ? 'bg-cyan-500/[0.07] dark:bg-cyan-400/[0.06]' : ''
                        } ${dragIdx === colIdx ? 'opacity-40' : ''} ${
                          overIdx === colIdx && dragIdx !== null && dragIdx !== colIdx
                            ? 'ring-2 ring-inset ring-cyan-500/60'
                            : ''
                        }`}
                      >
                        {/* شريط لوني يربط العمود بخطّه في رسم تاريخ السعر */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[3px]"
                          style={{ backgroundColor: seriesColor, opacity: isBest ? 1 : 0.45 }}
                        ></div>

                        {/* كود القطعة — نفس بصمة بطاقات التصفّح وصفحة المنتج */}
                        <div className="mt-1.5 mb-1 font-mono text-[9px] text-slate-400 dark:text-slate-500 tracking-wider text-center">
                          #{c.id.slice(-4).toUpperCase()}
                        </div>

                        {/* شارة أفضل قيمة */}
                        {isBest && (
                          <div className="mb-2 font-mono text-[9px] font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 rounded-sm py-1 uppercase tracking-widest">
                            أفضل قيمة
                          </div>
                        )}
                        
                        {/* زر الإزالة المطور */}
                        <button
                          data-noexport
                          onClick={() => removeComponent(c.id)}
                          aria-label="إزالة القطعة"
                          title="إزالة القطعة"
                          className="absolute top-3 left-3 z-10 w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-600 dark:hover:border-red-600 rounded-full transition-all shadow-sm opacity-100 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* ===== أسهم التحريك (تعمل باللمس، بعكس السحب) ===== */}
                        {selected.length > 1 && (
                          <div data-noexport className="absolute top-3 right-3 z-10 flex gap-0.5">
                            {/* في RTL: "يمين" = فهرس أصغر */}
                            <button
                              onClick={() => moveColumn(colIdx, colIdx - 1)}
                              disabled={colIdx === 0}
                              aria-label="حرّك يميناً"
                              title="حرّك يميناً"
                              className="w-6 h-6 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-600 hover:border-cyan-500/60 disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveColumn(colIdx, colIdx + 1)}
                              disabled={colIdx === selected.length - 1}
                              aria-label="حرّك يساراً"
                              title="حرّك يساراً"
                              className="w-6 h-6 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-600 hover:border-cyan-500/60 disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          </div>
                        )}

                        <Link href={`/components/${c.id}`} className="block group/link mt-2">
                          <div className="relative h-20 md:h-24 bg-white rounded-sm mb-3 flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                            <img
                              src={productImage(c.imageUrl, `/images/${c.categoryId}/boxed.png`)}
                              alt={c.name}
                              loading="lazy"
                              className="max-w-full max-h-full object-contain mix-blend-multiply group-hover/link:scale-105 transition-transform"
                            />
                            {/* شارة الخصم على الصورة — أول ما تلحظه العين */}
                            {deal.pct > 0 && (
                              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-md shadow-rose-500/40 font-mono tabular-nums">
                                ‎-{deal.pct}%
                              </span>
                            )}
                          </div>
                          <div className={`font-mono text-[9px] font-black uppercase tracking-wider mb-1 ${brandColor(c.brand)}`}>
                            {c.brand}
                          </div>
                          <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover/link:text-cyan-600 dark:group-hover/link:text-cyan-400 transition-colors">
                            {c.name}
                          </div>
                        </Link>

                        {!avail && (
                          <div className="mt-2 text-[9px] font-black text-red-600 dark:text-red-500 flex items-center justify-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            غير متوفر
                          </div>
                        )}
                      {/* ===== زر: استخدم في تجميعتي ===== */}
                        <button
                          data-noexport
                          onClick={() => setBuildTarget(c)}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-2 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 rounded-sm transition-all active:scale-[0.98] group/use"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-[10px] md:text-[11px] font-black whitespace-nowrap">
                            استخدم في تجميعتي
                          </span>
                        </button>
                      </th>
                    );
                  })}

                  {/* عمود الإضافة */}
                  {selected.length < 3 && (
                    <th data-noexport className="p-4 border-b border-slate-200 dark:border-slate-800 align-middle" style={{ borderRight: '1px dashed rgba(34,211,238,0.3)' }}>
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="flex flex-col items-center justify-center gap-2 w-full py-6 group/add"
                      >
                        <div className="w-11 h-11 border border-dashed border-cyan-500/50 rounded-sm flex items-center justify-center text-cyan-500 text-2xl font-light group-hover/add:bg-cyan-50 dark:group-hover/add:bg-cyan-950/30 group-hover/add:border-cyan-500 transition-colors">
                          +
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover/add:text-cyan-600 dark:group-hover/add:text-cyan-400 transition-colors">
                          أضف قطعة
                        </span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {/* صفوف المواصفات */}
                {visibleSpecRows.map((label, rowIdx) => {
                  const { values, winnerIdx, deltas } = rowData(label);
                  return (
                    <tr
                      key={label}
                      /* تظليل الصف عند التمرير — يساعد على تتبّع صف عريض */
                      className={`group/row transition-colors hover:bg-cyan-500/[0.06] ${rowIdx % 2 === 0 ? 'bg-cyan-500/[0.03]' : ''}`}
                    >
                      <th
                        scope="row"
                        className="sticky right-0 z-10 py-3.5 px-4 text-right text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm group-hover/row:text-cyan-600 dark:group-hover/row:text-cyan-400"
                      >
                        {label}
                      </th>
                      {values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3.5 px-3 text-center text-xs md:text-sm font-black border-b border-r border-slate-200 dark:border-slate-800 font-mono ${
                            i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04] ' : ''
                          }${
                            winnerIdx.includes(i)
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                          dir="ltr"
                        >
                          {v ?? <span className="text-slate-300 dark:text-slate-700">—</span>}
                          {winnerIdx.includes(i) && <span className="text-amber-400 mr-1">★</span>}
                          {/* فارق النسبة عن الأفضل — يجعل "★" رقماً ملموساً */}
                          {deltas[i] && (
                            <span className="block mt-0.5 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-tight" dir="rtl">
                              {deltas[i]}
                            </span>
                          )}
                          {label === 'موصّلات الطاقة' && isModernConnector(v) && (
                            <span className="block mt-1 text-[9px] font-black text-cyan-600 dark:text-cyan-400 tracking-wide">
                              الأحدث · PCIe 5.0
                            </span>
                          )}
                        </td>
                      ))}
                      {selected.length < 3 && (
                        <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>
                      )}
                    </tr>
                  );
                })}

                {/* صف الاستهلاك */}
                {selected.some((c) => c.tdpWattage > 0) && (() => {
                  const { values, winnerIdx } = tdpRow();
                  return (
                    <tr className={specRows.length % 2 === 0 ? 'bg-cyan-500/[0.03]' : ''}>
                      <th scope="row" className="sticky right-0 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm text-right py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        الاستهلاك
                      </th>
                      {values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3.5 px-3 text-center text-xs md:text-sm font-black border-b border-r border-slate-200 dark:border-slate-800 font-mono ${
                            i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04] ' : ''
                          }${
                            winnerIdx.includes(i) ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'
                          }`}
                          dir="ltr"
                        >
                          {v ?? <span className="text-slate-300 dark:text-slate-700">—</span>}
                          {winnerIdx.includes(i) && <span className="text-amber-400 mr-1">★</span>}
                        </td>
                      ))}
                      {selected.length < 3 && <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* صف مستوى الأداء */}
                {selected.some((c) => c.performanceTier) && (() => {
                  // الأعلى مستوىً هو الفائز — نُخفي النجمة عند تساوي الجميع
                  const tierNums = selected.map((c) => c.performanceTier ?? null);
                  const validTiers = tierNums.filter((n): n is number => n != null);
                  let tierWinners: number[] = [];
                  if (validTiers.length > 1) {
                    const bestTier = Math.max(...validTiers);
                    tierWinners = tierNums.map((n, i) => (n === bestTier ? i : -1)).filter((i) => i >= 0);
                    if (tierWinners.length === validTiers.length) tierWinners = [];
                  }
                  return (
                    <tr className="bg-cyan-500/[0.03]">
                      <th scope="row" className="sticky right-0 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm text-right py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        مستوى الأداء
                      </th>
                      {selected.map((c, i) => (
                        <td key={c.id} className={`py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 ${i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''}`}>
                          <span className="text-sm tracking-widest inline-flex items-center gap-1" dir="ltr">
                            {tierWinners.includes(i) && <span className="text-amber-400">★</span>}
                            <span>
                              <span className="text-cyan-500 dark:text-cyan-400">{'●'.repeat(c.performanceTier ?? 0)}</span>
                              <span className="text-slate-200 dark:text-slate-700">{'●'.repeat(5 - (c.performanceTier ?? 0))}</span>
                            </span>
                          </span>
                        </td>
                      ))}
                      {selected.length < 3 && <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* صف السعر */}
                {(() => {
                  const { nums, winnerIdx } = priceRow();
                  return (
                    <tr>
                      <th scope="row" className="sticky right-0 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm text-right py-4 px-4 text-sm font-black text-slate-900 dark:text-white">السعر</th>
                      {nums.map((p, i) => {
                        const delta = p && analysis.minPrice && p > analysis.minPrice ? p - analysis.minPrice : 0;
                        const cheapestName = analysis.cheapestIdx >= 0 ? selected[analysis.cheapestIdx]?.name : '';
                        return (
                        <td key={i} className={`py-4 px-3 text-center border-r border-slate-200 dark:border-slate-800 ${i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''}`}>
                          {p ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 font-mono font-black text-lg md:text-xl text-emerald-600 dark:text-emerald-400">
                                {formatPrice(p)}
                                <RiyalIcon size="h-4 w-4" />
                                {winnerIdx.includes(i) && <span className="text-amber-400 text-xs">★</span>}
                              </span>
                              {/* السعر قبل الخصم + النسبة — على المتجر الأرخص فقط */}
                              {deals[i]?.pct > 0 && deals[i]?.listPrice && (
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                                    {formatPrice(deals[i].listPrice)}
                                  </span>
                                  <span className="font-mono text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-1.5 rounded-sm tabular-nums">
                                    ‎-{deals[i].pct}%
                                  </span>
                                </span>
                              )}
                              {delta > 0 && cheapestName && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
                                  أغلى بـ <span className="font-mono text-red-500 dark:text-red-400">{delta.toLocaleString('en-US')}</span> ريال من {cheapestName}
                                </span>
                              )}
                              {i === analysis.cheapestIdx && selected.length > 1 && (
                                <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70">الأوفر</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                        );
                      })}
                      {selected.length < 3 && <td style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* صف القيمة الرقمية: يُظهر رقم "القيمة مقابل السعر" صراحةً
                    بدل الاكتفاء بذكر "أفضل قيمة" في الخلاصة. الأعلى أفضل. */}
                {selected.length > 1 && selected.some((c) => c.performanceTier && c.price > 0) && (() => {
                  // نقيس القيمة كمؤشر نسبي 0–100 (الأعلى = أفضل قيمة)
                  const raw = selected.map(valueScore);
                  const validRaw = raw.filter((n): n is number => n != null);
                  const maxRaw = validRaw.length ? Math.max(...validRaw) : 0;
                  const idx = raw.map((s) => (s != null && maxRaw > 0 ? Math.round((s / maxRaw) * 100) : null));
                  let vWinners: number[] = [];
                  if (validRaw.length > 1) {
                    const best = Math.max(...validRaw);
                    vWinners = raw.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
                    if (vWinners.length === validRaw.length) vWinners = [];
                  }
                  return (
                    <tr className="bg-cyan-500/[0.03]">
                      <th scope="row" className="sticky right-0 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm text-right py-3.5 px-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        القيمة مقابل السعر
                        <div className="mt-0.5 font-mono text-[9px] font-normal text-slate-400 leading-tight">
                          مؤشر نسبي · الأعلى أفضل
                        </div>
                      </th>
                      {idx.map((score, i) => (
                        <td key={selected[i].id} className={`py-3.5 px-3 text-center border-b border-r border-slate-200 dark:border-slate-800 ${i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''}`}>
                          {score != null ? (
                            <span className="inline-flex items-center gap-1 font-mono font-black text-base text-slate-900 dark:text-white">
                              {vWinners.includes(i) && <span className="text-amber-400 text-xs">★</span>}
                              {score}
                              <span className="text-[10px] font-normal text-slate-400">/100</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">—</span>
                          )}
                        </td>
                      ))}
                      {selected.length < 3 && <td className="border-b border-slate-200 dark:border-slate-800" style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}></td>}
                    </tr>
                  );
                })()}

                {/* ===== صف الشراء ===== */}
                <tr data-noexport className="bg-slate-50/60 dark:bg-slate-900/30">
                  <th scope="row" className="sticky right-0 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-sm text-right py-4 px-4 text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 align-top">
                    الشراء
                    <div className="mt-1 font-mono text-[9px] font-normal text-slate-400 leading-tight">
                      روابط أفلييت
                    </div>
                  </th>
                  {selected.map((c, i) => (
                    <td
                      key={c.id}
                      className={`py-4 px-3 border-t border-r border-slate-200 dark:border-slate-800 align-top ${
                        i === analysis.bestValueIdx ? 'bg-cyan-500/[0.05] dark:bg-cyan-400/[0.04]' : ''
                      }`}
                    >
                      <BuyCell component={c} />
                    </td>
                  ))}
                  {selected.length < 3 && (
                    <td
                      className="border-t border-slate-200 dark:border-slate-800"
                      style={{ borderRight: '1px dashed rgba(34,211,238,0.15)' }}
                    ></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

        {/* ===== أيّهما أنصح؟ — حكم حاسم قبل التفاصيل ===== */}
        {verdicts.length > 0 && (
          <div className="relative mt-8 bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-5 md:p-6 shadow-sm animate-fade-up">
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none"></div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              أيّهما أنصح؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verdicts.map((v) => (
                <div
                  key={v.forWhat}
                  className="relative flex items-start gap-3 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 overflow-hidden"
                >
                  {/* شريط لون العمود — يربط التوصية بعمودها في الجدول */}
                  <span
                    className="absolute top-0 bottom-0 right-0 w-[3px]"
                    style={{ backgroundColor: SERIES_COLORS[v.idx % SERIES_COLORS.length] }}
                  ></span>
                  <span className="text-lg leading-none mt-0.5 shrink-0">{v.icon}</span>
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                      {v.forWhat}
                    </div>
                    <div className="text-[13px] font-black text-slate-900 dark:text-white leading-snug">{v.name}</div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{v.why}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 dark:text-slate-500 text-center">
              توصيات محسوبة من المستوى والسعر والاستهلاك — لا رأي محرّر
            </p>
          </div>
        )}

        {/* ===== الخلاصة ===== */}
        {summary.length > 0 && (
          <div className="relative mt-8 bg-white/70 dark:bg-[#0F172A]/50 backdrop-blur-sm border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-sm animate-fade-up">
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-cyan-500/60 border-l-[14px] border-l-transparent pointer-events-none"></div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-5">
              <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-500/40"></span>
              الخلاصة
            </h2>

            <ul className="space-y-3">
              {summary.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-black text-slate-900 dark:text-white">{s.name}</span>
                    {' — '}
                    {s.text}.
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              خلاصة محسوبة من مواصفات القطع وأسعارها اللحظية — لا من رأي محرّر.
            </p>
          </div>
        )}

        {/* ===== مقارنة تاريخ الأسعار ===== */}
        {selected.length >= 2 && (
          <ComparePriceHistory
            history={history}
            labels={selected.map((c) => ({ id: c.id, name: c.name, brand: c.brand }))}
          />
        )}

          </div>{/* /منطقة التصدير */}
          </>
        )}

        {/* ===== ملاحظة ختامية ===== */}
        {selected.length >= 2 && (
          <div className="text-center mt-8">
            <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
              <span className="text-amber-400">★</span>
              يشير إلى الأفضل في هذا الصف · العمود المميّز هو أفضل قيمة · اسحب الأعمدة أو استخدم الأسهم لإعادة الترتيب
            </p>
          </div>
        )}

        {/* ===== اقترح قطعة ناقصة ===== */}
        <SuggestPartCard source="compare" className="mt-10 max-w-2xl mx-auto" />

      </div>

      {/* ===== نافذة اختيار القطعة ===== */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0F172A] border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeCategoryId ? `اختر قطعة من فئة ${categoryName}` : 'اختر أول قطعة'}
                </h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  aria-label="إغلاق"
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* فلترة الفئة (فقط عند بدء مقارنة جديدة) */}
              {!activeCategoryId && (
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="w-full mb-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-sm py-2.5 px-3 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم القطعة أو الشركة..."
                autoFocus
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-sm py-2.5 px-3 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none"
              />
            </div>

            {/* قائمة القطع */}
            <div className="overflow-y-auto flex-1 p-3">
              {pickerList.length === 0 ? (
                <p className="text-center py-10 text-sm text-slate-500 font-medium">لا توجد نتائج مطابقة.</p>
              ) : (
                <div className="space-y-1.5">
                  {pickerList.map((c: Comp) => {
                    /* التوفّر والخصم قبل الإضافة لا بعدها — كان المستخدم
                       يضيف قطعة نافدة ثم يكتشف ذلك في الجدول. */
                    const avail = isAvailable(c);
                    const deal = offerDeal(c);
                    return (
                    <button
                      key={c.id}
                      onClick={() => addComponent(c.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/20 border border-transparent hover:border-cyan-500/30 transition-colors text-right group"
                    >
                      <div className="relative w-12 h-12 bg-white rounded-sm shrink-0 flex items-center justify-center p-1 border border-slate-100 dark:border-slate-800">
                        <img
                          src={productImage(c.imageUrl)}
                          alt={c.name}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                        {deal.pct > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[12px] font-black px-1 rounded-sm font-mono tabular-nums shadow-sm">
                            ‎-{deal.pct}%
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className={`font-mono text-[9px] font-black uppercase ${brandColor(c.brand)}`}>{c.brand}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {c.name}
                        </div>
                        {!avail && (
                          <div className="font-mono text-[9px] font-black text-amber-600 dark:text-amber-500 mt-0.5">
                            ⚠ غير متوفر حالياً
                          </div>
                        )}
                      </div>
                      {c.price > 0 && (
                        <span className="flex flex-col items-end shrink-0">
                          <span className={`font-mono font-black text-sm flex items-center gap-1 ${avail ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatPrice(c.price)}
                            <RiyalIcon size="h-3 w-3" colorClass={avail ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400'} />
                          </span>
                          {deal.pct > 0 && deal.listPrice && (
                            <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 line-through" dir="ltr">
                              {formatPrice(deal.listPrice)}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* تذييل النافذة */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="font-mono text-[10px] text-slate-400">
                {picker.total > pickerList.length
                  ? `يُعرض ${pickerList.length} من ${picker.total} — ابحث لتضييق النتائج`
                  : `${picker.total} قطعة متاحة`}
                {' · المقارنة داخل نفس الفئة فقط'}
              </p>
            </div>
          </div>
        </div>
      )}

    {/* ===== نافذة: استخدم في تجميعتي ===== */}
      {buildTarget && (
        <UseInBuildModal
          component={buildTarget}
          onClose={() => setBuildTarget(null)}
        />
      )}

    </div>
  );
}