/**
 * ============ سلاسل كروت الشاشة — 2026-09-30 ============
 *
 * صفوف الكتالوج أغلبها شريحة عامّة (NVIDIA GeForce RTX 5070) والنسخة على
 * العرض (ComponentOffer.variant: «ASUS TUF OC»)؛ فالسلسلة تُعرف من النسخة
 * لكلّ متجر (lib/series.ts · offerSeries) — وهذه #٤ التي اعتمدها نوّاف.
 * وصفوف الشركاء (ASUS ROG Astral…) تُعرف من اسمها كبقيّة الفئات.
 *
 * السُّلَّم لمن صرّحت:
 *  · ASUS — مقالها (2025-01): Astral «At the top of our lineup»، Strix «premium
 *    features»، TUF «toned down to appeal to value-oriented gamers»، Prime «a
 *    workhorse card without the extras»؛ وDual «don't fit into one of these
 *    categories» فخارجه.
 *  · MSI — بيانها (2025-01): SUPRIM «for gamers who demand the best»، Vanguard
 *    «latest high-end series»، Gaming Trio «a solid performance upgrade»، Ventus
 *    «balance between performance and affordability»؛ وInspire خطٌّ للذكاء
 *    الاصطناعيّ وصنّاع المحتوى فخارجه.
 *  · Gigabyte تقول AORUS «premium» ولا ترتّب الباقي؛ وSapphire وZOTAC وXFX
 *    وPowerColor وASRock وPalit وPNY لم نجد منها ترتيباً — فالاسم وحده.
 *
 * والضمان من صفحاتها: ASUS 36 شهراً، Gigabyte 3 سنوات، PNY 3 سنوات (RTX
 * 40 و50)، XFX سنتان على الأقلّ وثلاثٌ لـMERC وQICK وSWFT بالتسجيل؛ وMSI
 * وSapphire وPowerColor بلفظها. وZOTAC حُجبت صفحتها عنّا فلا رقم.
 */
import type { BrandLine, Issue } from './series';

/* ============ ملاحظات الشريحة — بيانات NVIDIA نقلتها TechPowerUp ============ */
const TPU_ROPS = 'https://www.techpowerup.com/332884/nvidia-geforce-rtx-50-cards-spotted-with-missing-rops-nvidia-confirms-the-issue-multiple-vendors-affected';
const TPU = (slug: string, name = 'TechPowerUp', date?: string) => ({ name, url: `https://www.techpowerup.com/review/${slug}`, date });
/* «5070» لا «5070 Ti» */
const RTX5070 = /RTX 5070(?!\s*Ti)/i;
export const GPU_ISSUES: Issue[] = [
  {
    /* تكرّرت في مراجعتين لنسختين مختلفتين (TUF وSolid) — فهي على الشريحة لا على نسخة */
    level: 'tested', models: RTX5070,
    text: 'ذاكرته 12 جيجابايت لا تكفي دقّة 4K مع تتبّع الأشعّة وتوليد الإطارات معاً في بعض الألعاب، بحسب المراجع.',
    sources: [TPU('asus-geforce-rtx-5070-tuf-oc/45.html', 'TechPowerUp · ASUS TUF'), TPU('zotac-geforce-rtx-5070-solid/40.html', 'TechPowerUp · ZOTAC Solid')],
  },
  {
    level: 'official', models: /RTX 5090|RTX 5070 Ti/i,
    text: 'نادرٌ بحسب NVIDIA: أقلّ من 0.5% من بطاقات RTX 5090 و5070 Ti خرجت بوحدة ROP ناقصة، فينقص أداء الرسوميّات نحو 4% في المتوسّط. والمتضرّر يستبدلها من الشركة المصنّعة للبطاقة.',
    resolved: 'قالت NVIDIA إنّ خلل الإنتاج صُحّح (فبراير 2025).',
    sources: [{ name: 'TechPowerUp (بيان NVIDIA)', url: TPU_ROPS, date: '2025-02' }],
  },
  {
    level: 'official', models: /RTX 5080/i,
    text: 'بحسب NVIDIA: دفعةٌ مبكّرة من إنتاج RTX 5080 خرجت بوحدة ROP ناقصة، والمتضرّر يستبدلها من الشركة المصنّعة للبطاقة.',
    resolved: 'تخصّ الإنتاج المبكّر (بيان فبراير 2025).',
    sources: [{ name: 'TechPowerUp (بيان NVIDIA)', url: TPU_ROPS, date: '2025-02' }],
  },
];

/* ============ السلاسل ============
   المطابقة على اسم الصفّ لصفوف الشركاء، وعلى النسخة بعد اسم الشركة للعروض
   («TUF OC»، «Speedster QICK 319») — فلا تُثبَّت ببداية النصّ. */
export const GPU_LINES: BrandLine[] = [
  {
    category: 'GPU', brand: 'ASUS',
    ladder: ['PRIME', 'TUF Gaming', 'ROG Strix', 'ROG Astral'],
    ladderSource: 'https://rog.asus.com/articles/gaming-graphics-cards/rog-strix-vs-tuf-vs-dual-and-beyond-which-asus-graphics-card-is-right-for-you/',
    warranty: 3, warrantySource: 'https://www.asus.com/support/faq/1047808/',
    series: [
      { label: 'ROG Astral', family: 'ROG Astral', match: /\bAstral\b/i,
        issues: [
          { level: 'tested', models: /^(?!.*\b(LC|Liquid)\b).*RTX 5090/i,
            text: 'ليس هادئاً بإعداداته الافتراضيّة، ولا يغيّر BIOS الهادئ ذلك كثيراً بحسب المراجع. وحرارته منخفضة جداً.',
            sources: [TPU('asus-geforce-rtx-5090-astral/44.html')] },
          { level: 'tested', models: /\b(LC|Liquid)\b.*RTX 5090|RTX 5090.*\b(LC|Liquid)\b/i,
            text: 'تبريدٌ مائيّ: يحتاج مكاناً إضافياً للمشعاع في الكيس، ومضخّته تعمل دائماً حتى حين تتوقّف المراوح.',
            sources: [TPU('asus-geforce-rtx-5090-astral-liquid-oc/42.html')] },
        ] },
      { label: 'ROG Strix', family: 'ROG Strix', match: /\bStrix\b/i },
      { label: 'TUF Gaming', family: 'TUF Gaming', match: /\bTUF\b/i,
        issues: [
          { level: 'tested', models: /RTX 5090/i,
            text: 'صاخبٌ بإعدادات BIOS الافتراضيّة، وهادئٌ إن حوّلته إلى BIOS الهادئ بمفتاحه.',
            sources: [TPU('asus-geforce-rtx-5090-tuf/42.html')] },
        ],
        cleanTest: { ...TPU('asus-geforce-rtx-5070-tuf-oc/45.html'), models: RTX5070 } },
      { label: 'PRIME', family: 'PRIME', match: /\bPRIME\b/i },
      { label: 'Dual', match: /\bDual\b/i, offLadder: 'خارج خطوط ASUS المعتادة بلفظها' },
    ],
  },
  {
    category: 'GPU', brand: 'MSI',
    ladder: ['VENTUS', 'GAMING TRIO', 'VANGUARD', 'SUPRIM'],
    ladderSource: 'https://www.msi.com/news/detail/MSI-Introduces-Next-Gen-NVIDIA-GeForce-RTX-50-Series-Graphics-Cards-for-the-AI-Era-145375',
    warrantyNote: 'تقول MSI إنّ مدّته تختلف بحسب المنطقة، وتحيل إلى مكتبها المحلّيّ.',
    warrantySource: 'https://us.msi.com/page/warranty/vga',
    series: [
      { label: 'SUPRIM', family: 'SUPRIM', match: /\bSUPRIM\b/i },
      { label: 'VANGUARD', family: 'VANGUARD', match: /\bVANGUARD\b/i },
      { label: 'GAMING TRIO', family: 'GAMING TRIO', match: /\bGAMING TRIO\b/i },
      { label: 'VENTUS', family: 'VENTUS', match: /\bVENTUS\b/i,
        issues: [
          { level: 'tested', models: /RTX 5070 Ti/i,
            text: 'مروحته صاخبةٌ نسبياً بحسب المراجع («pretty loud»)، ولا يسمح برفع حدّ الطاقة.',
            sources: [TPU('msi-geforce-rtx-5070-ti-ventus-3x/45.html', 'TechPowerUp · Ventus 3X OC')] },
        ] },
      { label: 'INSPIRE', match: /\bINSPIRE\b/i, offLadder: 'خطٌّ للذكاء الاصطناعيّ وصنّاع المحتوى، خارج سلاسل الألعاب' },
    ],
  },
  {
    category: 'GPU', brand: 'Gigabyte',
    warranty: 3, warrantySource: 'https://www.gigabyte.com/Support/Consumer/Warranty/Graphics-Card',
    /* بيان Gigabyte (2025-04): بطاقاتها RTX 50 وRX 9000 تستعمل معجوناً حرارياً بدل الوسائد */
    issues: [
      { level: 'official', models: /RTX 50\d\d|RX 90\d\d/i,
        text: 'أقرّت Gigabyte بأنّ دفعاتٍ مبكّرة من بطاقاتها RTX 50 وRX 9000 وُضع فيها معجونٌ حراريّ زائد قد يسيل ظاهراً من البطاقة، وقالت إنّه لا يمسّ الأداء ولا الثبات ولا عمر البطاقة.',
        resolved: 'عدّلت Gigabyte كمّية المعجون في الإنتاج الأحدث.',
        sources: [{ name: "Tom's Hardware (بيان Gigabyte)", url: 'https://www.tomshardware.com/pc-components/gpus/gigabyte-addresses-rtx-50-series-thermal-gel-leak-blames-over-application-in-early-production-units', date: '2025-04' }] },
    ],
    series: [
      { label: 'AORUS', match: /\bAORUS\b/i },
      { label: 'AERO', match: /\bAERO\b/i },
      { label: 'GAMING', match: /\bGAMING\b(?!.*\bAORUS\b)/i,
        issues: [
          { level: 'tested', models: /RTX 5080/i,
            text: 'استهلاكه للطاقة وهو خاملٌ أو مع شاشاتٍ متعدّدة أو أثناء تشغيل الفيديو مرتفعٌ جداً بحسب المراجع، والمعجون الحراريّ فيه يصعّب صيانته.',
            sources: [TPU('gigabyte-geforce-rtx-5080-gaming-oc/44.html')] },
          { level: 'tested', models: /RTX 3070(?!\s*Ti)/i,
            text: 'ليس من أهدأ النسخ بحسب المراجع («could be quieter»).',
            sources: [TPU('gigabyte-geforce-rtx-3070-gaming-oc/39.html', 'TechPowerUp', '2020-10')] },
        ] },
      { label: 'EAGLE', match: /\bEAGLE\b/i },
      { label: 'WINDFORCE', match: /\bWINDFORCE\b(?!.*\b(AORUS|GAMING|EAGLE|AERO)\b)/i,
        issues: [
          { level: 'tested', models: /RTX 4060(?!\s*Ti)/i,
            text: 'مبرّده ضعيفٌ جداً بحسب المراجع: صاخبٌ وحرارته مرتفعةٌ نسبياً.',
            sources: [TPU('gigabyte-geforce-rtx-4060-windforce-oc/42.html', 'TechPowerUp', '2023-06')] },
        ] },
    ],
  },
  {
    category: 'GPU', brand: 'Sapphire',
    warrantyNote: 'تقول Sapphire إنّ الضمان من مكان الشراء، ويختلف بحسب البلد.',
    warrantySource: 'https://support.sapphiretech.com/warranty.asp?lang=eng',
    series: [
      { label: 'NITRO+', match: /\bNITRO/i },
      { label: 'PURE', match: /\bPURE\b/i },
      { label: 'PULSE', match: /\bPULSE\b/i,
        cleanTest: [
          { ...TPU('sapphire-radeon-rx-9070-xt-pulse/44.html'), models: /RX 9070 XT/i },
          /* اختُبرت Pulse OC بـ16 جيجابايت — لا تُنسب لنسخة 8 جيجابايت */
          { ...TPU('sapphire-radeon-rx-9060-xt-pulse-oc/44.html', 'TechPowerUp', '2025-06'), models: /RX 9060 XT\b.*\b16\s*GB/i },
        ] },
    ],
  },
  {
    category: 'GPU', brand: 'XFX',
    warranty: [2, 3], warrantySource: 'https://www.xfxforce.com/support/xfx-warranty',
    warrantyNote: 'سنتان على الأقلّ، وثلاثٌ لسلاسل MERC وQICK وSWFT إن سجّلت البطاقة في موقع XFX.',
    series: [
      { label: 'MERC', match: /\bMERC\b/i,
        issues: [
          /* اختُبرت Merc 310 OC، وعندنا Merc 310 — المبرّد نفسه، والفرق تردّد المصنع */
          { level: 'tested', models: /RX 7900 XTX/i,
            text: 'مروحته أعلى صوتاً من المعتاد، وصاخبةٌ جداً إن حوّلته إلى BIOS «Max Power» بمفتاحه، بحسب المراجع.',
            sources: [TPU('xfx-radeon-rx-7900-xtx-merc-310-oc/40.html', 'TechPowerUp (على نسخة Merc 310 OC)', '2022-12')] },
        ],
        cleanTest: [
          { ...TPU('xfx-radeon-rx-7800-xt-merc-319/41.html', 'TechPowerUp', '2023-09'), models: /RX 7800 XT/i },
          { ...TPU('xfx-radeon-rx-6800-xt-speedster-merc-319-black/39.html', 'TechPowerUp (على نسخة Merc 319 Black)', '2020-12'), models: /RX 6800 XT/i },
        ] },
      { label: 'QICK', match: /\bQICK\b/i,
        cleanTest: { ...TPU('xfx-radeon-rx-7700-xt-qick-319/41.html', 'TechPowerUp', '2023-09'), models: /RX 7700 XT/i } },
      { label: 'SWFT', match: /\bSWFT\b/i },
    ],
  },
  {
    category: 'GPU', brand: 'PowerColor',
    warrantyNote: 'لا تقدّم PowerColor ضماناً عالمياً خارج أمريكا وكندا، فالضمان من البائع بحسب المنطقة.',
    warrantySource: 'https://www.powercolor.com/rma.htm',
    series: [
      { label: 'Red Devil', match: /\bRed Devil\b/i },
      { label: 'Hellhound', match: /\bHellhound\b/i },
      { label: 'Fighter', match: /\bFighter\b/i },
    ],
  },
  {
    category: 'GPU', brand: 'ZOTAC',
    series: [
      { label: 'AMP', match: /\bAMP\b/i },
      { label: 'Trinity', match: /\bTrinity\b/i },
      { label: 'Twin Edge', match: /\bTwin Edge\b/i },
      /* Solid Core خطٌّ أبسط من Solid بمبرّدٍ آخر — فلا يرث اختبارها */
      { label: 'Solid Core', match: /\bSolid Core\b/i },
      { label: 'Solid', match: /\bSolid\b(?!\s*Core)/i,
        /* اختُبرت Solid، وعندنا Solid OC — المبرّد نفسه، والفرق تردّد المصنع */
        cleanTest: { ...TPU('zotac-geforce-rtx-5070-solid/40.html', 'TechPowerUp (على نسخة Solid)'), models: /Solid (OC )?.*RTX 5070(?!\s*Ti)/i } },
    ],
  },
  {
    category: 'GPU', brand: 'ASRock',
    series: [
      { label: 'Taichi', match: /\bTaichi\b/i },
      { label: 'Phantom Gaming', match: /\bPhantom Gaming\b/i },
      { label: 'Steel Legend', match: /\bSteel Legend\b/i },
      { label: 'Challenger', match: /\bChallenger\b/i },
    ],
  },
  {
    category: 'GPU', brand: 'Palit',
    series: [
      { label: 'GameRock', match: /\bGameRock\b/i },
      { label: 'GamingPro', match: /\bGamingPro\b/i },
      { label: 'Infinity', match: /\bInfinity\b/i },
      { label: 'Dual', match: /\bDual\b/i },
    ],
  },
  {
    category: 'GPU', brand: 'PNY',
    warranty: 3,
    warrantySource: 'https://www.pny.com/file%20library/company/support/product%20brochures/geforce%20graphics/warranties%20and%20policies/3-year-limited-warranty.pdf',
    series: [
      { label: 'Triple Fan', match: /\bTriple Fan\b/i },
    ],
  },
];
