/* ============ استخراج المواصفات من صفحة المتجر ============
 *
 * ⚠️ وهذا الملفّ يُصحّح استنتاجاً خاطئاً كتبتُه بنفسي: قلتُ إنّ مايكرولس
 * «يبني جدول مواصفاته في المتصفّح ولا يصل الخادمَ أصلاً». كان الفحص على
 * **صفحة ٤٠٤** — الرابط الذي نسختُه من الطرفية حمل محرف تلوينٍ فقُطع.
 * والصفحة الصحيحة تحمل الجدول كاملاً في HTML الخادم عند الحرف ٣٨٨٬٣٢٧.
 *
 * الدرس: «غير ممكن» بعد محاولةٍ واحدة ليس قياساً بل يأس.
 *
 * ============ ما يقدّمه كل متجر (مقيس) ============
 *
 *   مايكرولس  `.atrribute-items` (بخطأٍ مطبعيّ في اسم الصنف عندهم)
 *             ٤٥ سمةً للمعالج، ٢٨ للصندوق، ٢٣ للمزوّد. قويٌّ في المقبس
 *             والارتفاع وطول الكرت، وضعيفٌ في كرت الشاشة نفسه.
 *
 *   إنفيني آرك `.spec-item` — أقلّ عدداً (٨–١٠) لكنّه يحمل تردّد الكرت
 *             وعدد أنويته، وهو ما ينقص مايكرولس. فالمتجران يتكاملان.
 *
 *   أمازون   جدول `th/td` عاديّ — ٢٩ إلى ٤٧ سمة، لكن بأسماء أمازون:
 *             «Computer memory size» و«Motherboard compatability» (بخطئهم)
 *             و«Cooling method». ويعطي نصف المطلوب تقريباً.
 *
 *   كازاسوق  **لا شيء**، وقيس لا يُفترَض: الصفحة تصل كاملةً عبر الوسيط
 *             (٢٫٠٨ مليون حرف، حالة ٢٠٠) وفيها **صفر** جدول. فمسودّاته
 *             تبقى من العنوان، ولا ضرر: الغائب يُطلب من الأدمن.
 *
 * ⚠️ والمطابقة بأنماطٍ على الاسم المُطبَّع لا بجدولٍ لكل متجر — تصمد أمام
 * متجرٍ جديدٍ بلا سطرٍ إضافي.
 *
 * ============ والقيمة تُترجَم إلى عرف الكتالوج ============
 *
 * وهذا نصف العمل: «Gold» ليست «80+ Gold»، و«PCI-E 4.0 x 16» ليست
 * «PCIe 4.0 x16»، و«192 Bit» ليست «192-bit». وحقلٌ ممتلئٌ بصيغةٍ غريبة
 * أسوأ من حقلٍ فارغ: الفارغ يطلب الأدمن، والغريب يمرّ ويكذب في المقارنة.
 * فكل مُنظِّفٍ هنا قيس على قِيَم الكتالوج الفعلية لا على ما بدا معقولاً.
 *
 * ⚠️ وما لا يعطيه المتجر بصيغةٍ صحيحة **يُترك فارغاً عمداً**: معماريّة
 * المعالج عند مايكرولس «AMD Ryzen 5» وعندنا «Zen 5»؛ ومنافذ الكرت عنده
 * «HDMI: نعم» وعندنا «1x HDMI 2.1, 3x DP 2.1a». فالمطابقة هنا تُفسد.
 */

import * as cheerio from 'cheerio';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** يقرأ جدول السمات من صفحة منتج، بأي بنيةٍ من البنى المعروفة */
export function attributesFrom(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const out: Record<string, string> = {};
  const put = (k: string, v: string) => {
    const key = k.replace(/\s+/g, ' ').trim();
    const val = v.replace(/\s+/g, ' ').trim();
    if (key && val && val !== '--' && val !== '-' && !out[key]) out[key] = val.slice(0, 160);
  };

  /* مايكرولس — لاحظ الخطأ المطبعيّ في صنفهم: atrribute */
  $('.atrribute-items, .attribute-items').each((_, el) => {
    put($(el).find('.attribute-item-name').text(), $(el).find('.attribute-item-value').text());
  });

  /* إنفيني آرك (Odoo) */
  $('.spec-item').each((_, el) => {
    put($(el).find('.spec-label').text(), $(el).find('.spec-value').text());
  });

  /* جداول key/value عامّة — أمازون وغيره */
  $('table tr').each((_, tr) => {
    const cells = $(tr).find('th,td');
    if (cells.length === 2) put($(cells[0]).text(), $(cells[1]).text());
  });

  return out;
}

export async function fetchAttributes(url: string, viaProxy = ''): Promise<Record<string, string>> {
  if (!/^https?:\/\//i.test(url)) return {};
  try {
    const target = viaProxy
      ? `https://api.scrape.do/?token=${viaProxy}&url=${encodeURIComponent(url)}`
      : url;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), viaProxy ? 45000 : 20000);
    try {
      const html = await fetch(target, { signal: ctrl.signal, headers: { 'User-Agent': UA } }).then((r) => r.text());
      return attributesFrom(html);
    } finally { clearTimeout(timer); }
  } catch { return {}; }
}

/* ============ المطابقة ============
 *
 * لكل مفتاحٍ عندنا نمطٌ يُطابَق على اسم السمة بعد تطبيعه، ومُنظِّفٌ يُعيد
 * القيمة بعُرف الكتالوج — أو سلسلةً فارغة إذا كانت القيمة من نوعٍ آخر.
 * وأوّل سمةٍ تُنتج قيمةً غير فارغة تفوز.
 */

type Rule = { key: string; match: RegExp; clean?: (v: string) => string };

const num = (v: string) => (v.match(/\d+(?:\.\d+)?/) || [''])[0];
/** رقمٌ صحيح: «850.0 W» → «850» */
const int = (v: string) => {
  const n = Number(num(v));
  return Number.isFinite(n) && n > 0 ? String(Math.round(n)) : '';
};
const yesNo = (v: string) => (/^(no|none|بدون|لا|not )/i.test(v.trim()) ? 'No' : 'Yes');

/** «LGA 2011 LGA 1700 … AM5 AM4» → «LGA2011/LGA1700/…/AM5/AM4» */
const sockets = (v: string) => {
  const found = v.match(/LGA\s?\d{3,4}|AM[45]|sTRX\d|TR4/gi) || [];
  return [...new Set(found.map((s) => s.replace(/\s+/g, '').toUpperCase()))].join('/');
};

/** «PCI-E 4.0 x 16» و«PCIe 5.0 x16» → «PCIe 4.0 x16» · وإلا فارغ */
const pcie = (v: string) => {
  const m = v.match(/pci-?e(?:xpress)?\s*(\d)(?:\.0)?\s*(?:x\s*(\d{1,2}))?/i);
  if (!m) return /^sata/i.test(v.trim()) ? 'SATA III' : '';
  return `PCIe ${m[1]}.0${m[2] ? ' x' + m[2] : ''}`;
};

/** «12 GB» → «12GB» */
const gb = (v: string) => {
  const m = v.match(/(\d+(?:\.\d+)?)\s*(GB|TB)/i);
  return m ? m[1] + m[2].toUpperCase() : '';
};

const RULES: Record<string, Rule[]> = {
  CPU: [
    { key: 'socket', match: /socket/, clean: sockets },
    { key: 'cores', match: /number of cores|^cores$|أنوية/, clean: int },
    { key: 'threads', match: /threads|خيوط/, clean: int },
    { key: 'l3Cache', match: /^l3 cache|^cache size/, clean: (v) => (/(mb|ميجا)/i.test(v) ? v.replace(/\s+/g, '') : int(v) + 'MB') },
    /* «Cooling device not included» → «None»، وإلّا اسم المبرّد كما هو */
    { key: 'includedCooler', match: /cooling device|included thermal|included cooler/, clean: (v) =>
      /not included|^no$|none|بدون/i.test(v.trim()) ? 'None' : v },
    { key: 'baseClock', match: /base clock(?! speed \(graphics)|base frequency|التردد الأساسي/, clean: (v) =>
      /ghz|mhz/i.test(v) ? v : '' },
    { key: 'boostClock', match: /boost (clock|frequency|speed)|turbo|التردد الأقصى/, clean: (v) =>
      /ghz|mhz/i.test(v) ? v : '' },
    /* ⚠️ ولا معماريّة: المتجر يقول «AMD Ryzen 5» والكتالوج «Zen 5».
       ⚠️ ولا «CPU speed» عند أمازون: قيمتها للـ13400F «4.6 GHz» وهي التردّد
       **الأقصى** لا الأساسيّ (٢٫٥). واسمٌ مبهمٌ يملأ حقلاً برقمٍ من حقلٍ آخر
       أسوأ من فراغ — الفراغ يُرى، والرقم الخاطئ يُصدَّق. */
  ],
  Motherboard: [
    { key: 'socket', match: /^socket|cpu socket/, clean: sockets },
    { key: 'chipset', match: /chipset|شرائح/ },
    { key: 'formFactor', match: /^form factor/ },
    { key: 'ramType', match: /memory type|memory technology|نوع الذاكرة/ },
    { key: 'maxRam', match: /maximum memory|max memory|maximum capacity/, clean: gb },
    { key: 'memorySpeed', match: /memory (speed|clock speed)|سرعة الذاكرة/, clean: (v) =>
      /mt\/s|mhz/i.test(v) ? v : int(v) ? int(v) + ' MT/s' : '' },
    { key: 'm2Slots', match: /m\.?2 slots/, clean: int },
    /* ⚠️ «PCI Express x16 = 1» عددُ فتحاتٍ لا إصدار — فالمُنظِّف يرفضه */
    { key: 'pcieVersion', match: /pci ?e(xpress)?/, clean: (v) => {
      const m = v.match(/(\d)\.0/) || v.match(/gen\s*(\d)/i);
      return m ? `PCIe ${m[1]}.0` : '';
    } },
  ],
  RAM: [
    { key: 'type', match: /memory type|memory technology|نوع الذاكرة/ },
    { key: 'capacity', match: /^capacity|computer memory size|^memory size$|السعة/, clean: gb },
    { key: 'speed', match: /^memory speed|^speed$|السرعة/, clean: (v) =>
      /mhz|mt\/s/i.test(v) ? v.replace(/\s+/g, '') : int(v) ? int(v) + 'MHz' : '' },
    /* «32GB (2 x 16GB)» → «2x16GB» */
    { key: 'kit', match: /memory size|^kit|الطقم/, clean: (v) => {
      const m = v.match(/(\d)\s*[xX]\s*(\d{1,3})\s*GB/);
      return m ? `${m[1]}x${m[2]}GB` : '';
    } },
    /* ⚠️ «Tested Latency» هي الفعليّة؛ «SPD Latency» هي الافتراضيّة (٤٠) */
    { key: 'casLatency', match: /tested latency/, clean: (v) => (int(v) ? 'CL' + int(v) : '') },
    { key: 'casLatency', match: /cas|latency|زمن/, clean: (v) => (int(v) ? 'CL' + int(v) : '') },
    { key: 'profile', match: /performance profile|xmp|expo/ },
    { key: 'heightMm', match: /^height|الارتفاع/, clean: num },
    { key: 'rgb', match: /^led|rgb|إضاءة/, clean: yesNo },
  ],
  GPU: [
    { key: 'vram', match: /memory size|video memory|vram|graphics ram size|سعة الذاكرة/, clean: gb },
    { key: 'memoryType', match: /memory type|graphics ram type|نوع الذاكرة/ },
    { key: 'memoryBus', match: /memory (bus|interface)|ناقل/, clean: (v) =>
      int(v) ? int(v) + '-bit' : '' },
    { key: 'interface', match: /^interface$|pci ?e|graphics card interface|واجهة التوصيل/, clean: pcie },
    { key: 'lengthMm', match: /^length|card length|الطول/, clean: num },
    { key: 'powerConnectors', match: /power connector|موصلات الطاقة/ },
    { key: 'boostClock', match: /boost clock|تردد/, clean: (v) => (/ghz|mhz/i.test(v) ? v : '') },
    { key: 'cudaCores', match: /cuda|stream processor|أنوية المعالجة/, clean: int },
    /* ⚠️ ولا منافذ ولا معماريّة: «HDMI = نعم» ليست «1x HDMI 2.1»،
       و«Chipset Manufacturer = NVIDIA» ليست «Ada Lovelace». */
  ],
  Storage: [
    { key: 'capacity', match: /capacity|السعة/, clean: gb },
    /* «PCIe 4.0 x4 / M.2 2280 SSD» يحمل الثلاثة: النوع والواجهة والشكل */
    { key: 'type', match: /drive type|^type$|hard disk description|النوع/, clean: (v) => {
      if (/hdd|hard disk/i.test(v)) return 'HDD';
      if (/m\.?2/i.test(v)) return 'NVMe M.2';
      if (/sata/i.test(v)) return /2\.5/.test(v) ? 'SATA SSD 2.5"' : 'SATA SSD';
      return '';
    } },
    { key: 'interface', match: /drive type|interface|واجهة/, clean: pcie },
    { key: 'formFactor', match: /^form factor|hard disk form factor|^الشكل|drive type/, clean: (v) => {
      const m = v.match(/M\.?2\s*(\d{4})/i);
      if (m) return 'M.2 ' + m[1];
      if (/m\.?2/i.test(v)) return 'M.2 2280';
      if (/2\.5/.test(v)) return '2.5-inch';
      if (/3\.5/.test(v)) return '3.5-inch';
      return '';
    } },
    /* «Maximum: 7300 MB/s» → «7300 MB/s» · و«Read Speed IOPS» تُستبعد */
    { key: 'readSpeed', match: /^read speed$|sequential read|سرعة القراءة/, clean: (v) =>
      int(v) ? int(v) + ' MB/s' : '' },
    { key: 'writeSpeed', match: /^write speed$|sequential write|سرعة الكتابة/, clean: (v) =>
      int(v) ? int(v) + ' MB/s' : '' },
  ],
  PSU: [
    { key: 'wattage', match: /output wattage|^wattage$|^power$|القدرة/, clean: int },
    /* «Gold» و«80 Plus Gold» → «80+ Gold» */
    { key: 'rating', match: /efficiency|80 ?plus|الكفاءة/, clean: (v) => {
      const m = v.match(/titanium|platinum|gold|silver|bronze|standard|white/i);
      return m ? '80+ ' + m[0][0].toUpperCase() + m[0].slice(1).toLowerCase() : '';
    } },
    { key: 'formFactor', match: /form factor/ },
    { key: 'modularity', match: /modular/, clean: (v) => {
      if (/^(no|non)/i.test(v.trim())) return 'Non-Modular';
      if (/semi/i.test(v)) return 'Semi';
      if (/full/i.test(v)) return 'Full';
      return '';
    } },
  ],
  Case: [
    /* ⚠️ مثبَّتٌ في أوّله كي لا يخطف «PSU Form Factor» شكلَ الصندوق */
    { key: 'formFactor', match: /^form factor|motherboard support|motherboard compat|^case type/ },
    { key: 'includedFans', match: /no\.? of fans|included fans|^fans|المراوح/ },
    { key: 'radiatorSupport', match: /radiator/ },
    { key: 'maxGpuLength', match: /gpu (length|clearance)|graphics card length|vga length|طول/, clean: num },
    { key: 'maxCoolerHeight', match: /cooler (height|clearance)|cpu cooler|ارتفاع المبرّ?د/, clean: num },
    /* ⚠️ «Power supply mounting type = Bottom Mount» عند أمازون طابقت الاسمَ
       ومرّت شكلاً للمزوّد. فالحارس على **القيمة**: ما ليس ATX/SFX/TFX يُرفض،
       لأن اسم السمة وحده لا يميّز موضع التركيب من الشكل. */
    { key: 'psuFormFactor', match: /psu|power supply/, clean: (v) =>
      (v.match(/SFX-L|SFX|TFX|Flex ?ATX|ATX/i) || [''])[0].toUpperCase() },
  ],
  Cooler: [
    { key: 'sockets', match: /socket/, clean: sockets },
    { key: 'sizeMm', match: /^height|الارتفاع|radiator/, clean: num },
    { key: 'fanSize', match: /fan size|مقاس المروحة/, clean: (v) => (int(v) ? int(v) + 'mm' : '') },
    { key: 'fanCount', match: /no\.? of fans|fan count|number of fans|عدد المراوح/, clean: int },
    { key: 'rgb', match: /led color|^led|rgb|إضاءة/, clean: yesNo },
    { key: 'type', match: /cooler type|^type$|cooling method/, clean: (v) =>
      /aio|liquid|water|سائل|مائي/i.test(v) ? 'AIO' : /air|هواء/i.test(v) ? 'Air' : '' },
  ],
};

const normKey = (k: string) => k.toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();

export type Mapped = {
  /** ما قُرئ من جدول المتجر حرفيّاً */
  specs: Record<string, string>;
  /** ما استُنتج من وجود سماتٍ أخرى — يُعرض للأدمن كتخمين لا كقراءة */
  derived: Record<string, string>;
  tdpWattage: number;
};

/**
 * يحوّل سمات المتجر إلى مفاتيحنا.
 *
 * ⚠️ ولا يُخترع شيء: ما لم يُطابَق يبقى غائباً، والمسودّة تطلبه من الأدمن.
 * فالفارق بين «لم نجد» و«خمّنّا» هو الفارق بين فاحص توافقٍ يصمت وآخر يكذب.
 */
export function mapAttributes(category: string, attrs: Record<string, string>): Mapped {
  const rules = RULES[category] ?? [];
  const specs: Record<string, string> = {};
  const named = Object.entries(attrs).map(([k, v]) => [normKey(k), v] as const);

  /* ⚠️ الدوران بترتيب **القواعد** لا بترتيب السمات، وقيس عليه خطآن:
   *
   *   • بالسمات أوّلاً كانت «SPD Latency = 40» تسبق «Tested Latency = 36»،
   *     فتفوز الأولى لأنّها وردت أوّلاً في الصفحة — والثانية هي الفعليّة.
   *     وبالقواعد أوّلاً تُكتب القاعدة المفضّلة فوق العامّة فتفوز.
   *
   *   • وبالسمات أوّلاً كانت السمة الواحدة تُستهلك بأوّل مفتاحٍ يطابقها،
   *     فـ«Drive Type = PCIe 4.0 x4 / M.2 2280 SSD» تملأ `type` ثم تُترك،
   *     وهي تحمل الواجهة والشكل أيضاً. وهنا تُقرأ ثلاث مرّات بثلاثة مناظير.
   */
  for (const r of rules) {
    if (specs[r.key]) continue;
    for (const [k, rawVal] of named) {
      if (!r.match.test(k)) continue;
      const v = (r.clean ? r.clean(rawVal) : rawVal).trim();
      if (v) { specs[r.key] = v.slice(0, 120); break; }
    }
  }

  /* ============ الاستهلاك ============
   * ⚠️ ومايكرولس يعطي رقمين للمعالج: «TDP = 105 W» و«Thermal Design Power
   * (TDP, Max) = 65 W». والصحيح للرايزن ٩٦٠٠X هو ٦٥ — فالأوّل قدرةُ حزمةٍ
   * قصوى لا تصميمٌ حراريّ. فيُقدَّم الاسم الصريح على المختصر. */
  const tdpOf = (re: RegExp) => {
    for (const [rawKey, rawVal] of Object.entries(attrs)) {
      if (!re.test(normKey(rawKey))) continue;
      const n = Number(num(rawVal));
      if (Number.isFinite(n) && n > 0) return Math.round(n);
    }
    return 0;
  };
  /* ⚠️ و«Wattage» المجرّدة عند أمازون استهلاكُ المعالج، لكنّها عند المزوّد
     قدرتُه المُخرَجة — فلا تُقرأ استهلاكاً إلّا لفئةٍ يُجمع استهلاكها. */
  const tdpWattage =
    tdpOf(/thermal design/) ||
    tdpOf(/\btdp\b|استهلاك الطاقة/) ||
    (/^(CPU|GPU)$/.test(category) ? tdpOf(/^wattage$/) : 0);

  /* ============ ما يُستنتج ============
   * نوع المبرّد: المتاجر نادراً ما تقوله، لكن وجود «رادييتر» يحسمه AIO،
   * ووجود ارتفاعٍ بلا رادييتر يحسمه هوائيّاً. ويُعلَّم تخميناً لا قراءة. */
  const derived: Record<string, string> = {};
  if (category === 'Cooler' && !specs.type) {
    const names = Object.keys(attrs).map(normKey);
    if (names.some((n) => /radiator/.test(n))) derived.type = 'AIO';
    else if (names.some((n) => /^height/.test(n)) && names.some((n) => /fan size/.test(n))) derived.type = 'Air';
  }

  return { specs, derived, tdpWattage };
}
