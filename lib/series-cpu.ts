/**
 * ============ سلاسل المعالجات — 2026-09-29 ============
 *
 * على قاعدة lib/series.ts: السُّلَّم من تصريح الشركة، والملاحظة بدرجة مصدرها.
 * ولـIntel خطّان بسُلَّمين: Core i (LGA1700) وCore Ultra (LGA1851).
 *
 * ملاحظة «عدم الاستقرار» (Vmin Shift) — كلّها من Intel:
 *  · صفحة الدعم 000102331 (رُوجعت 2026-07-21): السبب معروف، والحلّ BIOS
 *    بـMicrocode 0x12F أو أحدث مع إعدادات Intel الافتراضيّة، والضمان
 *    «مُدّد سنتين… حتى خمس سنوات» للمعالجات المتأثّرة المؤهّلة.
 *  · بيان 2024-08-30: «Intel Core 13th and 14th Gen i5 (non-K) & i3 desktop
 *    processors» غير متأثّرة، وArrow Lake (Core Ultra 200S) غير متأثّرة.
 *  فالملاحظة على i5 بحرف K وi7 وi9 من الجيلين؛ وعلى البقيّة جملةُ Intel أنها
 *  خارجها — المشتري يسمع «مشكلة Intel» ويخاف، والاستثناء الرسميّ معلومة.
 */
import type { BrandLine, Issue } from './series';

const INTEL_VMIN = 'https://www.intel.com/content/www/us/en/support/articles/000102331/processors.html';
const INTEL_UNAFFECTED = 'https://community.intel.com/t5/Mobile-and-Desktop-Processors/Intel-Core-13-14th-Gen-Instability-Update-Future-Products/m-p/1627440';

/* الجيلان 13 و14: i5 بحرف K، وi7 وi9 كلّها (ومنها 14700 بلا K) */
const VMIN_AFFECTED = /^Core i(5-1[34]\d{3}K|[79]-1[34]\d{3})/i;
const VMIN_EXEMPT = /^Core i(5-1[34]\d{3}(?!K)|3-1[34]\d{3})/i;

export const CPU_ISSUES: Issue[] = [
  {
    level: 'official', models: VMIN_AFFECTED,
    text: 'من معالجات الجيلين 13 و14 التي أعلنت Intel أنّ بعضها قد يفقد استقراره مع الوقت (Vmin Shift) بسبب جهدٍ زائد. والوقاية: BIOS يحوي Microcode 0x12F أو أحدث، مع إعدادات Intel الافتراضيّة. ومدّدت Intel ضمانها سنتين لتصل إلى خمس سنوات.',
    resolved: 'التحديث يقي من المشكلة؛ فحدّث BIOS اللوحة قبل الاستعمال أو اسأل المتجر عنه.',
    sources: [{ name: 'Intel', url: INTEL_VMIN, date: '2026-07' }],
  },
  {
    level: 'official', models: VMIN_EXEMPT,
    text: 'أعلنت Intel أنّ معالجات i5 (بلا K) وi3 من الجيلين 13 و14 غير متأثّرة بمشكلة عدم الاستقرار التي أصابت بعض معالجات الجيلين.',
    sources: [{ name: 'Intel', url: INTEL_UNAFFECTED, date: '2024-08' }],
  },
  {
    /* ملاحظة اللوحة نفسها (lib/series-motherboard.ts) من جهة المعالج — من يفتح صفحة 7800X3D لا يرى ملاحظات اللوحات */
    level: 'official', models: /^Ryzen \d 7\d{3}X3D/i,
    text: 'في 2023 احترقت بعض معالجات Ryzen 7000X3D في لوحات AM5 من جهدٍ زائد، فحدّت AMD الجهد بتحديث BIOS (AGESA 1.0.0.7 وما بعده).',
    resolved: 'عولجت منذ مايو 2023، واللوحات الحديثة تأتي بالإصلاح. إن كانت لوحتك من مخزونٍ قديم فحدّث BIOS قبل التركيب.',
    sources: [{ name: "Tom's Hardware (بيان AMD)", url: 'https://www.tomshardware.com/news/amd-issues-follow-up-statement-on-ryzen-burnout-issues-limits-soc-voltages', date: '2023-04' }],
  },
  {
    level: 'official', models: /^Core Ultra/i,
    text: 'أعلنت Intel أنّ عائلة Core Ultra 200S (Arrow Lake) غير متأثّرة بمشكلة عدم الاستقرار التي أصابت بعض معالجات الجيلين 13 و14.',
    sources: [{ name: 'Intel', url: INTEL_UNAFFECTED, date: '2024-08' }],
  },
];

/* الضمان: 3 سنوات للمعالج في علبته عند الاثنتين. وIntel تصرّح أنّ الـTray
   المبيع عبر البائعين خارج ضمانها؛ AMD لم نقرأ منها ذلك، فنسأل المشتري أن يسأل. */
const INTEL_WARRANTY = {
  warranty: 3,
  warrantySource: 'https://www.intel.com/content/www/us/en/support/articles/000005862/processors.html',
  warrantyNote: 'هذا للمعالج في علبته (Box). والمعالج بلا علبة (Tray) إن اشتريته من متجر لا يغطّيه ضمان Intel بحسبها، فضمانه من المتجر.',
  tierInName: true,
};

export const CPU_LINES: BrandLine[] = [
  {
    category: 'CPU', brand: 'AMD',
    warranty: 3,
    warrantySource: 'https://www.amd.com/en/resources/support-articles/warranty/RMA-03.html',
    warrantyNote: 'هذا للمعالج في علبته (PIB). فإن كان المتجر يبيعه بلا علبة (Tray) فاسأله عن ضمانه.',
    tierInName: true,
    series: [
      { label: 'Ryzen 5', match: /^Ryzen 5\b/i },
      { label: 'Ryzen 7', match: /^Ryzen 7\b/i },
      { label: 'Ryzen 9', match: /^Ryzen 9\b/i },
    ],
  },
  {
    category: 'CPU', brand: 'Intel', ...INTEL_WARRANTY,
    series: [
      { label: 'Core i3', match: /^Core i3-/i },
      { label: 'Core i5', match: /^Core i5-/i },
      { label: 'Core i7', match: /^Core i7-/i },
      { label: 'Core i9', match: /^Core i9-/i },
    ],
  },
  {
    category: 'CPU', brand: 'Intel', ...INTEL_WARRANTY,
    series: [
      { label: 'Core Ultra 5', match: /^Core Ultra 5\b/i },
      { label: 'Core Ultra 7', match: /^Core Ultra 7\b/i },
      { label: 'Core Ultra 9', match: /^Core Ultra 9\b/i },
    ],
  },
];
