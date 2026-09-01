/* ============ البحث عن مصدرٍ ثانٍ — مسار الإدارة ============
 *
 * خطوتان منفصلتان عمداً:
 *
 *   POST { action: 'search' }  → يبحث ويُعيد مقترحاتٍ **ولا يكتب شيئاً**
 *   POST { action: 'apply'  }  → يكتب ما أقرّه الأدمن وحده
 *
 * ⚠️ والفصل ليس تجميلاً. المطابق في أوّل صياغاته قَبِل `9950X3D` مكان
 * `9950X`، ولابتوباً مكان معالج، و`B650M` مكان `B650`. ولو كتب وحده لصارت
 * أسعارُ منتجاتٍ أخرى تُعرض على قطعنا — وهو العطب نفسه الذي قضينا وقتاً
 * في إصلاحه (SN580 وP3 Plus وRyzen 9600X). فالبحث آليّ، والكتابة بإقرار.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { liveOffers } from '../../../../lib/stores';
import { fingerprint, pick, type Candidate } from '../../../../lib/source-match';
import { selectTargets } from '../../../../lib/find-targets';
import { searchStore, adapterFor, sourceMeta, type SearchSource } from '../../../../lib/store-search';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === 'ADMIN' ? email : null;
}

const parseSpecs = (s: any) => {
  if (!s) return {};
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return {}; } }
  return s;
};

/* قائمة المتاجر للواجهة — مصدرها السجلّ، فلا تُكتب مرّتين */
export async function GET() {
  /* ⚠️ requireAdmin يُعيد البريد أو null — لا استجابةَ خطأ. وحارسٌ يقرأ
     قيمته على أنها الخطأ يمنع الأدمن ويسمح لغيره، بلا خطأ بناء. */
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return NextResponse.json({ sources: sourceMeta(), hasToken: !!process.env.SCRAPER_API_KEY });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  /* ---------- اعتماد ما أقرّه الأدمن ---------- */
  if (action === 'apply') {
    const picks: { componentId: string; url: string; source: SearchSource }[] = Array.isArray(body.picks) ? body.picks : [];
    if (!picks.length) return NextResponse.json({ error: 'لا شيء لاعتماده' }, { status: 400 });

    const stores = await prisma.store.findMany({ select: { id: true, slug: true } });
    const bySlug = new Map(stores.map((s) => [s.slug, s.id]));

    let added = 0;
    const skipped: string[] = [];

    for (const p of picks) {
      const storeId = bySlug.get(p.source);
      if (!storeId) { skipped.push(`متجر ${p.source} غير موجود`); continue; }

      /* رابطٌ مستعملٌ لقطعةٍ أخرى = مطابقةٌ خاطئة. لا يُكتب. */
      const taken = await prisma.componentOffer.findFirst({
        where: { url: p.url },
        select: { component: { select: { name: true } } },
      });
      if (taken) { skipped.push(`الرابط مستعمل لـ«${taken.component.name}»`); continue; }

      const dup = await prisma.componentOffer.findFirst({ where: { componentId: p.componentId, storeId } });
      if (dup) { skipped.push('للقطعة عرضٌ في هذا المتجر أصلاً'); continue; }

      /* السعر يُترك فارغاً ليقرأه الساحب من المصدر — لا يُنسخ من صفحة البحث */
      await prisma.componentOffer.create({
        data: { componentId: p.componentId, storeId, url: p.url, inStock: true },
      });
      added++;
    }
    return NextResponse.json({ added, skipped });
  }

  /* ---------- بحث ---------- */
  /* ⚠️ والمتجر يُطلب صراحةً ولا يُفترض: كانت الشرطية تُعيد «مايكرولس» لأي
     قيمةٍ غير «كازاسوق» — فخطأٌ مطبعيّ في الاسم يبحث في متجرٍ لم يُطلب،
     ويُعيد نتائج تبدو سليمةً وهي لمتجرٍ آخر. */
  const source: SearchSource = String(body?.source || '');
  const adapter = adapterFor(source);
  if (!adapter) {
    return NextResponse.json(
      { error: `متجرٌ غير معروف: «${source}»`, known: sourceMeta().map((m) => m.slug) },
      { status: 400 },
    );
  }
  const category: string | null = body?.category || null;
  const limit = Math.min(Math.max(Number(body?.limit) || 15, 1), 40);

  const token = process.env.SCRAPER_API_KEY || '';
  if (adapter.needsProxy && !token) {
    return NextResponse.json({ error: `${adapter.label} يحتاج SCRAPER_API_KEY` }, { status: 400 });
  }

  /* ============ ماذا يُفحص: مسحٌ بالفئة أم قطعٌ بعينها ============
   *
   * ⚠️ والمختارة صراحةً لا يُطبَّق عليها شرط «مصدرٌ حيٌّ واحد»: الشرط
   * حارسٌ للمسح الأعمى كي لا يُنفق الرصيد على ما لا يحتاج، لكنّ الأدمن حين
   * يسمّي قطعةً بعينها يكون قد حكم. وقطعةٌ بمصدرين قد يُراد لها ثالث.
   *
   * ⚠️ ويبقى شرطٌ واحد: ألّا يكون عندها عرضٌ في المتجر المقصود — ذلك بحثٌ
   * نتيجته معروفةٌ سلفاً، وثمنه طلبٌ من الوسيط.
   */
  const ids: string[] = Array.isArray(body?.componentIds)
    ? body.componentIds.filter((x: any) => typeof x === 'string').slice(0, 40)
    : [];

  const all = await prisma.component.findMany({
    where: ids.length ? { id: { in: ids } } : category ? { category: { name: category } } : {},
    include: { category: true, offers: { include: { store: true } } },
    orderBy: { price: 'desc' },
  });

  const { targets, skipped: skippedPicks } = selectTargets(
    all.map((c) => ({
      ...c,
      storeSlugs: c.offers.map((o) => o.store.slug),
      liveCount: liveOffers(c.offers as any).length,
    })),
    { source, sourceLabel: adapter.label, explicitIds: ids, limit: ids.length ? 40 : limit },
  );
  const need = targets;

  const results: any[] = [];
  for (const c of need) {
    const fp = fingerprint(c.brand, c.name, parseSpecs(c.specs));
    let cands: Candidate[] = [];
    try { cands = await searchStore(source, fp.query, token); } catch { cands = []; }
    const { hit, nearest } = pick(fp, cands);

    results.push({
      componentId: c.id,
      part: `${c.brand} ${c.name}`,
      category: c.category.name,
      currentPrice: c.price,
      currentStore: (liveOffers(c.offers as any)[0] as any)?.store?.name ?? null,
      query: fp.query,
      candidateCount: cands.length,
      match: hit ? { title: hit.title, url: hit.url, price: hit.price ?? null } : null,
      nearest: hit ? null : nearest,
    });

    /* فاصلٌ بين الطلبات: لا نُغرق متجراً يستضيفنا، ولا نستدعي 429 */
    await sleep(adapter.delayMs);
  }

  return NextResponse.json({
    source,
    scanned: results.length,
    matched: results.filter((r) => r.match).length,
    /* ما استُبعد من المختار وسببه — الصمت هنا يبدو عطلاً */
    skippedPicks,
    /* ما يمرّ عبر Scrape.do يكلّف طلباً لكل بحث — يُقال للأدمن ما استُهلك */
    creditsUsed: adapter.needsProxy ? results.length : 0,
    results,
  });
}
