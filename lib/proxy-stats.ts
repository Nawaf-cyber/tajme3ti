/* ============ عدّادات البروكسي العاديّ ووضعُه — في جدول الإعدادات ============
 *
 * يكتب هنا مسارا السحب (الكرون و«تحديث قطعة») آخرَ كلّ تشغيلة ما عدّه
 * lib/proxy-fallback في الذاكرة، وتقرؤه اللوحة: كم صفحةٍ قُرئت بالعاديّ، وكم احتاجت
 * المتقدّم، وكم فشلت بالطريقتين، وما قالته عيّنة المقارنة.
 *
 * ⚠️ في جدول Setting (مفتاح/قيمة) لا جدولٍ جديد: لا يحتاج `prisma db push`.
 * صفٌّ لكلّ ساعة (`proxy.h.2026-10-19T14`) قيمته JSON، ويُحذف ما تجاوز ٤٨ ساعة.
 * والكتابة قراءةٌ ثمّ كتابة: تشغيلتان تُفرغان في الساعة نفسها في اللحظة نفسها قد
 * تُسقط إحداهما عدّاد الأخرى — والدفعات المجدولة متتالية لا متوازية، فالخسارة
 * نادرة وفي عدّادٍ إحصائيّ، لا في سعر.
 */

import type { PrismaClient } from '@prisma/client';
import { setProxyMode, takeProxyTally, type ProxyCounts, type ProxyDiff, type ProxyMode } from './proxy-fallback';

export const PROXY_MODE_KEY = 'proxy.mode';
const HOUR_PREFIX = 'proxy.h.';
const DIFFS_KEY = 'proxy.diffs';
const KEEP_DIFFS = 40;

const hourKey = (d: Date) => `${HOUR_PREFIX}${d.toISOString().slice(0, 13)}`;
const isMode = (v: unknown): v is ProxyMode => v === 'auto' || v === 'premium';
const parse = <T,>(s: string | null | undefined, fallback: T): T => {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
};

/** يُستدعى قبل السحب: الوضع من اللوحة (`auto` افتراضاً) */
export async function loadProxyMode(prisma: PrismaClient): Promise<ProxyMode> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: PROXY_MODE_KEY } });
    const m = isMode(row?.value) ? row!.value : 'auto';
    setProxyMode(m);
    return m;
  } catch {
    setProxyMode('auto');
    return 'auto';
  }
}

export type ProxySnapshot = ReturnType<typeof takeProxyTally>;

/** آخرَ التشغيلة: يكتب ما عُدّ ويُرجعه (للتنبيه). الفشل هنا لا يُفشل التشغيلة */
export async function flushProxyStats(prisma: PrismaClient): Promise<ProxySnapshot> {
  const snap = takeProxyTally();
  const stores = Object.keys(snap.counts);
  if (!stores.length && !snap.diffs.length) return snap;
  try {
    const key = hourKey(new Date());
    const row = await prisma.setting.findUnique({ where: { key } });
    const cur = parse<Record<string, ProxyCounts>>(row?.value, {});
    for (const s of stores) {
      const into = (cur[s] ??= { normalOk: 0, fallback: 0, bothFail: 0, sampleSame: 0, sampleDiff: 0 });
      for (const [k, v] of Object.entries(snap.counts[s])) into[k as keyof ProxyCounts] += v;
    }
    const value = JSON.stringify(cur);
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });

    if (snap.diffs.length) {
      const old = await prisma.setting.findUnique({ where: { key: DIFFS_KEY } });
      const all = [...snap.diffs, ...parse<ProxyDiff[]>(old?.value, [])].slice(0, KEEP_DIFFS);
      const v = JSON.stringify(all);
      await prisma.setting.upsert({ where: { key: DIFFS_KEY }, update: { value: v }, create: { key: DIFFS_KEY, value: v } });
    }

    // ما تجاوز ٤٨ ساعة — المفاتيح بتاريخ ISO فالمقارنة النصّيّة ترتيبٌ زمنيّ
    await prisma.setting.deleteMany({
      where: { key: { startsWith: HOUR_PREFIX, lt: hourKey(new Date(Date.now() - 48 * 3600_000)) } },
    });
  } catch (e) {
    console.error('[proxy] تعذّر حفظ العدّادات', e);
  }
  return snap;
}

/* ============ التنبيه في ديسكورد ============
   سعرٌ مختلف في العيّنة، أو نسبة «احتاج المتقدّم» فوق ٣٠٪ في تشغيلةٍ فيها ٢٠ صفحةً
   فأكثر (أقلّ من ذلك ضجيجُ عيّنةٍ صغيرة). بلا إشارة رتبة: هذا للأدمن لا للمشتركين. */
export const FALLBACK_ALERT_RATE = 0.3;

export async function alertProxy(snap: ProxySnapshot): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const lines: string[] = [];
  for (const d of snap.diffs) {
    const fmt = (r: ProxyDiff['normal']) => (r.price != null ? `${r.price} ريال` : 'بلا سعر') + (r.inStock ? '' : ' (نافد)');
    lines.push(`🔍 **${d.name}** (${d.store}): العادي ${fmt(d.normal)} · المتقدّم ${fmt(d.premium)}\n↳ ${d.url.split('?')[0]}`);
  }
  for (const [store, c] of Object.entries(snap.counts)) {
    const total = c.normalOk + c.fallback + c.bothFail;
    const rate = total ? (c.fallback + c.bothFail) / total : 0;
    if (total >= 20 && rate > FALLBACK_ALERT_RATE) {
      lines.push(`↻ **${store}**: ${Math.round(rate * 100)}% من ${total} صفحة احتاجت المتقدّم — البروكسي العادي قد يكون محجوباً. المفتاح في اللوحة يرجّعه للمتقدّم دائماً.`);
    }
  }
  if (!lines.length) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '⚠️ البروكسي العادي — يحتاج نظرة',
          description: lines.join('\n\n').slice(0, 4000),
          color: 15105570, // برتقالي
          timestamp: new Date().toISOString(),
        }],
      }),
      signal: ctrl.signal,
    });
  } catch (e) {
    console.error('[proxy] فشل تنبيه ديسكورد', e);
  } finally {
    clearTimeout(timer);
  }
}

/* ============ للوحة: آخر ٢٤ ساعة ============ */
export type ProxyStatus = {
  mode: ProxyMode;
  stores: Record<string, ProxyCounts>;
  diffs: ProxyDiff[];
};

export async function readProxyStatus(prisma: PrismaClient): Promise<ProxyStatus> {
  const since = hourKey(new Date(Date.now() - 24 * 3600_000));
  const [modeRow, rows, diffsRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: PROXY_MODE_KEY } }),
    prisma.setting.findMany({ where: { key: { startsWith: HOUR_PREFIX, gt: since } } }),
    prisma.setting.findUnique({ where: { key: DIFFS_KEY } }),
  ]);
  const stores: Record<string, ProxyCounts> = {};
  for (const r of rows) {
    for (const [s, c] of Object.entries(parse<Record<string, ProxyCounts>>(r.value, {}))) {
      const into = (stores[s] ??= { normalOk: 0, fallback: 0, bothFail: 0, sampleSame: 0, sampleDiff: 0 });
      for (const [k, v] of Object.entries(c)) into[k as keyof ProxyCounts] += Number(v) || 0;
    }
  }
  const dayAgo = Date.now() - 24 * 3600_000;
  return {
    mode: isMode(modeRow?.value) ? modeRow!.value : 'auto',
    stores,
    diffs: parse<ProxyDiff[]>(diffsRow?.value, []).filter((d) => Date.parse(d.at) >= dayAgo),
  };
}
