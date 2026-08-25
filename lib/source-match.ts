/* ============ مطابقة قطعتنا بمنتجٍ في متجر ============
 *
 * منطقٌ نقيّ بلا شبكة ولا prisma — يستعمله السكربت وصفحة الإدارة معاً.
 * وُضع هنا لا في أحدهما لأن نسختين تعنيان عيباً يُصلَح في واحدة ويعيش في
 * الأخرى، وهو درس ساحبات الأسعار.
 *
 * ⚠️ **المطابقة هي كل شيء.** البحث يعطي أشباهاً لا أطرافاً، وقد كذب
 * المطابق ثلاث مرّاتٍ قبل أن يصدق:
 *
 *     AG400 BK ARGB   ≠ AG400 G2 ARGB       Ryzen 9 9950X ≠ 9950X3D
 *     Ryzen 9 7900    ≠ 7900X                Ryzen 5 5500  ≠ 5500H (لابتوب)
 *     B650 Gaming     ≠ B650M Gaming         SSR-650FM     ≠ SSR-650FX
 *     RX 7900 GRE     ≠ RX 7900 XTX          Crosshair Hero ≠ Crosshair Extreme
 *
 * فالقاعدة: لا يُقبل مرشّحٌ إلا إذا حمل **كل** رمزٍ مميّز في اسمنا —
 * الشركة، والسعة، والطراز بحدّ كلمة، وكل كلمةٍ غير عامّة، ومقاس اللوحة،
 * واللون في الاتّجاهين. وما شكّ فيه يُعرض للمراجعة ولا يُكتب.
 */

import { capacityGb } from './capacity';

export type Candidate = { title: string; url: string; price?: number | null };
export type Verdict = { ok: boolean; why: string };

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** حدُّ كلمةٍ على النصّ الأصليّ — التطبيع يُذيب الفواصل فتصير 9950X3D حاويةً 9950X */
const hasWord = (haystack: string, token: string): boolean => {
  const t = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9])${t}([^A-Za-z0-9]|$)`, 'i').test(haystack);
};

/* كلماتٌ تقولها كل صفحةٍ في المتجر، فلا تُميّز شيئاً */
const GENERIC = new Set([
  'GAMING', 'WIFI', 'ATX', 'EATX', 'ITX', 'PLUS', 'PRO', 'MAX', 'EDITION', 'SERIES',
  'DESKTOP', 'MEMORY', 'INTERNAL', 'SSD', 'NVME', 'SATA', 'RGB', 'ARGB', 'BLACK',
  'GOLD', 'PLATINUM', 'TOWER', 'CASE', 'COOLER', 'LIQUID', 'AIR', 'FAN', 'AMD', 'INTEL',
  'GEFORCE', 'RADEON', 'NVIDIA', 'MOTHERBOARD', 'CPU', 'GPU', 'CORE', 'THE', 'AND', 'FOR',
]);

/** أنظمةٌ كاملة تحمل اسم القطعة ولا تُساويها — لابتوب فيه Ryzen 5500H ليس معالجاً */
const IS_SYSTEM = /\b(laptop|notebook|gaming pc|desktop pc|all-in-one|bundle|prebuilt|workstation)\b|gaming desktop/i;

/** يُجرَّد الاسم من الوحدات كي تبقى كلماتُ الطراز وحدها */
const stripUnits = (name: string) =>
  name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(GB|TB|MB)\b/gi, ' ')
    .replace(/\b\d{3,5}\s*MHZ\b/gi, ' ')
    .replace(/\bDDR[345]\b/gi, ' ')
    .replace(/\bCL\d{2}\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * سؤال المتجر: اسم العائلة وحده.
 *
 * ⚠️ بحث مايكرولس يشترط **كل** الكلمات، فالاسم الكامل يخنقه:
 *   «Corsair Vengeance DDR5 32GB» → 4 نتائج أوّلها ذاكرةُ لابتوب
 *   «Vengeance LPX»               → 27 نتيجة أوّلها المطابقُ حرفياً
 * فالسؤال واسعٌ والتصفية ضيّقة، لا العكس.
 */
export const queryFor = (name: string): string => {
  const cleaned = stripUnits(name).replace(/\b(WHITE|BLACK)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(Boolean).slice(0, 3).join(' ');
  return (words || name).trim();
};

/** توحيد أسماء المقاسات كما تكتبها المتاجر */
export const formFactorOf = (title: string): string | null => {
  const t = title.toUpperCase();
  if (/\bMINI[\s-]?ITX\b/.test(t)) return 'MINI-ITX';
  if (/\b(MICRO[\s-]?ATX|MATX|M-ATX)\b/.test(t)) return 'MICRO-ATX';
  if (/\bE[\s-]?ATX\b/.test(t)) return 'E-ATX';
  if (/\bATX\b/.test(t)) return 'ATX';
  return null;
};

export type Fingerprint = {
  brand: string;
  capacityGb: number;
  models: string[];   // رموزٌ فيها رقم: 9950X · B650 · SSR-650FM · GL240
  words: string[];    // كلماتٌ مميّزة بلا رقم: GRE · HERO · AORUS
  formFactor: string | null;
  white: boolean;
  query: string;
};

/** يستخرج ما لا يجوز أن يختلف بين قطعتنا والمرشّح */
export function fingerprint(brand: string, name: string, specs: any): Fingerprint {
  const stripped = stripUnits(name);
  const full = `${brand} ${name}`;

  const rawModels: string[] = stripped.match(/[A-Za-z]*\d[A-Za-z0-9-]*/g) ?? [];
  const models = [...new Set(rawModels.filter((t) => t.length >= 2).map((t) => t.toUpperCase()))];

  const rawWords: string[] = stripped.toUpperCase().match(/[A-Z]{3,}/g) ?? [];
  const words = [...new Set(rawWords.filter((w) => !GENERIC.has(w)))];

  return {
    brand: norm(brand),
    capacityGb: capacityGb(specs?.capacity),
    models,
    words,
    formFactor: String(specs?.formFactor ?? '').trim().toUpperCase() || null,
    white: /WHITE/i.test(full),
    query: queryFor(name),
  };
}

/** هل المرشّح هو القطعة نفسها؟ */
export function matches(fp: Fingerprint, cand: string): Verdict {
  if (IS_SYSTEM.test(cand)) return { ok: false, why: 'جهازٌ كامل لا قطعة' };

  const candWhite = /WHITE/i.test(cand);
  if (fp.white !== candWhite) {
    return { ok: false, why: fp.white ? 'قطعتنا بيضاء والمرشّح لا' : 'المرشّح أبيض وقطعتنا لا' };
  }

  if (!norm(cand).includes(fp.brand)) return { ok: false, why: 'شركةٌ أخرى' };

  if (fp.capacityGb > 0) {
    const found = [...cand.matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)\b/gi)].map((m) => capacityGb(`${m[1]}${m[2]}`));
    if (!found.some((v) => Math.abs(v - fp.capacityGb) < 0.5)) {
      return { ok: false, why: `السعة لا تطابق` };
    }
  }

  for (const m of fp.models) if (!hasWord(cand, m)) return { ok: false, why: `ينقصه الطراز ${m}` };
  for (const w of fp.words) if (!hasWord(cand, w)) return { ok: false, why: `ينقصه «${w}»` };

  if (fp.formFactor) {
    const theirs = formFactorOf(cand);
    /* لا يُرفض على الجهل: صفحةٌ لا تذكر المقاس لا تُدين نفسها */
    if (theirs && theirs !== fp.formFactor) return { ok: false, why: `المقاس ${theirs} لا ${fp.formFactor}` };
  }

  return { ok: true, why: '' };
}

/** أفضل مرشّحٍ مطابق، مع سبب رفض الأقرب حين لا يوجد */
export function pick(fp: Fingerprint, cands: Candidate[]): { hit: Candidate | null; nearest: string | null } {
  for (const c of cands) if (matches(fp, c.title).ok) return { hit: c, nearest: null };
  return { hit: null, nearest: cands[0]?.title ?? null };
}
