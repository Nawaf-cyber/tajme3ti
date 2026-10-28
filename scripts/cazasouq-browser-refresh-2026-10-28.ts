/**
 * ============ كازاسوق: قراءةٌ من المتصفّح بعد تغيير موقعهم — 2026-10-28 ============
 *
 * موقعهم الجديد (2026-10-25 تقريباً) واجهة جافاسكربت: الـHTML الخام فارغ، فحكم القارئ الآليّ على
 * العروض الـ٢٥٤ كلّها «نافد» بلا خطأ (scripts/pause-cazasouq-2026-10-28 يشرح ويوقفه). ولا يُستعاد
 * «آخر توفّرٍ صحيح» من سجلّ الأسعار: السجلّ يكتب السعر متى قُرئ، نافداً كان أو متوفّراً.
 *
 * فقُرئت صفحاتهم نفسها في لوحة المتصفّح (إطارٌ مخفيّ من نفس الموقع، صفحتان في كلّ مرّة):
 *   السعر  — أوّل `.price` في كتلة المنتج (حول عنوانها h1)، «SR 2744.59» بالريال كما يعرضونه.
 *   التوفّر — «نفذ من المخزون» نافد، و«متوفر» أو زرّ «أضف إلى السلة» متوفّر، وغيرهما لا يُكتب.
 *   الخصم  — سعرٌ مشطوب (del/s/line-through) في الكتلة إن وُجد.
 * والنتيجة ملفّ JSON: [offerId, status, stock, priceTxt, oldTxt, finalUrl].
 *
 * والكتابة بـ lib/manual-readings (منطق الكرون: وقت الفحص، وتاريخ السعر، والسعر المعروض)، وقفزةٌ
 * فوق ٤٠٪ عن المحفوظ تُعاد للمراجعة لا تُكتب.
 *
 *   npx tsx scripts/cazasouq-browser-refresh-2026-10-28.ts <readings.json>           # عرض
 *   npx tsx scripts/cazasouq-browser-refresh-2026-10-28.ts <readings.json> --apply   # تنفيذ
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { applyStoreReadings, type StoreReading } from '../lib/manual-readings';

type Row = [offerId: string, status: string, stock: string | null, priceTxt: string | null, oldTxt: string | null, finalUrl: string | null, pageName?: string | null];

/* ============ هل الصفحة صفحةُ قطعتنا؟ ============
   الرابط القديم يُحوَّل إلى الجديد، والتحويل منهم لا منّا: «samsung-980-1tb» صار يفتح «980 Pro».
   فكلّ رمزٍ فيه رقمٌ من اسم قطعتنا يجب أن يظهر في اسم صفحتهم، وكلمات النسخة (PRO وMAX وTi…)
   يجب أن تتّفق في الجهتين. وما لا يتّفق يُعاد للمراجعة ولا يُكتب. */
const VARIANT = ['PRO', 'MAX', 'TI', 'XTX', 'XT', 'SUPER', 'X3D', 'PLUS', 'WIFI', 'WHITE', 'EVO'];
const U = (s: string) => s.toUpperCase();
const alnum = (s: string) => U(s).replace(/[^A-Z0-9]/g, '');
/* وأسماؤهم بالعربيّة أحياناً («مبرد … LE240 V2 – أبيض»): اللون بالعربيّة يُعدّ */
const AR: Record<string, RegExp> = { WHITE: /أبيض|ابيض|بيضاء/ };
const hasWord = (s: string, w: string) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`).test(U(s)) || !!AR[w]?.test(s);
/* كتاباتٌ مختلفة للشيء نفسه، رصدها العرض الأوّل (2026-10-28) — لا تُعدّ اختلافاً:
   «1 تيرابايت» = 1TB، «850 واط» = 850W، «2×8» = 2X8، «5200 MT/s» = 5200MHz، و«WF7» عند جيجابايت = WiFi7،
   و«80 Plus Gold» تصنيف كفاءة لا كلمة النسخة PLUS. */
const normalize = (s: string) => s
  .replace(/(\d+)\s*تيرابايت/g, '$1TB').replace(/(\d+)\s*جيجابايت/g, '$1GB').replace(/(\d+)\s*واط/g, '$1W')
  .replace(/×/g, 'x').replace(/(\d+)\s*MT\/s/gi, '$1MHz').replace(/\bWF(\d)\b/gi, 'WiFi$1')
  .replace(/80\s*PLUS/gi, ' ');

/* قُبلت بعد مراجعةٍ بالعين — اسم صفحتهم يختلف وهي قطعتنا:
   صفّ «GeForce RTX 5080 16GB» العامّ ↔ Palit «GamingPro» (اسم خطّ إنتاج Palit لا كلمة النسخة PRO). */
const ACCEPT = new Set(['cmsgekisi00bipsymfiyu0imk']);
/* رمزٌ بوحدةٍ («2X8GB»، «5200MHZ») يُقبل بلا وحدته إن بقي منه ٣ محارف — وإلّا («1TB» → «1») يبقى صارماً.
   و«GEN5»/«PCIE5» وصفٌ لا طراز. */
const tokenFound = (k: string, t: string) => {
  if (t.includes(k)) return true;
  const bare = k.replace(/(GB|MHZ|MT|W|TB)$/, '');
  return bare !== k && bare.length >= 3 && t.includes(bare);
};
function nameMismatch(ours: string, theirs: string): string | null {
  const th = normalize(theirs);
  const t = alnum(th);
  const missing = (U(normalize(ours)).match(/[A-Z0-9]+/g) || [])
    .filter((k) => /\d/.test(k) && !/^(GEN|PCIE)\d*$/.test(k) && !tokenFound(k, t));
  if (missing.length) return `رموز ناقصة: ${missing.join(' ')}`;
  /* ⚠️ اللون في اتّجاهٍ واحد: صفّ الشريحة العامّ («RTX 5060 Ti 8GB») يحمل عروض نسخ الشركاء
     بكلّ ألوانها، فنسخةٌ بيضاء عندهم ليست خطأً. أمّا قطعتنا «White» فلا تقابل صفحةً بلا أبيض. */
  const diff = VARIANT.filter((w) => (w === 'WHITE' ? hasWord(ours, w) && !hasWord(th, w) : hasWord(ours, w) !== hasWord(th, w)));
  return diff.length ? `نسخة مختلفة: ${diff.join(' ')}` : null;
}

const sr = (t: string | null): number | null => {
  const m = String(t ?? '').match(/SR\s?([\d,]+(?:\.\d+)?)/);
  const n = m ? parseFloat(m[1].replace(/,/g, '')) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

(async () => {
  const file = process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!file) throw new Error('مسار ملفّ القراءات مطلوب');
  const rows: Row[] = JSON.parse(readFileSync(file, 'utf8'));

  const names = new Map((await prisma.componentOffer.findMany({
    where: { id: { in: rows.map((r) => r[0]) } },
    select: { id: true, component: { select: { brand: true, name: true } } },
  })).map((o) => [o.id, o.component.name]));

  const readings: StoreReading[] = [];
  const skipped: string[] = [];
  const review: string[] = [];
  for (const [id, status, stock, priceTxt, oldTxt, finalUrl, pageName] of rows) {
    if (status !== 'ok' || (stock !== 'in' && stock !== 'out')) { skipped.push(`${id} (${status}/${stock})`); continue; }
    const ours = names.get(id);
    const why = ACCEPT.has(id) ? null : ours && pageName ? nameMismatch(ours, pageName) : 'بلا اسم للمقارنة';
    if (why) { review.push(`«${ours}» ↔ «${pageName}» — ${why} · ${finalUrl}`); continue; }
    const price = sr(priceTxt);
    const old = sr(oldTxt);
    if (stock === 'in' && price == null) { skipped.push(`${id} (متوفّر بلا سعر)`); continue; }
    readings.push({ offerId: id, price, listPrice: old && price && old > price ? old : null, inStock: stock === 'in' });
  }

  if (apply) {
    const st = await prisma.store.findFirst({ where: { slug: 'cazasouq' }, select: { id: true } });
    const ids = readings.map((r) => r.offerId);
    const before = await prisma.componentOffer.findMany({ where: { id: { in: ids }, storeId: st!.id } });
    const comps = await prisma.component.findMany({ where: { id: { in: [...new Set(before.map((o) => o.componentId))] } }, select: { id: true, name: true, price: true } });
    writeFileSync(`backups/cazasouq-browser-refresh-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`, JSON.stringify({ offers: before, components: comps }, null, 2));
  }

  const res = await applyStoreReadings(prisma, 'cazasouq', readings, { apply });
  console.log(`قراءات: ${rows.length} · صالحة ${readings.length} (متوفّر ${readings.filter((r) => r.inStock).length} · نافد ${readings.filter((r) => !r.inStock).length}) · تُركت ${skipped.length}`);
  console.log(`تتغيّر ${res.changed.length} · كما هي ${res.same} · للمراجعة (قفزة >٤٠٪) ${res.held.length} · لا عرض ${res.missing.length}`);
  for (const h of res.held) console.log(`  ⚠ ${h.name}: محفوظ ${h.old} ← مقروء ${h.read}`);
  for (const s of skipped) console.log(`  · تُرك ${s}`);
  console.log(`للمراجعة (الصفحة قد لا تكون قطعتنا): ${review.length}`);
  for (const r of review) console.log(`  ? ${r}`);
  for (const c of res.changed.slice(0, 12)) console.log(`  ${apply ? '✔' : '·'} ${c.name}: ${c.from} → ${c.to}`);
  if (res.changed.length > 12) console.log(`  … و${res.changed.length - 12} غيرها`);
  for (const p of res.repriced) console.log(`    ↳ ${p.name}: المعروض ${p.from} → ${p.to} (${p.store})`);
  if (!apply) console.log('\n(عرضٌ فقط — أضف --apply)');
  else console.log(`\nنُفّذ · أُعيد حساب السعر المعروض لـ${res.repriced.length} قطعة (نسخةٌ في backups/)`);
  await prisma.$disconnect();
})();
