/**
 * ============ PNY RTX 5070 12GB ARGB OC Triple Fan: رابط كازاسوق لنسخة 5070 Ti — 2026-10-15 ============
 *
 * ظهر أثناء تجهيز جدول أسعار الكروت: عرض كازاسوق على هذه القطعة رابطُه
 *   …/pny-geforce-rtx-5070-ti-16gb-gddr7-argb-epic-x-rgb-triple-fan-gpu-41921  ← RTX **5070 Ti** 16GB
 * فسُجّل لها سعر 5070 Ti (3950) ثلاثة أيّام. والنسخة الصحيحة في كازاسوق (بحث «PNY 5070» في المتصفّح):
 *   …/pny-geforce-rtx-5070-oc-argb-epic-x-12gb-triple-fan-gpu-38794  ← «RTX 5070 OC ARGB EPIC-X 12GB Triple Fan»
 * والمطابقة بالرمز لا بالاسم: باركود كازاسوق 4718006457358 يقترن في قوائم الأسعار بـ UPC 751492794440 —
 * وهو نفسه في صفحة أمازون المربوطة بالقطعة (B0DYPGBX6J، طراز VCG507012TFXXPB1-O).
 *
 * يُصحَّح الرابط ويُفرَّغ السعر القديم (كان لـ 5070 Ti) فيملؤه الكرون التالي بمنطقه المعتاد.
 * وقبل الكتابة يُقرأ الرابط الجديد بساحب كازاسوق نفسه (lib/scrape-prices) — قراءةً لا كتابة.
 * و--drop-history يحذف قراءات سعر كازاسوق الخاطئة على القطعة (حذفٌ بإذن نوّاف).
 *
 *   npx tsx scripts/fix-pny-5070-cazasouq-2026-10-15.ts                  # عرض + قراءة تجريبيّة
 *   npx tsx scripts/fix-pny-5070-cazasouq-2026-10-15.ts --apply          # تصحيح الرابط
 *   npx tsx scripts/fix-pny-5070-cazasouq-2026-10-15.ts --apply --drop-history
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { scrapeCazasouq, setScrapeDeadline } from '../lib/scrape-prices';

const apply = process.argv.includes('--apply');
const dropHistory = process.argv.includes('--drop-history');
const COMPONENT = 'cmv39sjz10000ykymmqn7ms70';
const OFFER = 'cmv3afd39000006kzxbkfqk6q';
const WRONG = 'rtx-5070-ti-16gb-gddr7-argb-epic-x-rgb-triple-fan-gpu-41921';
const RIGHT_URL = 'https://www.cazasouq.com/pny-geforce-rtx-5070-oc-argb-epic-x-12gb-triple-fan-gpu-38794';

async function main() {
  const c = await prisma.component.findUnique({ where: { id: COMPONENT }, select: { name: true, brand: true } });
  const o = await prisma.componentOffer.findUnique({ where: { id: OFFER }, select: { id: true, url: true, price: true, inStock: true, componentId: true } });
  if (!c || !o || o.componentId !== COMPONENT) throw new Error('القطعة أو العرض غير موجود');
  /* الخاطئ وحده: ما سُجّل قبل التصحيح (2026-10-15 13:50 UTC) بسعر 5070 Ti.
     ⚠️ كان الشرط «كلّ قراءات كازاسوق» فحذف تشغيلُه في 10-17 قراءتين صحيحتين (3400) سجّلهما
     الكرون بعد التصحيح — أُعيدتا من النسخة الاحتياطيّة. */
  const hist = await prisma.priceHistory.findMany({ where: { componentId: COMPONENT, store: 'cazasouq', price: 3950, recordedAt: { lt: new Date('2026-10-15T13:50:00Z') } } });

  const fixed = o.url === RIGHT_URL;
  if (!fixed && !o.url?.includes(WRONG)) throw new Error(`تغيّر رابط العرض: ${o.url}`);
  console.log(`${c.brand} ${c.name}`);
  console.log(fixed ? '  الرابط مُصحَّحٌ سابقاً' : `  كازاسوق: …${WRONG} (${o.price ?? '—'}، ${o.inStock ? 'متوفّر' : 'نافد'})\n        ← ${RIGHT_URL}`);
  console.log(`  قراءات سعر كازاسوق المسجّلة على القطعة: ${hist.length}${hist.length ? ` (${[...new Set(hist.map((h) => h.price))].join('، ')})` : ''}${dropHistory ? ' ← تُحذف' : ''}`);

  /* قراءة تجريبيّة بالساحب نفسه — لا كتابة */
  const token = process.env.SCRAPER_API_KEY;
  if (token) {
    setScrapeDeadline(40000);
    const r = await scrapeCazasouq({ name: c.name, url: RIGHT_URL, price: null, inStock: null }, token);
    console.log(`  قراءة الرابط الجديد: سعر ${r.price ?? '—'} · ${r.inStock ? 'متوفّر' : 'نافد'}${r.errors.length ? ` · ${r.errors.join('؛ ')}` : ''}`);
  }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); return; }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/fix-pny-5070-cazasouq-${stamp}.json`, JSON.stringify({ offer: o, hist }, null, 2));
  if (!fixed) await prisma.componentOffer.update({ where: { id: OFFER }, data: { url: RIGHT_URL, price: null, inStock: false, lastError: null } });
  if (dropHistory && hist.length) await prisma.priceHistory.deleteMany({ where: { id: { in: hist.map((h) => h.id) } } });
  console.log(`\n✔ نُفّذ — النسخة في backups/fix-pny-5070-cazasouq-${stamp}.json`);
}

main().catch((e) => { console.error('⛔', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
