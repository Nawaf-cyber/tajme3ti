/* ============ إنذار «متجرٌ انكسر» — في التشغيلة نفسها ============
 *
 * ⚠️ لماذا: حين غيّر كازاسوق موقعه (~2026-10-25) قرأ الساحبُ عروضه الـ٢٥٤ كلّها «نافدة» بلا خطأٍ واحد،
 * فعاش العطل يومين حتى لاحظه نوّاف بنفسه. والنظام كان يرى في كلّ ساعةٍ متجراً كاملاً ينقلب نافداً
 * دفعةً واحدة — وهو ما لا يحدث في السوق: النفاد يأتي قطعةً قطعة.
 *
 * فيُعدّ لكلّ متجرٍ في التشغيلة: كم عرضاً فُحص، وكم كان متوفّراً قبلها فصار نافداً، وكم فشل.
 * وينذر (ديسكورد، للأدمن) حين:
 *   · انقلب نافداً ٦٠٪ فأكثر ممّا كان متوفّراً — ومنه ٥ عروضٍ على الأقلّ (أقلّ من ذلك صدفة)، أو
 *   · فشل ٨٠٪ فأكثر ممّا فُحص — ومنه ٨ على الأقلّ (عطلٌ معلَن: حجبٌ أو بنيةٌ تغيّرت).
 * ومرّةً لكلّ متجرٍ كلّ ٦ ساعات (مفتاح `alarm.store.<slug>` في Setting) — العطل يدوم ساعات، والإنذار
 * كلّ ساعةٍ ضجيجٌ يُتجاهل.
 * ⚠️ ينذر ولا يوقف: الإيقاف قرار الأدمن (scrapeMode في اللوحة) — والكتابة تمّت قطعةً قطعة قبل أن
 * تُعرف النسبة، فالضرر الأقصى قبل الإنذار تشغيلةٌ واحدة لا يومان.
 */
import type { PrismaClient } from '@prisma/client';

type Tally = { checked: number; wasIn: number; wentOut: number; failed: number; sample: string[] };
export type StoreRunTally = Record<string, Tally>;

export const OUT_RATE = 0.6, OUT_MIN = 5;
export const FAIL_RATE = 0.8, FAIL_MIN = 8;
const QUIET_MS = 6 * 3600_000;

/** يُستدعى لكلّ قطعةٍ بعد حلّ أسعارها، وقبل الكتابة أو بعدها سواء */
export function tallyStoreRun(
  tally: StoreRunTally,
  name: string,
  prev: { id: string; inStock: boolean }[],
  results: { offerId: string; storeSlug: string; outcome: { errors: string[]; skipped?: boolean } }[],
  updates: { offerId: string; data: Record<string, any> }[],
) {
  for (const r of results) {
    if (r.outcome.skipped) continue;
    const t = (tally[r.storeSlug] ??= { checked: 0, wasIn: 0, wentOut: 0, failed: 0, sample: [] });
    t.checked++;
    if (r.outcome.errors.length) t.failed++;
    const was = prev.find((o) => o.id === r.offerId)?.inStock;
    if (was) {
      t.wasIn++;
      if (updates.find((u) => u.offerId === r.offerId)?.data.inStock === false) {
        t.wentOut++;
        if (t.sample.length < 3) t.sample.push(name);
      }
    }
  }
}

export function storeAlarms(tally: StoreRunTally): { store: string; text: string }[] {
  const out: { store: string; text: string }[] = [];
  for (const [store, t] of Object.entries(tally)) {
    if (t.wentOut >= OUT_MIN && t.wentOut / t.wasIn >= OUT_RATE) {
      out.push({ store, text: `**${store}**: ${t.wentOut} من ${t.wasIn} عرضاً متوفّراً انقلبت نافدةً في تشغيلةٍ واحدة (مثل: ${t.sample.join('، ')}). النفاد لا يأتي هكذا — غالباً تغيّرت صفحات المتجر.` });
    } else if (t.failed >= FAIL_MIN && t.failed / t.checked >= FAIL_RATE) {
      out.push({ store, text: `**${store}**: فشلت قراءة ${t.failed} من ${t.checked} عرضاً في التشغيلة — حجبٌ أو تغيّرٌ في بنية الموقع.` });
    }
  }
  return out;
}

/** ينذر في ديسكورد، مرّةً لكلّ متجرٍ كلّ ٦ ساعات. الفشل هنا لا يُفشل التشغيلة */
export async function alertStoreHealth(prisma: PrismaClient, tally: StoreRunTally): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  const alarms = storeAlarms(tally);
  if (!url || !alarms.length) return;
  try {
    const now = Date.now();
    const due: typeof alarms = [];
    for (const a of alarms) {
      const key = `alarm.store.${a.store}`;
      const last = await prisma.setting.findUnique({ where: { key } });
      if (last && now - Date.parse(last.value) < QUIET_MS) continue;
      await prisma.setting.upsert({ where: { key }, update: { value: new Date(now).toISOString() }, create: { key, value: new Date(now).toISOString() } });
      due.push(a);
    }
    if (!due.length) return;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🚨 متجرٌ يبدو أنّه انكسر في السحب',
          description: due.map((a) => a.text).join('\n\n') + '\n\nراجِع صفحاته، وأوقف سحبه من اللوحة إن لزم (scrapeMode).',
          color: 15548997,
          timestamp: new Date(now).toISOString(),
        }],
      }),
    });
    if (!res.ok) console.error('[store-health] ديسكورد ردّ', res.status);
  } catch (e) {
    console.error('[store-health] تعذّر الإنذار', e);
  }
}
