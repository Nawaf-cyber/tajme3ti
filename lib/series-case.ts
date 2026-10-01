/**
 * ============ سلاسل الكيسات — 2026-09-30 ============
 *
 * لا سُلَّم: لم نجد شركة كيساتٍ ترتّب خطوطها ترتيباً صريحاً — فالسلسلة هنا
 * عائلة الموديل (North، O11، KING…) والاسم وحده.
 *
 * الضمان من صفحات الشركات: NZXT سنتان، Corsair سنتان، Fractal سنتان،
 * Cooler Master سنتان «لكلّ سلاسل الكيسات»، Lian Li سنةٌ تشمل الكابلات
 * والمراوح المرفقة، HYTE أربع، Phanteks خمس. والباقون بلا رقم: صفحة
 * Montech لا تذكره، وbe quiet! وThermaltake لم نصل إلى جدولها.
 *
 * والاختبارات من TechPowerUp (.minus في صفحة الخلاصة) وTom's Hardware
 * (عيوب رأس المراجعة)، ويُنقل منها ما يمسّ المشتري فقط: حدود التركيب
 * (المشعاع، طول الكرت)، المراوح المرفقة، الضجيج، التهوية، وقطعةٌ ضعيفة.
 * ولا يُنقل: الحلقات المطّاطيّة، الألوان، أضواء التشغيل، البراغي، السعر.
 * وحين يختلف المصدران يُؤخذ العيب: North XL نظيفٌ عند TechPowerUp و«Noisy»
 * عند Tom's — فعليه ملاحظة، لا «لم يجد ما يمسّ المشتري».
 *
 * ⚠️ ولا يُكتب شيءٌ على صفٍّ روابطُه لمنتجٍ آخر غير المختبَر:
 *   NR200P — روابطنا V2 والمراجعة لـV1 (2021)
 *   TUF GT502 — كازاسوق ومايكرولس «GT502 PLUS»
 *   H9 Flow — أمازون نسخة 2025، وكازاسوق 2023، ومايكرولس RGB
 *   4000D Airflow — كازاسوق «4000D V2» والمراجعة 2020
 *   5000D Airflow — كازاسوق «iCUE 5000D RGB» لا Airflow
 *   Meshify 2 — مايكرولس «Meshify 2 Compact Lite»
 *   Meshify 3 — المراجعة لنسخة Ambience Pro RGB
 */
import type { BrandLine, Source } from './series';

const TPU = (path: string, date: string, name = 'TechPowerUp'): Source =>
  ({ name, url: `https://www.techpowerup.com/review/${path}`, date });
const TOMS = (path: string, date: string): Source =>
  ({ name: "Tom's Hardware", url: `https://www.tomshardware.com/${path}`, date });

const NO_FANS = 'يأتي بلا مراوح، فاحسب ثمنها معه، بحسب المراجع.';

export const CASE_LINES: BrandLine[] = [
  {
    category: 'Case', brand: 'ASUS',
    series: [
      { label: 'TUF Gaming', match: /\bTUF\b/i },
      { label: 'A23', match: /\bA23\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Cooler Master',
    warranty: 2, warrantySource: 'https://www.coolermaster.com/en-global/warranty-policy.html',
    series: [
      { label: 'MasterBox NR', match: /\bNR200/i },
      { label: 'MasterBox', match: /\bMasterBox\b(?!\s*NR)/i,
        issues: [{ level: 'tested', models: /MasterBox 600\b/i,
          text: 'مشعاعٌ بطول 420 مم في الأمام يحدّ ما يُركَّب في السقف، بحسب المراجع.',
          sources: [TPU('cooler-master-masterbox-600/10.html', '2024-08')] }] },
      { label: 'TD500', match: /\bTD500\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Corsair',
    warranty: 2, warrantySource: 'https://help.corsair.com/hc/en-us/articles/360033067832',
    series: [
      { label: '2000D', match: /\b2000D\b/i,
        /* نسخة RGB تأتي بمراوح؛ صفّنا العاديّ */
        issues: [{ level: 'tested', models: /^(?!.*RGB).*2000D/i, text: NO_FANS,
          sources: [TPU('corsair-2000d-airflow/10.html', '2024-04')] }] },
      { label: '4000D', match: /\b4000D\b/i },
      { label: '5000D', match: /\b5000D\b/i },
    ],
  },
  {
    category: 'Case', brand: 'DeepCool',
    series: [
      { label: 'CH', match: /\bCH\d{3}\b/i },
      { label: 'Morpheus', match: /\bMorpheus\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Fractal Design',
    warranty: 2, warrantySource: 'https://www.fractal-design.com/warranty-information/',
    series: [
      { label: 'North', match: /\bNorth\b/i,
        issues: [
          { level: 'tested', models: /Momentum/i,
            text: 'السقف لا يتّسع لأكثر من مشعاع 240 مم ويغطّي منافذ أعلى اللوحة الأمّ، والمشعاع في الأمام يقصّر أقصى طولٍ لكرت الشاشة، بحسب المراجع.',
            sources: [TPU('fractal-design-north-momentum-edition/10.html', '2026-02')] },
          { level: 'tested', models: /\bNorth XL\b/i,
            text: 'صوته مرتفعٌ نسبياً بحسب أحد المرجعين («Noisy»).',
            sources: [TOMS('pc-components/pc-cases/fractal-design-north-xl-review', '2024-03')] },
        ] },
      { label: 'Meshify', match: /\bMeshify\b/i },
    ],
  },
  {
    category: 'Case', brand: 'HAVN',
    series: [
      { label: 'HS 420', match: /\bHS 420\b/i,
        cleanTest: TPU('havn-hs-420-vgpu/10.html', '2024-10') },
    ],
  },
  {
    category: 'Case', brand: 'HYTE',
    warranty: 4, warrantySource: 'https://hyte.com/warranty-service',
    series: [
      { label: 'Y70', match: /\bY70\b/i,
        issues: [
          { level: 'tested', models: /^(?!.*Touch)/i, text: `فتحات التهوية فيه تقيّد مرور الهواء، و${NO_FANS}`,
            sources: [TPU('hyte-y70/10.html', '2024-09')] },
          { level: 'tested', models: /Touch/i, text: `فتحات التهوية فيه تقيّد مرور الهواء، و${NO_FANS}`,
            sources: [TPU('hyte-y70-touch/11.html', '2023-10')] },
        ] },
      { label: 'Y60', match: /\bY60\b/i,
        issues: [{ level: 'tested', text: 'فتحات التهوية فيه تقيّد مرور الهواء، بحسب المراجع.',
          sources: [TPU('hyte-y60/9.html', '2022-03')] }] },
    ],
  },
  {
    category: 'Case', brand: 'Lian Li',
    warranty: 1, warrantyNote: 'ويشمل الكابلات والمراوح المرفقة.',
    warrantySource: 'https://lian-li.com/warranty/',
    series: [
      { label: 'O11', match: /\bO11\b/i,
        issues: [
          { level: 'tested', models: /Dynamic EVO/i, text: NO_FANS,
            sources: [TPU('lian-li-o11-dynamic-evo/10.html', '2021-12')] },
          { level: 'tested', models: /Vision Compact/i,
            text: 'حامل كرت الشاشة المرفق لم يثبّت كرتاً ثقيلاً في الاختبار.',
            sources: [TPU('lian-li-o11-vision-compact/10.html', '2024-10')] },
        ] },
      { label: 'LANCOOL', match: /\bLANCOOL\b/i,
        issues: [{ level: 'tested', models: /\b216\b/i,
          text: 'حامل المروحة الخلفيّة البارز قد يعيق منافذ بعض كروت الشاشة واللوحات الأمّ، بحسب المراجع.',
          sources: [TPU('lian-li-lancool-216-rgb/9.html', '2022-11', 'TechPowerUp (على نسخة 216 RGB)')] }] },
      { label: 'A4-H2O', match: /\bA4-H2O\b/i,
        issues: [{ level: 'tested',
          text: 'مبرّدات المعالج المائيّة التي مضختها على الأنابيب يضيق بها، بحسب المراجع.',
          sources: [TPU('lian-li-x-dan-a4-h2o/9.html', '2022-02', 'TechPowerUp (على النسخة الأولى)')] }] },
    ],
  },
  {
    category: 'Case', brand: 'MAJESTY',
    series: [{ label: 'Galaxy', match: /\bGalaxy\b/i }],
  },
  {
    category: 'Case', brand: 'MSI',
    series: [{ label: 'MAG Forge', match: /\bForge\b/i }],
  },
  {
    category: 'Case', brand: 'Montech',
    series: [
      { label: 'AIR 903', match: /\bAIR 903\b/i,
        issues: [{ level: 'tested', models: /\bMAX\b/i,
          text: 'صوت مراوحه يتذبذب عند 40 إلى 50٪ من سرعتها، بحسب المراجع.',
          sources: [TOMS('pc-components/pc-cases/montech-air-903-max-case-review', '2024-10')] }],
        cleanTest: { ...TPU('montech-air-903-base/10.html', '2024-01'), models: /\bBASE\b/i } },
      { label: 'KING', match: /\bKING\b/i,
        issues: [
          { level: 'tested', models: /KING 65 PRO/i,
            text: 'تبريده متوسّط بحسب المراجع، وواجهته زجاجٌ بلا شبك.',
            sources: [TOMS('pc-components/pc-cases/montech-king-65-pro-case-review', '2024-10'), TPU('montech-king-65-pro/10.html', '2024-10')] },
          { level: 'tested', models: /King 95 Pro/i,
            text: 'حامل القرص الصلب المرفق يتطلّب نزع مراوح الأرضيّة الثلاث، بحسب المراجع.',
            sources: [TPU('montech-king-95-pro/10.html', '2023-12')] },
        ] },
      { label: 'SKY', match: /\bSky (One|Two)\b/i,
        issues: [{ level: 'tested', models: /Sky Two GX/i,
          text: 'تبريده متوسّط، وفتحة كابل كرت الشاشة في الغطاء السفليّ قد لا تتّسع لكابلات بعض الكروت الحديثة، بحسب المراجع.',
          sources: [TOMS('pc-components/pc-cases/montech-sky-two-gx-case-review', '2024-11'), TPU('montech-sky-two-gx/10.html', '2024-04')] }] },
    ],
  },
  {
    category: 'Case', brand: 'NZXT',
    warranty: 2, warrantySource: 'https://nzxt.com/warranty',
    series: [
      { label: 'H9', match: /\bH9\b/i },
      { label: 'H6', match: /\bH6\b/i,
        issues: [{ level: 'tested', models: /\bFlow\b/i,
          text: 'صاخبٌ نسبياً تحت الحمل، ومواضع الأقراص فيه قليلة، بحسب المراجع.',
          sources: [TOMS('pc-components/pc-cases/nzxt-h6-flow-rgb-review', '2023-11')] }] },
      { label: 'H210', match: /\bH210\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Phanteks',
    warranty: 5, warrantySource: 'https://phanteks.com/warranty/',
    series: [
      { label: 'NV', match: /\bNV\d\b/i },
      { label: 'XT', match: /\bXT\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Silverstone',
    series: [{ label: 'SUGO', match: /\bSUGO\b/i }],
  },
  {
    category: 'Case', brand: 'Thermaltake',
    series: [
      { label: 'TR100', match: /\bTR100\b/i,
        issues: [{ level: 'tested',
          text: 'مع مبرّد معالجٍ مائيّ لا يبقى مكانٌ لمراوح إضافيّة، ولا فلتر غبارٍ في أسفله، بحسب المراجع.',
          sources: [TPU('thermaltake-tr100/10.html', '2025-04')] }] },
      { label: 'The Tower', match: /\bTower 300\b/i },
    ],
  },
  {
    category: 'Case', brand: 'Zalman',
    series: [{ label: 'P10', match: /\bP10\b/i }],
  },
  {
    category: 'Case', brand: 'be quiet!',
    series: [
      { label: 'Shadow Base', match: /\bShadow Base\b/i,
        cleanTest: TPU('be-quiet-shadow-base-800-fx/10.html', '2024-03') },
    ],
  },
];
