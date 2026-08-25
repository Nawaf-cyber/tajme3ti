/* ============ البحث عن شاهدٍ ثانٍ — بمطابقةٍ صارمة ============
 *
 * ٨٥ قطعة لها مصدرٌ حيٌّ واحد ولا صفَّ متجرٍ آخر. ومطابقةُ كلٍّ منها يدوياً
 * تكلّف ستّ محاولاتٍ أو ثمانياً، فلا تُنجَز هكذا.
 *
 * ومايكرولس يستجيب لطلبٍ عاديّ من الخادم (200 في 0.7ث بلا وسيط ولا رصيد)،
 * بخلاف كازاسوق (403) ونون (محجوب). فيُبحث فيه آلياً، ويبقى الآخران يدويّاً.
 *
 * ⚠️ **والمطابقة هي كل شيء.** الخطأ الذي أوقف هذا البند من البداية أن
 * البحث يعطي أشباهاً لا أطرافاً:
 *
 *     AG400 BK ARGB        ≠ AG400 G2 ARGB
 *     GV-N506TWF2-16GD     ≠ GV-N506TWF2**OC**-16GD   ← رُصد اليوم
 *     LE240 V2             ≠ LE240 V2 **White**
 *
 * فلا يُقترح مرشّحٌ إلا إذا حمل **كل** رموز التمييز: الشركة، والسعة،
 * والسرعة، والجيل، واللون — ووجودُ لونٍ عندنا وغيابُه عنده تعارضٌ كوجود
 * العكس. والمشكوك فيه يُطبع للمراجعة ولا يُكتب.
 *
 *   npx tsx scripts/find-second-source.ts            كل الفئات، عرض فقط
 *   npx tsx scripts/find-second-source.ts RAM        فئة بعينها
 *   npx tsx scripts/find-second-source.ts RAM --apply
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { liveOffers } from '../lib/stores';
import { capacityGb } from '../lib/capacity';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const ONLY = ARGS.find((a) => !a.startsWith('--')) || null;
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Cand = { title: string; url: string };

/** بحث مايكرولس — المعامل `query` لا `q` (كلّفني ذلك نتائج فارغة كاذبة) */
async function searchMicroless(q: string): Promise<Cand[]> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 20000);
  try {
    const html = await fetch(
      'https://saudi.microless.com/search/?query=' + encodeURIComponent(q),
      { signal: ctrl.signal, headers: { 'User-Agent': UA } },
    ).then((r) => r.text());
    clearTimeout(to);

    /* ⚠️ يُقصّ من `#search-results-products` وحده. أوّل صياغةٍ أخذت أوّل
       اثني عشر رابطَ منتجٍ في الصفحة — وهي كاروسيل «موصى به» يسبق النتائج،
       فكان المرشّح لطقم رامٍ لابتوباً أو ساعةَ لياقة. البحث الذي يقرأ
       الجزء الخطأ من الصفحة لا يبحث.

       والعنوان يُؤخذ من `alt` الصورة لا من نصّ الرابط: هو وحده يحمل رمز
       الطراز كاملاً (`CMSX32GX5M1A5600C48`) — وعليه تقوم المطابقة. */
    const start = html.indexOf('id="search-results-products"');
    if (start < 0) return [];
    const body = html.slice(start);

    const out: Cand[] = [];
    const seen = new Set<string>();
    const re = /data-listid="search"[\s\S]{0,1200}?href="(https:\/\/saudi\.microless\.com\/product\/[^"]+)"[\s\S]{0,600}?alt="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body))) {
      const url = m[1];
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ title: m[2].replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(), url });
      if (out.length >= 12) break;
    }
    return out;
  } catch { clearTimeout(to); return []; }
}

/* ============ رموز التمييز ============ */

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/* ============ صياغة الاستعلام ============
 *
 * بحث مايكرولس يشترط **كل** الكلمات، فالاسم الكامل يخنقه:
 *
 *   «Corsair Vengeance DDR5 32GB»  →  4 نتائج، أوّلها ذاكرةُ لابتوب
 *   «Vengeance LPX 32GB»           →  19 نتيجة، أوّلها المطابق حرفياً
 *   «Vengeance LPX»                →  27 نتيجة
 *
 * فيُسأل باسم العائلة وحده — الشركة والطراز — وتُترك الأرقام للمطابقة
 * الصارمة بعدها. السؤال الواسع والتصفية الضيّقة، لا العكس.
 */
const queryFor = (brand: string, name: string): string => {
  const cleaned = name
    .replace(/\([^)]*\)/g, ' ')                      // (2x16GB)
    .replace(/\b\d+(\.\d+)?\s*(GB|TB|MB)\b/gi, ' ')  // السعة
    .replace(/\b\d{3,5}\s*MHZ\b/gi, ' ')             // السرعة
    .replace(/\bDDR[345]\b/gi, ' ')
    .replace(/\bCL\d{2}\b/gi, ' ')
    .replace(/\b(WHITE|BLACK)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned.split(' ').filter(Boolean).slice(0, 3).join(' ');
  return (words || name).trim();
};

/** يستخرج ما لا يجوز أن يختلف بين قطعتنا والمرشّح */
function tokensOf(brand: string, name: string, specs: any): { must: string[]; label: string } {
  const full = `${brand} ${name}`;
  const must: string[] = [];

  /* الشركة — أوّل ما يُميّز، ومنه ما يُكتب بصيغتين (G.Skill / GSKILL) */
  must.push(norm(brand));

  /* السعة — بالجيجابايت كي لا تُقارَن 2TB بـ2GB */
  const cap = capacityGb(specs?.capacity);
  if (cap > 0) must.push(`CAP:${cap}`);

  /* رقم الطراز: RTX 5060 · B650M · i5-14600K · SN850X */
  const model = full.toUpperCase().match(/\b(?:RTX|GTX|RX|ARC)\s?([A-Z]?\d{3,4})\s?(TI|SUPER|XT|XTX)?/);
  if (model) must.push(`GPU:${model[1]}${model[2] ?? ''}`);

  /* السرعة — 6000MHz تفصل طقمين متطابقين في كل شيءٍ آخر */
  const mhz = full.match(/(\d{4,5})\s?MHZ/i);
  if (mhz) must.push(`MHZ:${mhz[1]}`);

  /* الجيل */
  const ddr = full.toUpperCase().match(/\bDDR([45])\b/);
  if (ddr) must.push(`DDR${ddr[1]}`);

  /* التوقيت */
  const cl = full.toUpperCase().match(/\bCL(\d{2})\b/);
  if (cl) must.push(`CL${cl[1]}`);

  /* ============ رمز الطراز — الحارس الحقيقيّ ============
   *
   * ⚠️ بلا هذا كان المُطابق يقبل ما يلي، وكلُّه منتجٌ آخر:
   *
   *     Ryzen 9 9950X       ↔ 9950X**3D**
   *     Ryzen 9 7900        ↔ 7900**X**
   *     Ryzen 5 5500        ↔ 5500**H** (في لابتوب لينوفو!)
   *     B650 Gaming Plus    ↔ B650**M** Gaming Plus
   *     SSR-650F**M**       ↔ SSR-650F**X**
   *     RX 7900 **GRE**     ↔ RX 7900 XTX
   *
   * فكلُّ رمزٍ في اسمنا فيه رقم يصير شرطاً، ويُطلب **بحدّ كلمة**: «9950X»
   * لا تُطابق «9950X3D» لأن ما بعد X رقمٌ لا فاصل. وهذا الحدّ وحده هو
   * الفرق بين مطابقةٍ ومقاربة. */
  const stripped = name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(GB|TB|MB)\b/gi, ' ')
    .replace(/\b\d{3,5}\s*MHZ\b/gi, ' ')
    .replace(/\bDDR[345]\b/gi, ' ')
    .replace(/\bCL\d{2}\b/gi, ' ');
  for (const tok of stripped.match(/[A-Za-z]*\d[A-Za-z0-9-]*/g) || []) {
    if (tok.length < 2) continue;
    must.push(`RE:${tok.toUpperCase()}`);
  }

  /* ⚠️ وكلمةُ الطراز بلا رقمٍ تفصل أيضاً، وقد أفلتت مرّتين:
   *     RX 7900 **GRE**        ↔ RX 7900 XTX
   *     Crosshair X670E **Hero** ↔ Crosshair X670E Extreme
   * فتُشترط كل كلمةٍ مميّزة — عدا الكلمات العامّة التي تقولها كل صفحة. */
  const GENERIC = new Set([
    'GAMING', 'WIFI', 'ATX', 'EATX', 'ITX', 'PLUS', 'PRO', 'MAX', 'EDITION', 'SERIES',
    'DESKTOP', 'MEMORY', 'INTERNAL', 'SSD', 'NVME', 'SATA', 'RGB', 'ARGB', 'BLACK',
    'GOLD', 'PLATINUM', 'TOWER', 'CASE', 'COOLER', 'LIQUID', 'AIR', 'FAN', 'AMD', 'INTEL',
    'GEFORCE', 'RADEON', 'NVIDIA', 'MOTHERBOARD', 'CPU', 'GPU', 'CORE', 'THE', 'AND', 'FOR',
  ]);
  for (const w of stripped.toUpperCase().match(/[A-Z]{3,}/g) || []) {
    if (GENERIC.has(w) || must.includes(`W:${w}`)) continue;
    must.push(`W:${w}`);
  }

  /* مقاس اللوحة: B650 ليست B650M — والاسمان يتشابهان والمقاس يفصل */
  const ff = String(specs?.formFactor ?? '').trim().toUpperCase();
  if (ff) must.push(`FF:${ff}`);

  return { must, label: full };
}

/** توحيد أسماء المقاسات كما تكتبها المتاجر */
const ffOf = (title: string): string | null => {
  const t = title.toUpperCase();
  if (/\bMINI[\s-]?ITX\b/.test(t)) return 'MINI-ITX';
  if (/\b(MICRO[\s-]?ATX|MATX|M-ATX)\b/.test(t)) return 'MICRO-ATX';
  if (/\bE[\s-]?ATX\b/.test(t)) return 'E-ATX';
  if (/\bATX\b/.test(t)) return 'ATX';
  return null;
};

/** أنظمة كاملة تحمل اسم القطعة ولا تُساويها — لابتوب فيه Ryzen 5500H ليس معالجاً */
const IS_SYSTEM = /\b(laptop|notebook|gaming pc|desktop pc|all-in-one|bundle|prebuilt|workstation)\b|gaming desktop/i;

/** هل يحمل المرشّح كل الرموز؟ واللون يُقارَن في الاتّجاهين */
function matches(must: string[], ourName: string, cand: string): { ok: boolean; why: string } {
  const c = norm(cand);
  if (IS_SYSTEM.test(cand)) return { ok: false, why: 'جهازٌ كامل لا قطعة' };
  const ourWhite = /WHITE|أبيض/i.test(ourName);
  const candWhite = /WHITE/i.test(cand);
  if (ourWhite !== candWhite) {
    return { ok: false, why: ourWhite ? 'قطعتنا بيضاء والمرشّح لا' : 'المرشّح أبيض وقطعتنا لا' };
  }
  for (const t of must) {
    if (t.startsWith('CAP:')) {
      const want = Number(t.slice(4));
      const found = [...cand.matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)\b/gi)].map((m) => capacityGb(`${m[1]}${m[2]}`));
      if (!found.some((v) => Math.abs(v - want) < 0.5)) return { ok: false, why: `السعة لا تطابق (${t.slice(4)}GB)` };
    } else if (t.startsWith('RE:')) {
      /* حدُّ الكلمة على النصّ الأصليّ لا على المُطبَّع: التطبيع يُذيب
         الفواصل فتصير «9950X3D» حاويةً «9950X». */
      const tok = t.slice(3).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`(^|[^A-Za-z0-9])${tok}([^A-Za-z0-9]|$)`, 'i').test(cand)) {
        return { ok: false, why: `ينقصه الطراز ${t.slice(3)}` };
      }
    } else if (t.startsWith('W:')) {
      const w = t.slice(2);
      if (!new RegExp(`(^|[^A-Za-z0-9])${w}([^A-Za-z0-9]|$)`, 'i').test(cand)) {
        return { ok: false, why: `ينقصه «${w}»` };
      }
    } else if (t.startsWith('FF:')) {
      const ours = t.slice(3);
      const theirs = ffOf(cand);
      /* لا يُرفض على الجهل: صفحةٌ لا تذكر المقاس لا تُدين نفسها */
      if (theirs && theirs !== ours) return { ok: false, why: `المقاس ${theirs} لا ${ours}` };
    } else if (t.startsWith('GPU:') || t.startsWith('MHZ:')) {
      if (!c.includes(norm(t.split(':')[1]))) return { ok: false, why: `ينقصه ${t}` };
    } else if (!c.includes(t)) {
      return { ok: false, why: `ينقصه ${t}` };
    }
  }
  return { ok: true, why: '' };
}

async function main() {
  const all = await prisma.component.findMany({
    where: ONLY ? { category: { name: ONLY } } : {},
    include: { category: true, offers: { include: { store: true } } },
    orderBy: { price: 'desc' },
  });

  const need = all.filter((c) => liveOffers(c.offers as any).length === 1 && c.offers.length === 1);
  console.log(`\n${need.length} قطعة تحتاج شاهداً ثانياً${ONLY ? ` في ${ONLY}` : ''}`);
  console.log(`${D}البحث في مايكرولس فقط — كازاسوق يردّ 403 ونون محجوب، فيبقيان يدويَّين.${X}\n`);

  const store = await prisma.store.findFirst({ where: { slug: 'microless' }, select: { id: true } });
  if (!store) { console.error('⛔ مايكرولس غير موجود'); process.exit(1); }

  let found = 0, none = 0, added = 0;

  for (const c of need) {
    const specs = typeof c.specs === 'string' ? JSON.parse(c.specs) : (c.specs as any) || {};
    const { must } = tokensOf(c.brand, c.name, specs);
    const cands = await searchMicroless(queryFor(c.brand, c.name));
    await sleep(700); // لا نُغرق متجراً يستضيفنا مجّاناً

    const hit = cands.map((x) => ({ ...x, m: matches(must, `${c.brand} ${c.name}`, x.title) })).find((x) => x.m.ok);

    if (!hit) {
      none++;
      const near = cands[0];
      console.log(`  ${D}—${X} ${c.brand} ${c.name}  ${D}(${cands.length} مرشّحاً، لا مطابق)${X}`);
      if (near) console.log(`      ${D}أقربها: ${near.title.slice(0, 78)}${X}`);
      continue;
    }

    found++;
    console.log(`  ${G}✔${X} ${c.brand} ${c.name}`);
    console.log(`      ${hit.title.slice(0, 92)}`);
    console.log(`      ${D}${hit.url.slice(0, 96)}${X}`);

    if (APPLY) {
      const taken = await prisma.componentOffer.findFirst({ where: { url: hit.url } });
      if (taken) { console.log(`      ${Y}⚠ الرابط مستعملٌ لقطعةٍ أخرى — لا يُكتب${X}`); continue; }
      await prisma.componentOffer.create({
        data: { componentId: c.id, storeId: store.id, url: hit.url, inStock: true },
      });
      added++;
      console.log(`      ${G}✚ أُضيف — السعر يملؤه السحب القادم${X}`);
    }
  }

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`مطابق: ${found} · بلا مطابق: ${none}${APPLY ? ` · أُضيف: ${added}` : ''}`);
  if (!APPLY && found) console.log(`${D}أضف --apply للكتابة. السعر يُترك فارغاً ليقرأه الساحب من المصدر.${X}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
