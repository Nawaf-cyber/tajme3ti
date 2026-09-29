/**
 * ============ السلسلة وضمان الشركة — 2026-09-28 ============
 *
 * «ليس رأينا»: كلُّ ما هنا تنشره الشركة نفسها — ترتيبُ سلاسلها في
 * تشكيلتها، ومدّةُ ضمانها. لا نجوم ولا «الأفضل».
 *
 *  · السُّلَّم (ladder) لا يُكتب إلا إن رتّبت الشركة سلاسلها بنفسها في
 *    صفحةٍ رسميّة. ومن لم ترتّب (Cooler Master، DeepCool…) يبقى بلا سُلَّم،
 *    ولا نرتّبها نحن.
 *  · الضمان من **صفحة المنتج** لا من الأدلّة العامّة — دليل Corsair العامّ
 *    يقول RMe عشر سنوات، وصفحةُ المنتج سبع (قُرئتا 2026-09-28).
 *  · وما لم تنشره الشركة يبقى فارغاً (MSI MAG A-DN) — لا نخمّن.
 *  · والضمان المنشور ضمانُ الشركة، وقد يختلف بالمنطقة (تقوله MSI وGigabyte
 *    صراحةً)؛ والفعليُّ في السعودية يحدّده المتجر والوكيل — يُقال للزائر.
 *
 * المطابقة على اسم القطعة داخل شركتها، وscripts/series-check.ts يتحقّق
 * أنّ كلَّ مزوّدٍ في الكتالوج يطابق سلسلةً واحدة بالضبط.
 */

import { MOTHERBOARD_LINES, MSI_LADDER_SOURCE } from './series-motherboard';

export type Warranty = { min: number; max: number };

/**
 * ============ الملاحظات المعروفة — 2026-09-29 ============
 *
 * درجاتٌ بحسب صدق المصدر، والدرجة ظاهرةٌ للزائر:
 *  · official — من الشركة نفسها: استدعاء، شرط تركيب، بيان.
 *  · tested   — مختبرٌ مستقلّ نسمّيه (HWBusters…)، وبكلامه لا بكلامنا.
 *  · reported — متداولٌ بتقارير مستقلّة كثيرة. **لا يُستعمل الآن عمداً**:
 *    «صفير الملفّات» مثلاً يُبلَّغ عنه في كلّ الشركات وهو حظّ — وسمُه على
 *    موديلٍ دون آخر ظلمٌ لمن وُسم.
 *
 * وما يُكتب هو ما يمسّ المشتري: التركيب، الضجيج، المروحة، الأعطال،
 * والأداء العامّ إن قاله المراجع صراحةً. أمّا دقائق الاختبار (ضبط الحماية
 * على الخطوط الثانويّة، معامل القدرة، التموّج على 115 فولت — والسعودية
 * 230) فلا تُنقل: صحيحةٌ لكنها لا تغيّر قرار الشراء.
 *
 * والملاحظة على الموديل حين تخصّه (models)، وعلى السلسلة حين تتكرّر في
 * اختبار أكثر من موديلٍ منها. والمنتهية تبقى وتُوسم (resolved) ولا تُحذف.
 */
export type IssueLevel = 'official' | 'tested' | 'reported';

type Source = { name: string; url: string; date?: string };

type Issue = {
  level: IssueLevel;
  text: string;
  sources: Source[];
  /** يقصرها على موديلاتٍ بعينها داخل السلسلة */
  models?: RegExp;
  resolved?: string;
};

/** تاريخ مراجعتنا للمصادر — يُعرض مع الملاحظات */
export const ISSUES_CHECKED = '2026-09-29';

export type Series = {
  /** الاسم المعروض — كما تكتبه الشركة */
  label: string;
  match: RegExp;
  /** درجتُها في سُلَّم الشركة؛ وغيابها مع سُلَّمٍ موجود = خارج السُّلَّم (offLadder) */
  family?: string;
  /** لماذا هي خارج السُّلَّم — خطُّ الكيسات الصغيرة، أو سلسلةٌ سابقة */
  offLadder?: string;
  /** سنوات؛ ومدىً إن كان الصفُّ يجمع نسختين بضمانين */
  warranty?: number | [number, number];
  note?: string;
  /** مصدر ضمان السلسلة — وإن غاب فمصدر ضمان الشركة (warrantySource) */
  source?: string;
  issues?: Issue[];
  /** مختبرٌ مستقلّ راجع السلسلة ولم يجد ما يمسّ المشتري — يُقال ذلك بمصدره */
  cleanTest?: Source & { models?: RegExp };
};

export type BrandLine = {
  category: string;
  brand: string;
  /** ترتيبُ الشركة لسلاسلها من الأدنى إلى الأعلى — منشورٌ منها لا مستنتَج.
   *  والدرجة قد تجمع سلسلتين إن جمعتهما الشركة («Pro RS · Steel Legend» عند ASRock). */
  ladder?: string[];
  ladderSource?: string;
  /** ضمان الشركة لكلّ سلاسلها إن نشرته رقماً واحداً (Gigabyte للوحات: 3 سنوات) */
  warranty?: number;
  /** وإن لم تنشر رقماً: ما تقوله هي بلفظها («تختلف بحسب المنطقة») */
  warrantyNote?: string;
  warrantySource?: string;
  series: Series[];
};

/** ما يُقال عن الدرجة في فئةٍ بعينها — تحت السُّلَّم */
const LADDER_NOTE: Record<string, string> = {
  Motherboard: 'الدرجة للسلسلة لا للشريحة: لوحةٌ من سلسلةٍ أدنى بشريحة X670E أو Z790 قد تفوق لوحةً من سلسلةٍ أعلى بشريحة B650 أو B760.',
};

const CORSAIR_LINEUP = 'https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/explaining-the-corsair-psu-lineup/';
const SFF = 'خطّ الكيسات الصغيرة (SFX)';

const PSU_LINES: BrandLine[] = [
  {
    category: 'PSU', brand: 'Corsair',
    ladder: ['CX-M', 'RMe', 'RMx', 'RMx SHIFT', 'HXi', 'HXi SHIFT'], ladderSource: CORSAIR_LINEUP,
    series: [
      { label: 'RMe', family: 'RMe', match: /^RM\d+e\b/i, warranty: 7, source: 'https://www.corsair.com/us/en/p/psu/cp-9020296-na/rme-series-rm850e-fully-modular-low-noise-atx-power-supply-cp-9020296-na',
        issues: [{ level: 'tested', text: 'هادئٌ ويعطي قدرته كاملةً حتى في حرارة 47°م، لكنّ أداءه الكهربائيّ متوسّط (ثبات الجهد مع الأحمال المفاجئة)، ويفضّل المراجع سلسلة RMx لمن يريد أعلى أداء.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/corsair-rm850e-atx-v3-1-psu-review/11/', date: '2025-01' }, { name: 'HWBusters', url: 'https://hwbusters.com/psus/corsair-rm1000e-gen5-psu-review/11/', date: '2023-05' }] }] },
      { label: 'RMx SHIFT', family: 'RMx SHIFT', match: /^RM\d+x\b.*shift/i, warranty: 10, source: 'https://www.corsair.com/us/en/p/psu/cp-9020252-na/rm850x-shift-80-plus-gold-fully-modular-atx-power-supply-cp-9020252-na',
        issues: [{ level: 'official', text: 'منافذ الكابلات على جانب المزوّد لا خلفه، فيحتاج 30 مم على الأقلّ بينه وبين الغطاء الجانبيّ للكيس. تنشر Corsair قائمةً بالكيسات المتوافقة، فراجعها قبل الشراء.', sources: [{ name: 'Corsair', url: 'https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/definitive-list-of-cases-compatible-with-rmx-shift-psus/' }] }],
        cleanTest: { name: 'HWBusters', url: 'https://hwbusters.com/psus/corsair-rm850x-shift-atx-v3-1-psu-review/11/', date: '2025-11' } },
      { label: 'HXi', family: 'HXi', match: /^HX\d+i\b(?!.*shift)/i, warranty: 10, source: 'https://www.corsair.com/us/en/p/psu/cp-9020261-na/hx1500i-fully-modular-ultra-low-noise-platinum-atx-1500-watt-pc-power-supply-cp-9020261-na',
        issues: [{ level: 'tested', models: /HX1500i/i, text: 'جسمه طويلٌ جداً (200 مم) بحسب المراجع، فتأكّد أنّ مكان المزوّد في كيسك يتّسع له. وعدا ذلك أداؤه ممتازٌ وشبه صامت.', sources: [{ name: "Tom's Hardware · نسخة 2025", url: 'https://www.tomshardware.com/pc-components/power-supplies/corsair-hx1500i-2025-atx-3-1-power-supply-review', date: '2025-09' }] }] },
      { label: 'RM (2021)', match: /^RM\d+(\s|$)/i, offLadder: 'سلسلةٌ سابقة، لم تعد في تشكيلة Corsair الحاليّة', warranty: 10, source: 'https://www.corsair.com/us/en/p/psu/cp-9020235-na/rm-series-rm850-850-watt-80-plus-gold-fully-modular-atx-psu-cp-9020235-na' },
      { label: 'SF Platinum', match: /^SF\d+ Platinum/i, offLadder: SFF, warranty: 7, source: 'https://www.corsair.com/us/en/p/psu/cp-9020186-na/sf-series-sf750-750-watt-80-plus-platinum-certified-high-performance-sfx-psu-cp-9020186-na',
        cleanTest: { ...{ name: 'HWBusters', url: 'https://hwbusters.com/psus/corsair-sf850-atx-v3-1-psu-review/11/', date: '2024-06' }, models: /SF850/i },
        issues: [{ level: 'official', models: /^SF(450|600|750)\b/i, text: 'استبدالٌ طوعيّ أعلنته Corsair في 2020 لدفعاتٍ أُنتجت بين أكتوبر 2019 ومارس 2020 (رمز الدفعة من 194448xx إلى 201148xx)، لاحتمال تعطّلها مبكراً في الحرارة والرطوبة العالية. وأكّدت أنّ العطل لا يضرّ بقيّة القطع.', resolved: 'يخصّ تلك الدفعات وحدها. إن اشتريتها مستعملةً فتحقّق من رمز الدفعة على الملصق.', sources: [{ name: "Tom's Hardware (نقلاً عن Corsair)", url: 'https://www.tomshardware.com/news/corsair-recalls-sf-series-platinum-psus-over-failure-concerns', date: '2020-06' }] }] },
    ],
  },
  {
    category: 'PSU', brand: 'MSI',
    /* «from the flagship MEG series to the premium MPG series and the mainstream MAG series» — يعمّ مزوّداتها ولوحاتها */
    ladder: ['MAG', 'MPG', 'MEG'], ladderSource: MSI_LADDER_SOURCE,
    series: [
      /* صفحة المواصفات لا تذكر ضماناً — يبقى فارغاً */
      { label: 'MAG A-DN', family: 'MAG', match: /^MAG A\d+DN\b/i, source: 'https://www.msi.com/Power-Supply/MAG-A600DN/Specification' },
      { label: 'MAG A-BN', family: 'MAG', match: /^MAG A\d+BN\b/i, warranty: 5, source: 'https://us-store.msi.com/MAG-A650BN',
        issues: [{ level: 'tested', models: /A(550|650)BN/i, text: 'موثوقٌ للتجميعات الاقتصاديّة بحسب المراجع، لكنّ مكوّناته من فئةٍ محدودة، وصوته مسموعٌ تحت الحمل، ولا يأتي بموصّل 12V-2x6 الذي تستعمله كروت الشاشة الحديثة، وكابلاته غير قابلةٍ للفكّ.', sources: [{ name: "Tom's Hardware · اختُبر A550BN", url: 'https://www.tomshardware.com/pc-components/power-supplies/msi-mag-a550bn-psu-review', date: '2025-01' }] }] },
      { label: 'MAG A-GL', family: 'MAG', match: /^MAG A\d+GL\b/i, warranty: 10, source: 'https://us-store.msi.com/MAG-A850GL',
        issues: [{ level: 'tested', text: 'مروحتها أعلى صوتاً ممّا ينبغي: أطلقت MSI بعدها سلسلة A-GLS بمنحنى مروحةٍ أهدأ بكثير، والفرق في متوسّط الضجيج بينهما «كبير» بحسب المراجع. إن كان الهدوء يهمّك فابحث عن نسخة GLS.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/msi-mag-a750gls-pcie5-atx-v3-1-psu-review/', date: '2025-06' }] },
                 { level: 'tested', models: /A850GL/i, text: 'أداؤه العامّ غير منافسٍ في اختبار HWBusters، ويرى المراجع أنّ ميزته سعره.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/msi-mag-a850gl-pcie5-850w-psu-review/10/', date: '2023-11' }] }] },
      { label: 'MPG A-G', family: 'MPG', match: /^MPG A\d+G\b/i, warranty: 10, source: 'https://us-store.msi.com/MPG-A1000G-PCIE5',
        issues: [{ level: 'tested', models: /A1000G/i, text: 'ليس من الأهدأ في فئته: متوسّط ضجيجه فوق 30 ديسيبل، ويبقى هادئاً حتى نحو 580 واط. وأداؤه العامّ غير لافتٍ بحسب المراجع.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/msi-mpg-a1000g-pcie5-atx-v3-1-psu-review/11/', date: '2024-02' }] }] },
    ],
  },
  {
    category: 'PSU', brand: 'ASUS',
    /* «TUF… for casual gamers»، «Strix… high-end»، «Thor… flagship builds» */
    ladder: ['PRIME', 'TUF Gaming', 'ROG Strix', 'ROG Thor'], ladderSource: 'https://www.asus.com/motherboards-components/power-supply-units/all-series/',
    series: [
      { label: 'ROG Thor', family: 'ROG Thor', match: /^ROG Thor\b/i, warranty: 10, source: 'https://rog.asus.com/power-supply-units/rog-thor/rog-thor-1200p2-gaming-model/helpdesk_warranty/' },
      { label: 'ROG Strix', family: 'ROG Strix', match: /^ROG Strix\b/i, warranty: 10, source: 'https://rog.asus.com/us/power-supply-units/rog-strix/rog-strix-1200p-gaming/',
        issues: [{ level: 'tested', text: 'أداؤه العامّ دون فئته، ولم يجتز اختبارات ATX 3.1 للأحمال المفاجئة كاملةً، فيرى المراجع سعره صعب التبرير.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/asus-rog-strix-1200p-gaming-atx-v3-1-psu-review/11/', date: '2024-10' }] }] },
      { label: 'ROG Loki', match: /^ROG Loki\b/i, offLadder: SFF, warranty: 10, source: 'https://rog.asus.com/sg/power-supply-units/rog-loki/rog-loki-850p-sfx-l-gaming-model/helpdesk_warranty/',
        issues: [{ level: 'tested', models: /850/, text: 'ضجيجه أعلى ممّا تعلنه ASUS، وإن بقي دون 25 ديسيبل حتى نحو 475 واط.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/asus-rog-loki-sfx-l-850w-psu-review/11/', date: '2023-04' }] }] },
    ],
  },
  {
    category: 'PSU', brand: 'Seasonic',
    /* «CORE… basic»، «FOCUS… mid-range»، «PRIME… flagship» */
    ladder: ['CORE', 'FOCUS', 'VERTEX', 'PRIME'], ladderSource: 'https://seasonic.com/insights/seasonic-guide-to-series-and-specifications/',
    series: [
      { label: 'FOCUS GX', family: 'FOCUS', match: /^Focus GX\b/i, warranty: 10, source: 'https://seasonic.com/focus-gx/',
        cleanTest: { name: 'TechPowerUp', url: 'https://www.techpowerup.com/review/seasonic-focus-gx-atx-3-0-850-w/7.html', models: /GX-850/i } },
      { label: 'FOCUS SGX', family: 'FOCUS', match: /^Focus SGX\b/i, warranty: 10, source: 'https://seasonic.com/focus-sgx/',
        issues: [{ level: 'tested', models: /SGX-650/i, text: 'مقاسه SFX-L، أطول قليلاً من SFX العاديّ، فتأكّد أنّ كيسك يدعمه. وهو هادئٌ حتى نحو 340 واط ثم تشتدّ مروحته في الأحمال العالية، وفيه موصّل EPS واحدٌ للمعالج.', sources: [{ name: "Tom's Hardware", url: 'https://www.tomshardware.com/reviews/seasonic-focus-sgx-650w-sfx-l-psu,6045.html', date: '2019-04' }] }] },
      { label: 'FOCUS Gold', family: 'FOCUS', match: /^FOCUS \d+ Gold\b/i, warranty: 7, note: 'جيلٌ أقدم من FOCUS، وشبه معياريّ.', source: 'https://seasonic.com/focus-gold/' },
    ],
  },
  {
    category: 'PSU', brand: 'be quiet!',
    /* صفحة المزوّدات من الأعلى: Dark Power ← Power Zone ← Pure Power ← System Power */
    ladder: ['System Power', 'Pure Power', 'Power Zone', 'Dark Power'], ladderSource: 'https://www.bequiet.com/en/powersupply',
    series: [
      { label: 'Pure Power 13 M', family: 'Pure Power', match: /^Pure Power 13 M\b/i, warranty: 10, source: 'https://www.bequiet.com/en/press/38769',
        cleanTest: { name: 'HWBusters · اختُبر 550W', url: 'https://hwbusters.com/psus/be-quiet-pure-power-13-m-550w-atx-v3-1-psu-review/11/', date: '2025-07' } },
      { label: 'Power Zone 2', family: 'Power Zone', match: /^Power Zone 2\b/i, warranty: 10, source: 'https://www.bequiet.com/en/press/38769',
        cleanTest: { name: 'HWBusters', url: 'https://hwbusters.com/psus/be-quiet-power-zone-2-850w-atx-v3-1-psu-review/11/', date: '2025-03' } },
      { label: 'Straight Power 12', match: /^Straight Power 12\b/i, offLadder: 'سلسلةٌ سابقة، لم تعد في صفحة be quiet! الحاليّة', warranty: 10, source: 'https://www.bequiet.com/en/powersupply/4111',
        cleanTest: { name: "Tom's Hardware", url: 'https://www.tomshardware.com/pc-components/power-supplies/be-quiet-straight-power-12-750w-psu-review', date: '2024-10' } },
    ],
  },
  /* ---- شركاتٌ لا تنشر ترتيباً لسلاسلها: سلسلةٌ وضمانٌ فقط ---- */
  {
    category: 'PSU', brand: 'Cooler Master',
    series: [
      { label: 'MWE Gold V2', match: /^MWE Gold \d+ V2\b/i, warranty: 5, source: 'https://www.coolermaster.com/en-global/products/mwe-gold-750-v2-full-modular.html' },
      { label: 'GX III Gold', match: /^GX III Gold\b/i, warranty: 10, source: 'https://www.coolermaster.com/en-global/products/gx-iii-gold-850.html',
        issues: [{ level: 'tested', models: /850/, text: 'مروحته من فئةٍ أدنى (Yate Loon)، ويشكّ المراجع أن تصمد طوال ضمان العشر سنوات. ومنحنى سرعتها كان يمكن أن يكون أهدأ.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/cooler-master-gx-iii-850w-atx-v3-0-psu-review/11/', date: '2024-01' }] }] },
      { label: 'V SFX Gold', match: /^V\d+ SFX Gold\b/i, warranty: 10, source: 'https://www.coolermaster.com/en-global/products/v850-sfx-gold.html' },
    ],
  },
  {
    category: 'PSU', brand: 'DeepCool',
    series: [
      { label: 'PL-D', match: /^PL\d+D\b/i, warranty: 5, source: 'https://www.deepcool.com/products/PowerSupplyUnits/powersupplyunits/PL550D-V2-ATX3.1-Direct-Power-Supply/2024/19090.shtml',
        issues: [{ level: 'tested', models: /PL550D/i, text: 'صاخبٌ ومنصّته قديمة. ويرى المراجع أنّ ضبط موصّل كرت الشاشة على 600 واط — في مزوّدٍ قدرته كلّها 550 — خطأٌ يحتاج إصلاحاً، وكذلك ضبط حماية الحمل الزائد.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/deepcool-pl550d-atx-v3-1-psu-review/11/', date: '2024-05' }] }] },
      { label: 'PQ', match: /^PQ\d+G\b/i, warranty: 10, source: 'https://hwbusters.com/psus/deepcool-pq1200g-atx-v3-1-psu-review/',
        issues: [{ level: 'tested', models: /PQ1200G/i, text: 'أداؤه العامّ غير منافس وكفاءته متوسّطة، مع ثباتٍ جيّد في خطّ 12 فولت — وهو الأهمّ لكرت الشاشة.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/deepcool-pq1200g-atx-v3-1-psu-review/11/', date: '2024-05' }] }] },
    ],
  },
  {
    category: 'PSU', brand: 'Gigabyte',
    series: [
      { label: 'P-SS', match: /^P\d+SS\b/i, warranty: 3, source: 'https://www.gigabyte.com/Support/Consumer/Warranty/Power-Supply' },
    ],
  },
  {
    category: 'PSU', brand: 'NZXT',
    series: [
      { label: 'C Gold', match: /^C\d+ Gold\b/i, warranty: [7, 10], note: 'المتاجر تبيع باسمها نسختين: C850 Gold بعشر سنوات، وC850 Gold Core بسبع — تحقّق من اسم النسخة عند الشراء.', source: 'https://support.nzxt.com/hc/en-us/articles/4408038297499-How-long-is-the-Warranty-for-NZXT-products' },
    ],
  },
  {
    category: 'PSU', brand: 'Thermalright',
    series: [
      { label: 'KG', match: /^TR-KG\d+/i, warranty: 5, source: 'https://www.thermalright.com/product/kg-650-w/',
        issues: [{ level: 'tested', text: 'مروحته بمحملٍ انزلاقيّ (sleeve) لا تتوقّف أبداً ويعلو صوتها مع الحرارة، وأغلب مكوّناته من مصادر غير معروفة. وحجّته السعر وضمان الخمس سنوات.', sources: [{ name: "Tom's Hardware · اختُبر KG750 من المنصّة نفسها", url: 'https://www.tomshardware.com/pc-components/power-supplies/thermalright-tr-kg750-750w-power-supply-review', date: '2026-09' }] }] },
    ],
  },
  {
    category: 'PSU', brand: 'Thermaltake',
    series: [
      { label: 'Toughpower GF3', match: /^Toughpower GF3\b/i, warranty: 10, source: 'https://www.thermaltake.com/toughpower-gf3-1000w-gold-tt-premium-edition.html',
        issues: [{ level: 'tested', models: /1000W/i, text: 'هادئٌ حتى نحو 540 واط ويعلو صوته في الأحمال العالية، ولا يأتي إلا بكابلَي PCIe من نوع 6+2 (كلٌّ بفرعين) إلى جانب موصّل 12VHPWR.', sources: [{ name: 'HWBusters', url: 'https://hwbusters.com/psus/thermaltake-toughpower-gf3-1000w-atx-v3-0-psu-review/11/', date: '2022-10' }] }] },
      { label: 'Toughpower PT', match: /^Toughpower PT\b/i, warranty: 10, source: 'https://www.thermaltake.com/toughpower-pt-1000w.html',
        cleanTest: { name: 'HWBusters', url: 'https://hwbusters.com/psus/thermaltake-toughpower-pt-1000-atx-v3-1-psu-review/11/', date: '2025-11' } },
    ],
  },
];

/* كلُّ فئةٍ بعد المزوّدات في ملفّها — lib/series-<فئة>.ts */
const LINES: BrandLine[] = [...PSU_LINES, ...MOTHERBOARD_LINES];

export type SeriesInfo = {
  brand: string;
  label: string;
  /** السُّلَّم كاملاً إن نشرته الشركة */
  ladder?: string[];
  ladderSource?: string;
  /** موضعها فيه (يبدأ من ١) — غائبٌ إن كانت خارجه */
  rank?: number;
  offLadder?: string;
  ladderNote?: string;
  warranty?: Warranty;
  warrantyNote?: string;
  note?: string;
  /** مصدر الضمان — فارغٌ إن لم يكن */
  source: string;
  /** ما يخصّ هذه القطعة من ملاحظات سلسلتها */
  issues: Omit<Issue, 'models'>[];
  cleanTest?: Source;
};

const norm = (s: string) => s.trim().toLowerCase();

/** كلُّ السلاسل المطابقة — للفحص؛ والعرضُ يأخذ الأولى */
export function matchSeries(c: { brand: string; name: string }, category: string): SeriesInfo[] {
  const line = LINES.find((l) => l.category === category && norm(l.brand) === norm(c.brand));
  if (!line) return [];
  return line.series.filter((s) => s.match.test(c.name.trim())).map((s) => {
    const rank = s.family && line.ladder ? line.ladder.indexOf(s.family) + 1 || undefined : undefined;
    const w = s.warranty ?? line.warranty;
    return {
      brand: line.brand,
      label: s.label,
      ladder: line.ladder,
      ladderSource: line.ladderSource,
      rank,
      offLadder: s.offLadder,
      /* تشرح الدرجة، فلا تظهر إلا معها */
      ladderNote: rank ? LADDER_NOTE[category] : undefined,
      warranty: w == null ? undefined : Array.isArray(w) ? { min: w[0], max: w[1] } : { min: w, max: w },
      warrantyNote: w == null ? line.warrantyNote : undefined,
      note: s.note,
      source: s.source ?? line.warrantySource ?? '',
      issues: (s.issues ?? []).filter((i) => !i.models || i.models.test(c.name)).map(({ models: _m, ...i }) => i),
      cleanTest: s.cleanTest && (!s.cleanTest.models || s.cleanTest.models.test(c.name))
        ? { name: s.cleanTest.name, url: s.cleanTest.url, date: s.cleanTest.date }
        : undefined,
    };
  });
}

export function seriesInfo(c: { brand: string; name: string }, category: string): SeriesInfo | null {
  return matchSeries(c, category)[0] ?? null;
}

/** «7 سنوات» · «12 سنة» · «7 إلى 10 سنوات» */
export function warrantyText(w: Warranty): string {
  const unit = (n: number) => (n >= 3 && n <= 10 ? 'سنوات' : 'سنة');
  return w.min === w.max ? `${w.min} ${unit(w.min)}` : `${w.min} إلى ${w.max} ${unit(w.max)}`;
}

/** السطر الواحد تحت القطعة المختارة */
export function seriesLine(s: SeriesInfo): string {
  const parts = [`سلسلة ${s.label}`];
  if (s.rank && s.ladder) parts.push(`الدرجة ${s.rank} من ${s.ladder.length} في تشكيلة ${s.brand}`);
  else if (s.offLadder === SFF) parts.push(SFF);
  if (s.warranty) parts.push(`ضمان الشركة ${warrantyText(s.warranty)}`);
  return parts.join(' · ');
}
