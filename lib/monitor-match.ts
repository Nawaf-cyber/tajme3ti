/* ============ شاشةٌ تناسب كرتك — من إطاراته المقيسة ============
 *
 * خطّة الشاشات (2026-11، وافق نوّاف على المنطق): لا «تقييم جودة» للشاشة من عندنا — لا مصدر
 * قياسٍ لها كتوم هاردوير — بل **تناسبٌ** يُحسب من رقمين مقيسين:
 *   ١) الدقّة: أعلى دقّةٍ الكرتُ فيها «مريح» (٦٠ إطاراً فأكثر، lib/gpu-perf · feel) — معيار النجمة
 *      «أعلى دقّة مريحة لكرتك» نفسه.
 *   ٢) الهرتز: من إطاراته في تلك الدقّة إلى ضعفها. أقلّ منها تقصّ الشاشةُ ما يعطيه الكرت، وفوق
 *      الضعف لا يُستفاد منه في الألعاب الثقيلة (أرقام توم على Ultra؛ من يخفّض الإعدادات يكسب
 *      إطاراتٍ فيتّسع النطاق إلى الضعف لا أكثر). والألعاب التنافسيّة الخفيفة تُذكر سبباً لا توصية.
 *   ٣) المنافذ: عرضُ ما تحتاجه الشاشة في أعلى وضعٍ لها مقابل أقوى منفذٍ مشترك (lib/gpu-display).
 *
 * ⚠️ ما ليس في جدول توم لا توصية له (null) — لا تخمين، كما في بقيّة الموقع.
 * ⚠️ نقيّ بلا prisma: يُستعمل في الباني وصفحة التصفّح (عميل) وسكربت التدقيق.
 */

import { gpuPerf, type GpuPerf } from './gpu-perf';
import { gpuDisplay } from './gpu-display';

export type MonRes = '1080p' | '1440p' | '4K';
export const RES_PX: Record<MonRes, [number, number]> = { '1080p': [1920, 1080], '1440p': [2560, 1440], '4K': [3840, 2160] };
const resOf = (r: string | undefined): MonRes | null =>
  /x1080$/.test(r ?? '') ? '1080p' : /x1440$/.test(r ?? '') ? '1440p' : /x2160$/.test(r ?? '') ? '4K' : null;

export type MonitorLike = {
  id: string; brand: string; name: string; price: number; available: boolean;
  specs: Record<string, any>;
};
export type GpuLike = { name: string; specs?: Record<string, any> | null };

/* ============ عرض البيانات ============
 * ما تحتاجه الشاشة: البكسلات × الهرتز × ٢٤ بت (8-bit RGB)، و+١٠٪ لفراغات التوقيت (CVT-RB).
 * وما يحمله المنفذ **فعلاً** (بعد الترميز): HBR2 17.28 · HBR3 25.92 · UHBR10 38.7 · UHBR13.5 52.2 ·
 * UHBR20 77.4 · HDMI 2.0 (TMDS) 14.4 · HDMI 2.1 (FRL) 42.7. وDSC يضغط حتى ٣ أضعاف. */
const needGbps = (w: number, h: number, hz: number) => (w * h * hz * 1.1 * 24) / 1e9;
const dpEff = (raw: number) => (raw <= 32.4 ? raw * 0.8 : raw * 0.967);
const hdmiEff = (raw: number) => (raw <= 18 ? raw * 0.8 : raw * (16 / 18));
const MON_DP_RAW: Record<string, number> = { '1.2': 21.6, '1.4': 32.4 };
const MON_UHBR: Record<string, number> = { UHBR10: 40, 'UHBR13.5': 54, UHBR20: 80 };

export type PortFit = { kind: 'full' | 'dsc' | 'dsc-unsure' | 'limited'; via: 'DP' | 'HDMI'; maxHz?: number };

const SLACK = 1.08;
export function portFit(gpu: GpuLike, mon: MonitorLike): PortFit | null {
  const cap = gpuDisplay(gpu.specs?.architecture, gpu.specs?.ports);
  const res = resOf(mon.specs.resolution);
  const hz = Number(mon.specs.refreshHz);
  if (!cap || !res || !hz) return null;
  const [w, h] = mon.specs.resolution.split('x').map(Number);

  const monDp = mon.specs.dpVersion === '2.1' ? MON_UHBR[mon.specs.dpUhbr] ?? 40 : MON_DP_RAW[mon.specs.dpVersion] ?? 0;
  const monHdmi = mon.specs.hdmiVersion === '2.1' ? 48 : mon.specs.hdmiVersion === '2.0' ? 18 : 10.2;
  const dp = monDp && cap.dpGbps ? dpEff(Math.min(monDp, cap.dpGbps)) : 0;
  const hdmi = cap.hdmiGbps ? hdmiEff(Math.min(monHdmi, cap.hdmiGbps)) : 0;
  const via: 'DP' | 'HDMI' = dp >= hdmi ? 'DP' : 'HDMI';
  /* الشركات تضمن أعلى وضعٍ على منفذ الشاشة بتوقيتٍ أضيق من تقديرنا (Samsung G50F: 1440p 180Hz على DP 1.2،
     وحسابنا يعطيه 17.9 من 17.28) — فسماحٌ ٨٪ قبل الحكم بالنقص أو بالحاجة إلى DSC. ولا اختصار بمقارنة
     نسخ المنافذ وحدها: شاشةٌ تحتاج DSC على منفذها (4K 240 على DP 1.4) تبقى تحتاجه مع كرتٍ بالنسخة نفسها. */
  const need = needGbps(w, h, hz) / SLACK;
  const best = Math.max(dp, hdmi);
  if (need <= best) return { kind: 'full', via };

  /* الشاشة تعلن وضعاً لا يحمله منفذها بلا ضغط ⇒ هي تدعم DSC وإن لم تقله */
  const monOwn = Math.max(monDp ? dpEff(monDp) : 0, hdmiEff(monHdmi));
  const monDsc = mon.specs.dsc === 'Yes' || (mon.specs.dsc !== 'No' && need > monOwn);
  if (monDsc && need <= best * 3) return { kind: cap.dsc === true ? 'dsc' : 'dsc-unsure', via };
  return { kind: 'limited', via, maxHz: Math.floor(best * SLACK / needGbps(w, h, 1)) };
}

/* ============ التوصية ============ */

export type Pick = {
  role: 'best' | 'image' | 'alt';
  mon: MonitorLike;
  res: MonRes;
  fit: PortFit | null;
  reasons: string[];
};
export type MonitorAdvice = {
  perf: GpuPerf;
  res: MonRes;
  fps: number;
  band: [number, number];
  picks: Pick[];
};

const fpsAt = (p: GpuPerf, r: MonRes) => (r === '4K' ? p.f4k : r === '1440p' ? p.f1440 : p.f1080);
const ORDER: MonRes[] = ['1080p', '1440p', '4K'];
const isOled = (m: MonitorLike) => /OLED/.test(m.specs.panel ?? '');
const fitOk = (f: PortFit | null) => !f || f.kind !== 'limited';
const r0 = (n: number) => Math.round(n);

/** أعلى دقّةٍ مريحة (٦٠+). وكرتٌ لا يبلغ ٦٠ حتى في 1080p يأخذ 1080p ويُقال ذلك في السبب */
export function targetRes(p: GpuPerf): MonRes {
  for (const r of ['4K', '1440p'] as MonRes[]) if (fpsAt(p, r) >= 60) return r;
  return '1080p';
}

/* الأسباب بلهجة الواجهة (سعوديّة بيضاء خفيفة — memory: saudi-dialect-copy) لأنّها تُعرض كما هي */
function reasonsFor(role: Pick['role'], m: MonitorLike, res: MonRes, fps: number, band: [number, number], fit: PortFit | null, base: MonRes): string[] {
  const hz = Number(m.specs.refreshHz);
  const f = r0(fps);
  const out: string[] = [];
  if (role === 'alt') {
    out.push(ORDER.indexOf(res) > ORDER.indexOf(base)
      ? `لو تبي دقّة أعلى: كرتك يجيب تقريباً ${f} إطار في ${res} — مقبول، مو مريح.`
      : `لو تبي إطارات أكثر بسعر أقل: كرتك يجيب تقريباً ${f} إطار في ${res}.`);
  }
  if (hz < band[0]) out.push(`${hz} هرتز أقل من إطارات كرتك (${f} في ${res})، يعني تضيّع شوي منها، بس أرخص.`);
  else if (role !== 'alt' && hz <= band[1]) out.push(`كرتك يجيب تقريباً ${f} إطار في ${res}، و${hz} هرتز تغطّيها وزيادة.`);
  else if (hz > band[1]) out.push(`${hz} هرتز أعلى بكثير من إطارات كرتك في الألعاب الثقيلة — تستفيد منها أكثر في الألعاب التنافسية الخفيفة.`);
  if (role === 'best' && fps < 60) out.push('كرتك ما يوصل ٦٠ إطار حتى في 1080p بالإعدادات العالية — خفّف الإعدادات شوي وتستفيد من الهرتز.');
  if (isOled(m)) out.push('OLED: أسود حقيقي واستجابة شبه فورية — أحلى صورة، بس أغلى وتبي عناية عشان ما تحترق الشاشة.');
  else if (m.specs.panel === 'IPS') out.push('IPS: ألوان دقيقة وزوايا رؤية واسعة.');
  else if (m.specs.panel === 'VA') out.push('VA: تباين أعلى من IPS وأسود أعمق، وممكن يبان أثر خفيف في المشاهد الغامقة السريعة.');
  if (fit?.kind === 'full') out.push(`منافذ كرتك تشغّلها بكامل سرعتها عبر ${fit.via}.`);
  else if (fit?.kind === 'dsc') out.push('تشتغل بكامل سرعتها بضغط DSC، وكرتك يدعمه.');
  else if (fit?.kind === 'dsc-unsure') out.push('تحتاج ضغط DSC عشان توصل أعلى سرعتها، والشركة ما تذكر إن كرتك يدعمه — ممكن توقف قبلها.');
  else if (fit?.kind === 'limited') out.push(`منافذ كرتك توصلها لـ${fit.maxHz} هرتز بس، مو ${hz}.`);
  return out;
}

export function adviseMonitors(gpu: GpuLike, monitors: MonitorLike[]): MonitorAdvice | null {
  const perf = gpuPerf(gpu.name, Number(String(gpu.specs?.vram ?? '').replace(/\D/g, '')) || null);
  if (!perf) return null;
  const res = targetRes(perf);
  const fps = fpsAt(perf, res);
  /* السقف ضعف الإطارات أو 180 أيّهما أعلى: 180 صارت مدخل شاشات الألعاب، فكرتٌ بـ٦٣ إطاراً لا يُدفع
     إلى شاشةٍ أغلى لمجرّد أنّ هرتزها 165 أقرب إلى ١٢٦ (قيس: G55C 32 بـ1124 بدل G50F بـ729) */
  const hi = (f: number) => Math.max(r0(f * 2), 180);
  const band: [number, number] = [r0(fps), hi(fps)];
  const live = monitors.filter((m) => m.available && m.price > 0);
  const at = (r: MonRes) => live.filter((m) => resOf(m.specs.resolution) === r);
  const hzOf = (m: MonitorLike) => Number(m.specs.refreshHz);
  const withFit = (m: MonitorLike) => ({ m, fit: portFit(gpu, m) });
  const cheapest = <T extends { m: MonitorLike }>(xs: T[]) => [...xs].sort((a, b) => a.m.price - b.m.price)[0];
  const inBand = (m: MonitorLike, b = band) => hzOf(m) >= b[0] && hzOf(m) <= b[1];

  const picks: Pick[] = [];
  const used = new Set<string>();
  const add = (role: Pick['role'], x: { m: MonitorLike; fit: PortFit | null } | undefined, r: MonRes, f: number, b: [number, number]) => {
    if (!x || used.has(x.m.id)) return;
    used.add(x.m.id);
    picks.push({ role, mon: x.m, res: r, fit: x.fit, reasons: reasonsFor(role, x.m, r, f, b, x.fit, res) });
  };

  /* ١) الأنسب: غير OLED داخل النطاق، الأرخص. وإن خلا النطاق: أقرب هرتزٍ فوقه، ثمّ تحته */
  const pool = at(res).filter((m) => !isOled(m)).map(withFit).filter((x) => fitOk(x.fit));
  const above = pool.filter((x) => hzOf(x.m) > band[1]).sort((a, b) => hzOf(a.m) - hzOf(b.m) || a.m.price - b.m.price)[0];
  const below = pool.filter((x) => hzOf(x.m) < band[0]).sort((a, b) => hzOf(b.m) - hzOf(a.m) || a.m.price - b.m.price)[0];
  add('best', cheapest(pool.filter((x) => inBand(x.m))) ?? above ?? below, res, fps, band);

  /* ٢) صورة أفضل: OLED في الدقّة نفسها — داخل النطاق أوّلاً، وإلّا الأرخص */
  const oled = at(res).filter(isOled).map(withFit).filter((x) => fitOk(x.fit));
  add('image', cheapest(oled.filter((x) => hzOf(x.m) >= band[0])) ?? cheapest(oled), res, fps, band);

  /* ٣) بديل: الدقّة الأعلى إن كان الكرت فيها «مقبولاً» (٤٥+) — وإلّا الأدنى بهرتزٍ أعلى */
  const i = ORDER.indexOf(res);
  const up = ORDER[i + 1];
  if (up && fpsAt(perf, up) >= 45) {
    const f = fpsAt(perf, up); const b: [number, number] = [r0(f), hi(f)];
    const c = at(up).filter((m) => !isOled(m)).map(withFit).filter((x) => fitOk(x.fit));
    add('alt', cheapest(c.filter((x) => hzOf(x.m) >= b[0])) ?? cheapest(c), up, f, b);
  } else if (i > 0) {
    const dn = ORDER[i - 1]; const f = fpsAt(perf, dn); const b: [number, number] = [r0(f), hi(f)];
    const c = at(dn).map(withFit).filter((x) => fitOk(x.fit));
    add('alt', cheapest(c.filter((x) => inBand(x.m, b))) ?? cheapest(c), dn, f, b);
  }
  return { perf, res, fps, band, picks };
}
