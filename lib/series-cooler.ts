/**
 * ============ سلاسل المبرّدات — 2026-10-01 ============
 *
 * لا سُلَّم: لم نجد شركة مبرّداتٍ ترتّب خطوطها ترتيباً صريحاً.
 *
 * الضمان من صفحات الشركات:
 *  · Noctua — صفحة مواصفات كلّ موديلٍ عندنا: 6 سنوات.
 *  · NZXT — صفحة الضمان: Kraken بستّ، إلّا Kraken Core RGB (RL-KR24C-B1
 *    وRL-KR36C-B1) بخمس.
 *  · DeepCool — جدولها: LT وMystique خمس، LE ثلاث، وAG «سنتان في أوروبا
 *    وسنةٌ في غيرها» — والسعوديّة غيرها.
 *  · Cooler Master — جدولها: «Other Air Cooler» سنتان (Hyper)، على المروحة
 *    والقطع الكهربائيّة وحدها.
 *  · be quiet! — صفحتا Pure Rock 3 LX وPro 3 LX: ثلاث.
 *  · Thermalright — صفحتها «3-6 Years» بلا تفصيلٍ لكلّ موديل — فمدىً.
 *  · MSI وGamdias وXigmatek وThermaltake — لم نصل إلى رقم، فلا رقم.
 *
 * والاختبارات من TechPowerUp وTom's Hardware بما يمسّ المشتري: الصوت،
 * والتعارض مع الرامات، والتركيب.
 * ⚠️ AG400 مراجَعٌ عند Tom's، وعندنا AG400 G2 — جيلٌ آخر فلا يُنقل.
 * ⚠️ Kraken Plus 360 RGB مراجَعٌ، لكنّ رابط كازاسوق في صفّنا «Kraken Elite
 *    360» — صفٌّ مختلط فلا يُكتب عليه اختبار (والضمان ستٌّ للاثنين).
 */
import type { BrandLine, Source } from './series';

const TPU = (path: string, date: string): Source =>
  ({ name: 'TechPowerUp', url: `https://www.techpowerup.com/review/${path}`, date });
const TOMS = (path: string, date: string, name = "Tom's Hardware"): Source =>
  ({ name, url: `https://www.tomshardware.com/${path}`, date });

export const COOLER_LINES: BrandLine[] = [
  {
    category: 'Cooler', brand: 'Cooler Master',
    warrantySource: 'https://www.coolermaster.com/en-global/warranty-policy.html',
    series: [{ label: 'Hyper', match: /\bHyper\b/i, warranty: 2,
      warrantyNote: 'يشمل المروحة والقطع الكهربائيّة وحدها، بلفظ Cooler Master.' }],
  },
  {
    category: 'Cooler', brand: 'DeepCool',
    warrantySource: 'https://global.deepcool.com/support/Base/index.shtml?id=Warranty',
    series: [
      { label: 'AG', match: /\bAG\d{3}\b/i, warranty: 1,
        warrantyNote: 'سنةٌ خارج أوروبا (وفيها سنتان)، بحسب جدول DeepCool.' },
      { label: 'LE', match: /\bLE\d{3}\b/i, warranty: 3 },
      { label: 'LT', match: /\bLT\d{3}\b/i, warranty: 5 },
      { label: 'Mystique', match: /\bMystique\b/i, warranty: 5 },
    ],
  },
  {
    category: 'Cooler', brand: 'Gamdias',
    series: [{ label: 'Aura GL', match: /\bAura GL/i,
      cleanTest: { ...TPU('gamdias-aura-gl360-v2-aio-cpu-liquid-cooler/11.html', '2025-01'), models: /GL360 V2/i } }],
  },
  {
    category: 'Cooler', brand: 'MSI',
    series: [{ label: 'MAG CoreFrozr', match: /\bCoreFrozr\b/i }],
  },
  {
    category: 'Cooler', brand: 'NZXT',
    warrantySource: 'https://nzxt.com/warranty',
    series: [
      { label: 'Kraken Core', match: /\bKraken Core\b/i, warranty: 5,
        warrantyNote: 'خمس سنوات لـKraken Core RGB (RL-KR24C-B1 وRL-KR36C-B1)، وستٌّ لـKraken Core بلا RGB.' },
      { label: 'Kraken Plus', match: /\bKraken Plus\b/i, warranty: 6 },
    ],
  },
  {
    category: 'Cooler', brand: 'Noctua',
    warranty: 6, warrantySource: 'https://www.noctua.at/en/products/nh-d12l-chromax-black/specifications',
    series: [
      { label: 'NH-D12L', match: /\bNH-D12L\b/i,
        cleanTest: TPU('noctua-nh-d12l-low-height-cpu-air-cooler/10.html', '2022-07') },
      { label: 'NH-L9', match: /\bNH-L9/i },
    ],
  },
  {
    category: 'Cooler', brand: 'Thermalright',
    warranty: [3, 6], warrantyNote: 'تنشر Thermalright مدىً من 3 إلى 6 سنوات بحسب الموديل، ولا تفصّله لكلّ موديل.',
    warrantySource: 'https://www.thermalright.com/support/warranty/',
    series: [
      { label: 'Peerless Assassin', match: /\bPeerless Assassin\b/i,
        cleanTest: { ...TOMS('reviews/thermalright-peerless-assassin-120-se', '2022-09', "Tom's Hardware (على النسخة بلا إضاءة)"), models: /120 SE/i } },
      { label: 'Phantom Spirit', match: /\bPhantom Spirit\b/i,
        issues: [{ level: 'tested', models: /Phantom Spirit 120 EVO/i,
          text: 'يغطّي فتحات الرام الأربع فقد لا تتّسع تحته الرامات العالية، وصوته مرتفعٌ نسبياً بأقصى سرعة، بحسب المراجع.',
          sources: [TPU('thermalright-phantom-spirit-120-evo-argb-cpu-air-cooler/10.html', '2024-04'), TOMS('pc-components/air-cooling/thermalright-phantom-spirit-120-evo-review', '2024-02')] }] },
      { label: 'Assassin X', match: /\bAssassin X\b/i,
        cleanTest: { ...TOMS('pc-components/air-cooling/thermalright-assassin-x-120-r-se-review', '2024-09', "Tom's Hardware (على النسخة بلا إضاءة)"), models: /Refined SE|\bR SE\b/i } },
      { label: 'Assassin Spirit', match: /\bAssassin Spirit\b/i },
      { label: 'Frozen', match: /\bFrozen\b/i },
      { label: 'Dynamic Vision', match: /\bDynamic Vision\b/i },
    ],
  },
  {
    category: 'Cooler', brand: 'Thermaltake',
    series: [{ label: 'TH', match: /\bTH\d{3}\b/i }],
  },
  {
    category: 'Cooler', brand: 'Xigmatek',
    series: [{ label: 'Air-Killer', match: /\bAir-Killer\b/i }],
  },
  {
    category: 'Cooler', brand: 'be quiet!',
    warranty: 3, warrantySource: 'https://www.bequiet.com/en/cpucooler/5592',
    series: [{ label: 'Pure Rock', match: /\bPure Rock\b/i }],
  },
];
