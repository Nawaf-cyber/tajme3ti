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
import { searchStore, type SearchSource } from '../../../../lib/store-search';

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
  const source: SearchSource = body?.source === 'cazasouq' ? 'cazasouq' : 'microless';
  const category: string | null = body?.category || null;
  const limit = Math.min(Math.max(Number(body?.limit) || 15, 1), 40);

  const token = process.env.SCRAPER_API_KEY || '';
  if (source === 'cazasouq' && !token) {
    return NextResponse.json({ error: 'كازاسوق يحتاج SCRAPER_API_KEY' }, { status: 400 });
  }

  const all = await prisma.component.findMany({
    where: category ? { category: { name: category } } : {},
    include: { category: true, offers: { include: { store: true } } },
    orderBy: { price: 'desc' },
  });

  /* المرشّحات للعمل: مصدرٌ حيٌّ واحد، ولا صفَّ في المتجر المقصود */
  const need = all
    .filter((c) => liveOffers(c.offers as any).length === 1)
    .filter((c) => !c.offers.some((o) => o.store.slug === source))
    .slice(0, limit);

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
    await sleep(source === 'microless' ? 600 : 1200);
  }

  return NextResponse.json({
    source,
    scanned: results.length,
    matched: results.filter((r) => r.match).length,
    /* كازاسوق يمرّ عبر Scrape.do — يُقال للأدمن ما استُهلك */
    creditsUsed: source === 'cazasouq' ? results.length : 0,
    results,
  });
}
