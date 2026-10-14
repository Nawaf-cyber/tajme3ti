/**
 * ============ تحديث أسعار نون تلقائياً — من جهاز نوّاف ============
 *
 *   npx tsx scripts/noon-auto-refresh.ts           # قراءة وعرضٌ فقط
 *   npx tsx scripts/noon-auto-refresh.ts --apply   # قراءة وكتابة في القاعدة
 *
 * لماذا من جهازٍ لا من الخادم: نون خلف Akamai — الطلب المجرّد 403، وخدمة
 * السحب تُحجب مرّةً وتنجح أخرى، والمتصفّح بلا واجهة (headless) يُعطى صفحة
 * تحدٍّ فارغة. أمّا **نافذة كروم عاديّة** من عنوانٍ منزليّ فتُفتح كاملةً وفيها
 * JSON-LD بالسعر والتوفّر — قيس 2026-10-13: ٣ من ٣ صحيحة في ~٢٢ ثانية،
 * والطريقتان الأخريان صفر. ولا متصفّح على فيرسل، فالجهاز هو المكان.
 *
 * كيف: يشغّل كروم بملفّ تعريفٍ خاصّ ونافذةٍ خارج الشاشة، ويقوده عبر بروتوكول
 * التصحيح (WebSocket المدمج في Node — بلا حزم)، ويفتح كلّ عرض نون ويقرأ
 * JSON-LD، ثمّ يكتب كما يكتب scripts/noon-refresh.ts: السعر والتوفّر ووقت
 * الفحص (حتى للمطابق)، وتاريخ السعر، ويعيد حساب السعر المعروض.
 * وما لم يُقرأ لا يُلمس: وقت فحصه القديم يبقى، فتحميه شبكة الأمان في
 * lib/stores.ts (السعر اليدويّ الأقدم من ٣ أيّام لا يُحسب أقلّ سعر).
 *
 * يشغّله «مجدول مهامّ ويندوز» مرّتين يومياً (scripts/noon-auto-task.cmd).
 * السجلّ: %LOCALAPPDATA%\tajme3ti\noon-auto.log
 */
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, appendFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../lib/prisma';
import { cheapestOffer } from '../lib/stores';
import { recordPriceHistory, round2 } from '../lib/scrape-prices';

const apply = process.argv.includes('--apply');
const HOME = join(process.env.LOCALAPPDATA || process.cwd(), 'tajme3ti');
const LOG = join(HOME, 'noon-auto.log');
const LOCK = join(HOME, 'noon-auto.lock');
const PORT = 9341;
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));

mkdirSync(HOME, { recursive: true });
const log = (s: string) => {
  const line = `[${new Date().toISOString()}] ${s}`;
  console.log(line);
  appendFileSync(LOG, line + '\n');
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* قفل: تشغيلان متزامنان (مهمّة متأخّرة + يدويّ) يفتحان كرومين على المنفذ نفسه.
   والقفل الأقدم من ساعة بقايا تشغيلٍ انقطع — يُتجاهل. */
if (existsSync(LOCK) && Date.now() - Number(readFileSync(LOCK, 'utf8')) < 3600_000) {
  log('⏭ تشغيلٌ آخر جارٍ — خروج');
  process.exit(0);
}
writeFileSync(LOCK, String(Date.now()));

const READ = `(() => {
  const b = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => { try { return JSON.parse(s.textContent) } catch { return null } })
    .filter(Boolean).flatMap((j) => j['@graph'] ?? (Array.isArray(j) ? j : [j]));
  const p = b.find((x) => String(x?.['@type']).includes('Product'));
  const o = Array.isArray(p?.offers) ? p.offers[0] : p?.offers;
  return {
    denied: /Access Denied|edgesuite/i.test((document.body?.innerText || '').slice(0, 3000)),
    price: o ? Number(o.price) : null,
    avail: o ? String(o.availability).split('/').pop() : null,
  };
})()`;

async function main() {
  if (!CHROME) throw new Error('لم أجد كروم — ضع مساره في CHROME_PATH');
  const noon = await prisma.store.findFirst({ where: { slug: 'noon' }, select: { id: true } });
  if (!noon) throw new Error('لا متجر نون');
  const offers = await prisma.componentOffer.findMany({
    where: { storeId: noon.id, url: { not: null } },
    select: { id: true, url: true, price: true, inStock: true, componentId: true, component: { select: { name: true } } },
  });
  log(`▶ ${offers.length} عرضاً من نون${apply ? '' : ' (عرضٌ فقط)'}`);

  /* نافذةٌ عاديّة لا headless (نون يحجبه)، خارج الشاشة كي لا تزعج */
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(HOME, 'chrome-profile')}`,
    '--window-position=-10000,0', '--window-size=1280,800',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank',
  ], { stdio: 'ignore' });

  try {
    let page: { webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 150 && !page; i++) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        page = list.find((t: { type: string }) => t.type === 'page');
      } catch { await sleep(200); }
    }
    if (!page) throw new Error('كروم لم يبدأ');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map<number, (m: any) => void>();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(String(e.data));
      if (m.id && pending.has(m.id)) { pending.get(m.id)!(m); pending.delete(m.id); }
    });
    const send = (method: string, params = {}) =>
      new Promise<any>((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const evaluate = async (expression: string) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true });
      return r.result?.exceptionDetails ? null : r.result?.result?.value;
    };
    await send('Page.enable');

    const touched = new Set<string>();
    let ok = 0, changed = 0, failed = 0, denied = 0, deniedRun = 0;
    for (const o of offers) {
      /* نون يحجب التصفّح الكثيف قرابة ساعة ثمّ يرفع (قيس 2026-10-13: التشغيل الثالث
         في أقلّ من ساعة حُجب بعد ١٣ صفحة). فحجبان متتاليان = نتوقّف فوراً ولا نطرق
         الباب فنطيل الحجب؛ والباقي للموعد التالي، وشبكة الأمان تحمي ما يشيخ. */
      if (deniedRun >= 2) {
        log(`  ⏸ نون يحجب الآن — توقّف، والباقي (${offers.length - ok - failed - denied}) في الموعد التالي`);
        break;
      }
      await send('Page.navigate', { url: o.url });
      let r: { denied: boolean; price: number | null; avail: string | null } | null = null;
      for (let i = 0; i < 25; i++) {
        await sleep(1000);
        const v = await evaluate(READ);
        if (v && typeof v === 'object' && (v.price !== null || v.denied)) { r = v; break; }
      }
      const name = o.component.name;
      if (!r || r.denied) {
        if (r?.denied) { denied++; deniedRun++; } else failed++;
        log(`  ✗ ${name}: ${r?.denied ? 'محجوب' : 'لم تُقرأ الصفحة'} — لم يُلمس`);
        if (apply) await prisma.componentOffer.update({ where: { id: o.id }, data: { lastError: r?.denied ? 'noon-auto: محجوب' : 'noon-auto: لم تُقرأ' } });
        await sleep(3000);
        continue;
      }
      ok++;
      deniedRun = 0;
      /* price: 0 مع OutOfStock = نافد، لا سعر صفر. والنافد يحتفظ بآخر سعرٍ عُرف ولا يُعرض */
      const inStock = r.avail === 'InStock' && (r.price ?? 0) > 0;
      const nextPrice = inStock ? round2(r.price!) : o.price;
      const same = o.inStock === inStock && o.price === nextPrice;
      const was = `${o.price ?? '—'}${o.inStock ? '' : ' نافد'}`;
      const jump = inStock && o.price && (nextPrice! > o.price * 1.5 || nextPrice! < o.price * 0.6) ? '  ⚠️ قفزة كبيرة' : '';
      if (!same) changed++;
      log(same ? `  ✓ ${name} — كما هو (${was})` : `  ${apply ? '✔' : '·'} ${name}: ${was} → ${inStock ? nextPrice : 'نافد'}${jump}`);
      if (apply) {
        await prisma.componentOffer.update({
          where: { id: o.id },
          data: { price: nextPrice, inStock, lastCheckedAt: new Date(), lastError: null },
        });
        if (inStock) await recordPriceHistory(prisma, o.componentId, [{ store: 'noon', price: nextPrice! }]);
        touched.add(o.componentId);
      }
      await sleep(5000 + Math.random() * 3000); // تمهّل (٥–٨ث) — كي لا يرانا نون موجةَ طلبات
    }
    ws.close();

    /* السعر المعروض يُشتقّ من العروض — يُعاد لكلّ قطعةٍ لُمست */
    for (const cid of touched) {
      const c = await prisma.component.findUnique({ where: { id: cid }, include: { offers: { include: { store: true } } } });
      if (!c) continue;
      const best = cheapestOffer(c.offers as any);
      const next = best ? round2(best.price!) : c.price;
      if (next !== c.price) {
        await prisma.component.update({ where: { id: cid }, data: { price: next } });
        log(`    ↳ ${c.name}: السعر المعروض ${c.price} → ${next} (${best?.store.slug ?? '—'})`);
      }
    }
    log(`■ قُرئ ${ok} · تغيّر ${changed} · محجوب ${denied} · فشل ${failed}${apply ? '' : ' (لم يُكتب شيء)'}`);
  } finally {
    chrome.kill();
  }
}

main()
  .catch((e) => { log(`⛔ ${e?.message || e}`); process.exitCode = 1; })
  .finally(async () => {
    try { rmSync(LOCK); } catch {}
    await prisma.$disconnect();
  });
