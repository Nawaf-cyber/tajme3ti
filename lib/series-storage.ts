/**
 * ============ سلاسل التخزين — 2026-09-30 ============
 *
 * لا سُلَّم هنا: لم نجد شركةً تخزين ترتّب سلاسلها ترتيباً صريحاً (EVO وPRO
 * عند Samsung، وBlue وBlack عند WD، أسماءٌ لا درجات معلنة) — فالاسم وحده.
 *
 * والضمان من صفحات الشركات، وأغلبه «خمس سنوات أو حدّ الكتابة (TBW) أيّهما
 * أسبق»:
 *  · Samsung — جدول الضمان: 5 سنوات لكلّ ما عندنا.
 *  · WD — جدول Sandisk (صارت أقراص WD الصلبة لها): 5 سنوات؛ وSN5100 من
 *    صفحته.
 *  · Crucial — صفحة كلّ منتج: 5 سنوات لـP3 Plus وP310 وT500 وT705.
 *    وصفحة BX500 محذوفة ونشرته لم تُقرأ — فلا رقم.
 *  · Kingston — نشرتا KC3000 وNV3 (2025): 5 سنوات أو «Percentage Used».
 *  · Seagate — صفحتا الدعم: BarraCuda سنتان، FireCuda 530 خمس.
 *  · ADATA — جدولها الرسميّ: LEGEND 710 و800 في عمود «3 سنوات أو TBW»؛
 *    وXPG S70 Blade خمسٌ من صفحته. وSX6000 Pro لم نصل إلى صفحته — فلا رقم.
 *  · Corsair MP700 PRO خمسٌ من صفحته. وLexar وSabrent بلا رقم: صفحة Lexar
 *    لم تعرضه، وصفحة Sabrent تتناقض («5-year… No registration required»
 *    و«2-Year Warranty» معاً).
 *
 * والاختبارات من Tom's Hardware (الحكم والعيوب في رأس المراجعة). ويُترك
 * منها السعر (سعر أمريكا لا سعرنا) واستهلاك الطاقة (يعني اللابتوب لا
 * الجهاز المكتبيّ)؛ فمن لم يبقَ عليه إلا هذا فاختباره نظيف.
 * ومراجعة BX500 (2019) لا تُنقل: تبدّلت شرائحه بعدها، فالمختبَر غير المبيع.
 */
import type { BrandLine, Source } from './series';

const TOMS = (path: string, date: string, name = "Tom's Hardware"): Source =>
  ({ name, url: `https://www.tomshardware.com/${path}`, date });

/* الكتابة المتواصلة: عيبٌ يتكرّر بلفظٍ واحد، فيُكتب بلفظٍ واحد */
const SUSTAINED = 'نسخ ملفّاتٍ ضخمة دفعةً واحدة (عشرات الجيجابايت) يبطؤ كثيراً بعد امتلاء ذاكرته المؤقّتة، بحسب المراجع.';
/* على سلاسل Crucial ذات الرقم وحدها — BX500 لم يُقرأ ضمانه فلا رقم ولا ملاحظة */
const CRUCIAL_TBW = 'خمس سنوات من تاريخ الشراء أو حتى بلوغ حدّ الكتابة المعلن (TBW)، أيّهما أسبق.';
const TBW_NOTE = 'أو حتى بلوغ حدّ الكتابة المعلن (TBW)، أيّهما أسبق.';

export const STORAGE_LINES: BrandLine[] = [
  {
    category: 'Storage', brand: 'Samsung',
    warranty: 5, warrantyNote: `خمس سنوات ${TBW_NOTE}`,
    warrantySource: 'https://semiconductor.samsung.com/consumer-storage/support/warranty/',
    series: [
      { label: '9100 PRO', match: /\b9100 PRO\b/i,
        cleanTest: TOMS('pc-components/ssds/samsung-9100-pro-ssd-review', '2025-03') },
      { label: '990 PRO', match: /\b990 PRO\b/i,
        issues: [
          { level: 'official',
            text: 'أقرّت Samsung بأنّ برمجيّته الأولى كانت تُنقص «صحّة» القرص بسرعةٍ غير طبيعيّة، وأصدرت تحديثاً يوقف ذلك (لا يسترجع ما نقص). حدّث البرمجيّة من برنامج Samsung Magician.',
            resolved: 'صدر التحديث 1B2QJXD7 في فبراير 2023.',
            sources: [{ name: "Tom's Hardware (بيان Samsung)", url: 'https://www.tomshardware.com/news/samsung-990-pro-firmware-update-released-ssd-health', date: '2023-02' }] },
        ] },
      { label: '990 EVO Plus', match: /\b990 EVO Plus\b/i,
        cleanTest: TOMS('pc-components/ssds/samsung-990-evo-plus-ssd-review', '2024-10') },
      /* مشكلة برمجيّة 980 PRO (2023) لم تُصدر Samsung فيها بياناً، وتخصّ 2TB غالباً وعندنا 1TB — فلا تُكتب */
      { label: '980 PRO', match: /\b980 PRO\b/i },
      { label: '870 EVO', match: /\b870 EVO\b/i,
        cleanTest: TOMS('reviews/samsung-870-evo-sata-ssd-review-the-best-just-got-better', '2021-01', "Tom's Hardware (على نسخة 4TB)") },
    ],
  },
  {
    category: 'Storage', brand: 'WD',
    warranty: 5, warrantyNote: `خمس سنوات ${TBW_NOTE} والضمان والدعم لأقراص WD الصلبة صار من شركة Sandisk.`,
    warrantySource: 'https://support-en.sandisk.com/app/answers/detailweb/a_id/30797/',
    series: [
      { label: 'Black SN8100', match: /\bSN8100\b/i,
        cleanTest: TOMS('pc-components/ssds/sandisk-wd-black-sn8100-2tb-ssd-review', '2025-05') },
      { label: 'Black SN850X', match: /\bSN850X\b/i,
        cleanTest: [
          { ...TOMS('reviews/wd-black-sn850x-ssd-review-back-in-black', '2022-10'), models: /\b1TB\b/i },
          { ...TOMS('reviews/wd-black-sn850x-ssd-review-back-in-black', '2022-10', "Tom's Hardware (على نسخة 1TB)") },
        ] },
      { label: 'Black SN770', match: /\bSN770\b/i,
        issues: [{ level: 'tested', text: SUSTAINED, sources: [TOMS('reviews/wd-black-sn770-ssd-review', '2022-10')] }] },
      { label: 'Blue SN5100', match: /\bSN5100\b/i,
        source: 'https://www.sandisk.com/products/ssd/internal-ssd/wd-blue-sn5100-nvme-ssd' },
      { label: 'Blue SN580', match: /\bSN580\b/i,
        issues: [
          { level: 'official', models: /\b2TB\b/i,
            text: 'بحسب Sandisk: نسخة 2TB قد تسبّب شاشةً زرقاء على Windows 11 (تحديث 24H2) ببرمجيّتها الأولى، وقد تمنع Microsoft التحديث حتى تُحدَّث. حدّث البرمجيّة من برنامج Sandisk Dashboard.',
            resolved: 'صدرت البرمجيّة المصحّحة 281050WD.',
            sources: [{ name: 'Sandisk', url: 'https://support-en.sandisk.com/app/answers/detailweb/a_id/51469/', date: '2024-10' }] },
        ],
        cleanTest: TOMS('reviews/wd-blue-sn580-ssd', '2023-07') },
    ],
  },
  {
    category: 'Storage', brand: 'Crucial',
    issues: [
      { level: 'official',
        text: 'أعلنت Micron (مالكة Crucial) خروجها من سوق المستهلكين، وتوقّف شحن منتجات Crucial إلى المتاجر نهاية فبراير 2026؛ فما يُباع الآن من مخزونٍ سابق. وقالت إنّها مستمرّةٌ في خدمة الضمان والدعم.',
        sources: [{ name: 'Micron', url: 'https://investors.micron.com/news-releases/news-release-details/micron-announces-exit-crucial-consumer-business', date: '2025-12' }] },
    ],
    series: [
      { label: 'T705', match: /\bT705\b/i, warranty: 5, warrantyNote: CRUCIAL_TBW, source: 'https://www.crucial.com/ssd/t705/ct2000t705ssd3',
        issues: [{ level: 'tested', text: 'حرارته واستهلاكه للطاقة مرتفعان بحسب المراجع، فيحتاج مبرّد M.2 (غطاء اللوحة الحراريّ أو مبرّداً خاصاً).', sources: [TOMS('pc-components/ssds/crucial-t705-2tb-ssd-review', '2024-02')] }] },
      { label: 'T500', match: /\bT500\b/i, warranty: 5, warrantyNote: CRUCIAL_TBW, source: 'https://www.crucial.com/ssd/t500/ct1000t500ssd8' },
      { label: 'P310', match: /\bP310\b/i, warranty: 5, warrantyNote: CRUCIAL_TBW, source: 'https://www.crucial.com/ssd/p310/ct1000p310ssd8',
        issues: [{ level: 'tested', text: `ذاكرته من نوع QLC: ${SUSTAINED}`, sources: [TOMS('pc-components/ssds/crucial-p310-2280-ssd-review', '2024-12')] }] },
      { label: 'P3 Plus', match: /\bP3 Plus\b/i, warranty: 5, warrantyNote: CRUCIAL_TBW, source: 'https://www.crucial.com/ssd/p3-plus/ct1000p3pssd8',
        issues: [{ level: 'tested', text: `ذاكرته من نوع QLC: ${SUSTAINED.replace(/، بحسب المراجع\.$/, '')}، وحدّ الكتابة فيه أقلّ من منافسيه، بحسب المراجع.`, sources: [TOMS('reviews/crucial-p3-plus-ssd-review-capacity-on-the-cheap', '2022-08')] }] },
      { label: 'BX500', match: /\bBX500\b/i },
    ],
  },
  {
    category: 'Storage', brand: 'Kingston',
    warranty: 5, warrantyNote: 'خمس سنوات أو حتى تبلغ نسبة الاستهلاك (Percentage Used) في برنامج Kingston SSD Manager مئةً بالمئة، أيّهما أسبق.',
    warrantySource: 'https://www.kingston.com/datasheets/snv3s_us.pdf',
    series: [
      { label: 'KC3000', match: /\bKC3000\b/i, source: 'https://www.kingston.com/datasheets/KC3000_us.pdf',
        cleanTest: TOMS('reviews/kingston-kc3000-m2-ssd-review', '2021-12') },
      { label: 'NV3', match: /\bNV3\b/i,
        issues: [{ level: 'tested', text: `قد تختلف مكوّناته من دفعةٍ لأخرى، و${SUSTAINED}`, sources: [TOMS('pc-components/ssds/kingston-nv3-ssd-review', '2024-09')] }] },
    ],
  },
  {
    category: 'Storage', brand: 'Seagate',
    series: [
      { label: 'FireCuda', match: /\bFireCuda\b/i, warranty: 5, source: 'https://www.seagate.com/support/internal-hard-drives/ssd/firecuda-530-ssd/',
        cleanTest: TOMS('reviews/seagate-firecuda-530-m2-nvme-ssd-review', '2021-09') },
      { label: 'BarraCuda', match: /\bBarraCuda\b/i, warranty: 2, source: 'https://www.seagate.com/support/internal-hard-drives/desktop-hard-drives/barracuda-3-5/',
        issues: [
          /* قائمة Seagate: BarraCuda 3.5 بتسجيل SMR في 4TB و8TB؛ و1TB و2TB ليستا فيها — فلا حكم عليهما */
          { level: 'official', models: /\b[48]TB\b/i,
            text: 'تقنية التسجيل فيه SMR بحسب قائمة Seagate، وتقول Seagate إنّها أنسب لما يُكتب مرّةً ويُقرأ أحياناً كالأرشيف والنسخ الاحتياطيّ.',
            sources: [{ name: 'Seagate', url: 'https://www.seagate.com/products/cmr-smr-list/' }] },
        ] },
    ],
  },
  {
    category: 'Storage', brand: 'Lexar',
    series: [
      { label: 'NM790', match: /\bNM790\b/i,
        issues: [{ level: 'tested', text: 'نوع شرائح الذاكرة فيه قد يختلف من دفعةٍ لأخرى، بحسب المراجع.', sources: [TOMS('reviews/lexar-nm790-ssd-review', '2023-09')] }] },
    ],
  },
  {
    category: 'Storage', brand: 'Sabrent',
    series: [{ label: 'Rocket 4 Plus', match: /\bRocket 4 Plus\b/i }],
  },
  {
    category: 'Storage', brand: 'Corsair',
    series: [{ label: 'MP700 PRO', match: /\bMP700 PRO\b/i, warranty: 5,
      source: 'https://www.corsair.com/us/en/p/data-storage/cssd-f2000gbmp700pro/mp700-pro-2tb-pcie-gen5-x4-nvme-2-0-m-2-ssd-cssd-f2000gbmp700pro' }],
  },
  {
    /* ADATA وXPG شركةٌ واحدة باسمين (XPG خطّ الألعاب)؛ والكتالوج يكتب كلاً باسمه،
       ومطابقة المتاجر تشترط الاسم في العنوان — فلا يُوحَّدان هناك، ولكلٍّ خطّه هنا */
    category: 'Storage', brand: 'Adata',
    warrantyNote: `ثلاث سنوات ${TBW_NOTE}`,
    series: [{ label: 'LEGEND', match: /\bLEGEND\b/i, warranty: 3, source: 'https://webapi3.adata.com/storage/downloadfile/adata_ssd_tbw_en_new.pdf' }],
  },
  {
    category: 'Storage', brand: 'XPG',
    series: [
      { label: 'GAMMIX S70 Blade', match: /\bS70 Blade\b/i, warranty: 5, source: 'https://www.xpg.com/us/xpg/830/' },
      { label: 'SX6000 Pro', match: /\bSX6000 Pro\b/i,
        issues: [{ level: 'tested', text: 'بلا ذاكرة DRAM، وأداؤه في البرامج أقلّ من المتوسّط، والكتابة بعد امتلاء ذاكرته المؤقّتة بطيئة، بحسب المراجع.', sources: [TOMS('reviews/adata-xpg-sx6000-ssd,6331.html', '2019-09')] }] },
    ],
  },
];
