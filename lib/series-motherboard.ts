/**
 * ============ سلاسل اللوحات الأمّ — 2026-09-29 ============
 *
 * على قاعدة lib/series.ts نفسها: السُّلَّم لمن صرّحت بترتيبه، لا من ترتيب
 * قوائم الفرز في مواقعها — قائمة Gigabyte تضع AERO (لصنّاع المحتوى) بين
 * AORUS وGAMING، وقائمة MSI تضع «Gaming» بعد PRO، فالقائمة ليست تصريحاً.
 *
 *  · ASUS  — صفحة كلّ السلاسل: ROG «ultimate gaming performance»، TUF
 *            «durable reliability… great value»، Prime «accessible versatility»،
 *            وProArt لصنّاع المحتوى خارجها. وMAX Gaming مصنّفةٌ «others».
 *  · MSI   — بيانها (2024-06): «from the flagship MEG series to the premium MPG
 *            series and the mainstream MAG series». وPRO وGaming خارج الثلاث.
 *  · ASRock — بيانها (2024-09): «from the flagship Taichi series to the
 *            mainstream Steel Legend and Pro RS» — فالدرجتان جماعيّتان كما قالت،
 *            ولا نفصل Steel Legend عن Pro RS وإن شاع أنها أعلى.
 *  · Gigabyte — لم نجد تصريحاً بترتيب AORUS وGAMING وULTRA DURABLE، فلا سُلَّم.
 *
 * والضمان: Gigabyte وحدها تنشر رقماً (3 سنوات، «قد يختلف بحسب المنطقة»).
 * ASUS وMSI تقولان إنه يختلف بحسب المنطقة وتحيلان إلى المكتب المحلّي،
 * وASRock تجعله عبر الموزّع — فيُقال ذلك بلفظهنّ بدل رقمٍ مخترَع.
 */
import type { BrandLine, Issue } from './series';

/**
 * ============ ملاحظات الشرائح — 2026-09-29 ============
 *
 * حدودٌ تعلنها AMD وIntel نفسها، لا عيوب لوحة. تعمّ كلَّ لوحةٍ بالشريحة
 * أيّاً كانت شركتها، ولا يعرفها المشتري إلا بعد الشراء — فمكانها هنا.
 */
const AMD_AM5 = 'https://www.amd.com/en/products/processors/chipsets/am5.html';
export const MOTHERBOARD_CHIPSET_ISSUES: Issue[] = [
  {
    level: 'official', models: /\bA620/i,
    text: 'شريحة A620 لا تسمح برفع سرعة المعالج (ومنه ميزة PBO) بحسب AMD، وتسمح بتشغيل الرامات بسرعة EXPO المكتوبة عليها.',
    sources: [{ name: 'AMD', url: AMD_AM5 }],
  },
  {
    /* لوحات 600 من AM5 — وصلت قبل معالجات 8000 و9000 وقبل إصلاح 2023 */
    level: 'official', models: /\b(A620|B650|X670)/i,
    text: 'حدّث BIOS قبل التركيب أو اسأل المتجر عنه: تقول AMD إنّ معالجات Ryzen 8000 و9000 قد تحتاج تحديثاً على لوحات 600. وفي 2023 احترقت معالجات Ryzen 7000 (خصوصاً X3D) في بعض لوحات AM5 من جهدٍ زائد، فحدّت AMD الجهد بتحديث BIOS (AGESA 1.0.0.7 وما بعده).',
    resolved: 'مشكلة الاحتراق عولجت منذ مايو 2023، واللوحات الحديثة تأتي بالإصلاح. يبقى التحديث للمخزون القديم.',
    sources: [
      { name: 'AMD', url: AMD_AM5 },
      { name: "Tom's Hardware (بيان AMD)", url: 'https://www.tomshardware.com/news/amd-issues-follow-up-statement-on-ryzen-burnout-issues-limits-soc-voltages', date: '2023-04' },
    ],
  },
  {
    level: 'official', models: /\bH610/i,
    text: 'لا تدعم Intel في شريحة H610 رفع سرعة الرامات، فتعمل الرامات بالسرعة الأساسيّة التي يدعمها المعالج لا بسرعة XMP المكتوبة على علبتها.',
    sources: [{ name: 'Intel', url: 'https://www.intel.com/content/www/us/en/products/sku/218829/intel-h610-chipset/specifications.html' }],
  },
  {
    level: 'official', models: /\bH810/i,
    text: 'لا تدعم Intel في شريحة H810 رفع سرعة الرامات، فتعمل الرامات بالسرعة الأساسيّة التي يدعمها المعالج لا بسرعة XMP المكتوبة على علبتها.',
    sources: [{ name: 'Intel', url: 'https://www.intel.com/content/www/us/en/products/sku/241150/intel-h810-chipset/specifications.html' }],
  },
];

export const MSI_LADDER_SOURCE = 'https://www.msi.com/news/detail/Discover-MSI-s-Gaming-Series-Identities--MEG--MPG--and-MAG-Series-at-Computex-143732';

const ASRock_MAINSTREAM = 'Pro RS · Steel Legend';
const ASRock_FLAGSHIP = 'Phantom Gaming · Taichi';

export const MOTHERBOARD_LINES: BrandLine[] = [
  {
    category: 'Motherboard', brand: 'ASUS',
    ladder: ['PRIME', 'TUF Gaming', 'ROG'], ladderSource: 'https://www.asus.com/motherboards-components/motherboards/all-series/',
    warrantyNote: 'تقول ASUS إنّ مدّته تختلف بحسب المنطقة، ومكتوبةٌ على ملصقٍ خلف اللوحة.',
    warrantySource: 'https://www.asus.com/support/faq/1030275/',
    series: [
      { label: 'PRIME', family: 'PRIME', match: /^PRIME\b/i,
        issues: [{
          level: 'official', models: /A620M-K/i,
          text: 'تدعم ASUS فيها معالجاتٍ حتى 120 واط فقط، فلا تناسب معالجات 170 واط مثل Ryzen 9 7950X و9950X. (أختها TUF Gaming A620M-Plus تدعم حتى 170 واط.)',
          sources: [{ name: 'ASUS', url: 'https://www.asus.com/motherboards-components/motherboards/prime/prime-a620m-k/techspec/' }],
        }] },
      { label: 'TUF Gaming', family: 'TUF Gaming', match: /^TUF Gaming\b/i },
      { label: 'ROG Strix', family: 'ROG', match: /^ROG Strix\b/i },
      { label: 'ROG Crosshair', family: 'ROG', match: /^ROG Crosshair\b/i },
      { label: 'ROG Maximus', family: 'ROG', match: /^ROG Maximus\b/i },
      { label: 'ProArt', match: /^ProArt\b/i, offLadder: 'خطّ صنّاع المحتوى، خارج سلاسل الألعاب' },
      { label: 'MAX Gaming', match: /\bMAX GAMING\b/i, offLadder: 'مصنّفةٌ «أخرى» في موقع ASUS، خارج سلاسلها الأساسيّة' },
    ],
  },
  {
    category: 'Motherboard', brand: 'MSI',
    ladder: ['MAG', 'MPG', 'MEG'], ladderSource: MSI_LADDER_SOURCE,
    warrantyNote: 'تقول MSI إنّ مدّته تختلف بحسب المنطقة، وتحيل إلى مكتبها المحلّيّ.',
    warrantySource: 'https://us.msi.com/page/warranty/mb',
    series: [
      { label: 'MAG', family: 'MAG', match: /^MAG\b/i },
      { label: 'MPG', family: 'MPG', match: /^MPG\b/i },
      { label: 'MEG', family: 'MEG', match: /^MEG\b/i },
      { label: 'PRO', match: /^PRO\b/i, offLadder: 'خارج ترتيب MSI لسلاسل الألعاب الثلاث' },
      { label: 'Gaming', match: /^[A-Z]\d{3}M? GAMING PLUS\b/i, offLadder: 'سلسلةٌ مستقلّة في موقع MSI، خارج سلاسل الألعاب الثلاث' },
    ],
  },
  {
    category: 'Motherboard', brand: 'Gigabyte',
    warranty: 3, warrantySource: 'https://www.gigabyte.com/Support/Consumer/Warranty/Motherboard',
    series: [
      { label: 'AORUS', match: /\bAORUS\b/i },
      { label: 'GAMING', match: /\bGAMING X\b/i },
      /* صفحات DS3H وH610M H وH810M H تعرّفها «Ultra Durable» */
      { label: 'ULTRA DURABLE', match: /(\bDS3H\b|\bUD\b|^H\d{3}M H\b)/i },
    ],
  },
  {
    category: 'Motherboard', brand: 'ASRock',
    ladder: [ASRock_MAINSTREAM, ASRock_FLAGSHIP], ladderSource: 'https://www.asrock.com/news/index.asp?iD=5500',
    warrantyNote: 'تجعل ASRock الضمان عبر الموزّع والمتجر، فاسأل المتجر عن مدّته.',
    warrantySource: 'https://www.asrock.com/support/index.us.asp?cat=Policy',
    series: [
      { label: 'Pro RS', family: ASRock_MAINSTREAM, match: /\bPro RS\b/i },
      { label: 'Steel Legend', family: ASRock_MAINSTREAM, match: /\bSteel Legend\b/i,
        /* سلبيّتها الوحيدة عند المراجع: «No quick release or latches for M.2» — راحةٌ لا عيب */
        cleanTest: { name: "Tom's Hardware", url: 'https://www.tomshardware.com/reviews/asrock-X670e-steel-legend-review', date: '2023-09', models: /X670E Steel Legend/i } },
      { label: 'Phantom Gaming', family: ASRock_FLAGSHIP, match: /\bPhantom Gaming\b/i },
      { label: 'Taichi', family: ASRock_FLAGSHIP, match: /\bTaichi\b/i },
      { label: 'HDV', match: /\bHDV\b/i, offLadder: 'خطٌّ اقتصاديّ لا تذكره ASRock في ترتيبها' },
    ],
  },
];
