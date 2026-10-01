/**
 * ============ سلاسل الرامات — 2026-10-01 ============
 *
 * لا سُلَّم: لم نجد شركة رامٍ ترتّب خطوطها ترتيباً صريحاً.
 *
 * والضمان «محدود مدى الحياة» عند أغلبها، من صفحاتها:
 *  · Corsair — جدول الضمان: «DRAM Modules: Limited Lifetime».
 *  · G.Skill — صفحة الضمان: قائمة السلاسل مدى الحياة، وفيها كلّ ما عندنا
 *    (Flare X5، Ripjaws S5، Ripjaws V، Trident Z5 Neo، Trident Z5 RGB).
 *  · Crucial — صفحة Pro DDR5: مدى الحياة (عشر سنوات في ألمانيا وفرنسا).
 *  · Kingston — بيان الضمان: ذواكر البيع بالتجزئة «Product Lifetime».
 *  · ADATA وXPG — صفحة XPG: «ADATA DRAM Modules… lifetime warranty».
 *  · Silicon Power — صفحة Zenith DDR5: مدى الحياة.
 *  · TeamGroup — صفحة T-Force Delta RGB DDR5 وحدها؛ والباقي بلا رقم.
 *
 * ولا ملاحظات اختبار: عيوب مراجعات الرام سعرٌ في الغالب، وارتفاعها يفحصه
 * الباني أصلاً. والرسميّ الوحيد خروج Micron من Crucial (مشتركٌ مع التخزين).
 */
import type { BrandLine } from './series';
import { CRUCIAL_EXIT } from './series-storage';

export const RAM_LINES: BrandLine[] = [
  {
    category: 'RAM', brand: 'ADATA',
    warranty: 'lifetime', warrantySource: 'https://www.xpg.com/us/support/xpg?tab=warranty',
    series: [{ label: 'LANCER', match: /\bLancer\b/i }],
  },
  {
    category: 'RAM', brand: 'XPG',
    warranty: 'lifetime', warrantySource: 'https://www.xpg.com/us/support/xpg?tab=warranty',
    series: [
      { label: 'ARMAX', match: /\bARMAX\b/i },
      { label: 'SPECTRIX', match: /\bSpectrix\b/i },
    ],
  },
  {
    category: 'RAM', brand: 'Corsair',
    warranty: 'lifetime', warrantySource: 'https://help.corsair.com/hc/en-us/articles/360033067832',
    series: [
      { label: 'Dominator', match: /\bDominator\b/i },
      { label: 'Vengeance', match: /\bVengeance\b/i },
    ],
  },
  {
    category: 'RAM', brand: 'Crucial',
    warranty: 'lifetime', warrantyNote: 'وفي ألمانيا وفرنسا عشر سنوات.',
    warrantySource: 'https://www.crucial.com/memory/ddr5/cp2k16g56c46u5',
    issues: [CRUCIAL_EXIT],
    series: [{ label: 'Pro', match: /\bPro\b/i }],
  },
  {
    category: 'RAM', brand: 'G.Skill',
    warranty: 'lifetime', warrantySource: 'https://www.gskill.com/warranty',
    series: [
      { label: 'Trident Z5', match: /\bTrident Z5\b/i },
      { label: 'Flare X5', match: /\bFlare X5\b/i },
      { label: 'Ripjaws', match: /\bRipjaws\b/i },
    ],
  },
  {
    category: 'RAM', brand: 'Kingston',
    warranty: 'lifetime', warrantySource: 'https://media.kingston.com/wa/KingstonLimitedWarrantyStatement_EN_May2020.pdf',
    series: [
      { label: 'FURY Renegade', match: /\bRenegade\b/i },
      { label: 'FURY Beast', match: /\bBeast\b/i },
    ],
  },
  {
    category: 'RAM', brand: 'Silicon Power',
    warranty: 'lifetime', warrantySource: 'https://www.silicon-power.com/product-detail/XPOWER_Zenith_DDR5_Gaming_UDIMM/',
    series: [{ label: 'XPOWER Zenith', match: /\bZenith\b/i }],
  },
  {
    category: 'RAM', brand: 'TeamGroup',
    series: [
      { label: 'T-Force Delta', match: /\bDelta\b/i, warranty: 'lifetime',
        source: 'https://www.teamgroupinc.com/en/product-detail/memory/T-FORCE/delta-rgb-ddr5-black/delta-rgb-ddr5-black-FF3D532G8000HC38DDC01/' },
      { label: 'T-Force Vulcan', match: /\bVulcan\b/i },
      { label: 'T-Create', match: /\bT-Create\b/i },
      { label: 'Elite', match: /\bElite\b/i },
    ],
  },
];
