/* ============ كاتب الأوصاف — مسار الإدارة ============
 *
 * خطوتان منفصلتان، كـ«مصدر ثانٍ» وللسبب نفسه:
 *
 *   POST { action: 'draft' } → ينادي النموذج ويُعيد مسوّداتٍ **ولا يكتب**
 *   POST { action: 'apply' } → يكتب ما أقرّه الأدمن وحده
 *
 * ⚠️ والفصل هنا آكد: النموذج يكتب نصّاً واثقاً عن بياناتٍ خاطئة بلا أن
 * يشكّ. وشهودُ هذا المشروع كثيرة — عرضا tray يَعِدان بمبرّدٍ لا يصل،
 * وطقمُ ذاكرةٍ بسعر منتجٍ آخر، وحقلُ الرسوميّات غائبٌ في ٤٠ قطعةً من ٤٦.
 * فما لم يجتز الحرّاس لا يُعرض للاعتماد أصلاً.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { liveOffers } from '../../../../lib/stores';
import { draftDescription, costUsd, DESCRIBE_MODEL, type PeerInput } from '../../../../lib/describe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * كم قطعةً في الطلب الواحد.
 *
 * ⚠️ مقيسٌ لا مقدَّر — ونفس درس «مصدر ثانٍ»: نداءُ النموذج مع التفكير
 * يأخذ ثوانيَ لا أجزاءها، والمسار سقفُه ستّون. فطلبٌ يتجاوز السقف يموت
 * في منتصفه، **ويُحسب ما استُهلك ولا يعود للأدمن سطرٌ واحد**.
 */
const PER_ITEM_MS = 25000;
export const MAX_PER_RUN = Math.max(1, Math.floor((maxDuration * 1000 * 6) / 7 / PER_ITEM_MS));

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

/** حالة الكتالوج — كم ينقصه وصفاً، ومقسّمةً بالفئة */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  /* ⚠️ `all=1` يُدرج الموصوفة أيضاً — لإعادة كتابة وصفٍ ضعيف، ولتجربة
     الكاتب حين لا ينقص شيء. والمُعاد كتابته يُعلَّم `described` كي لا
     يُستبدل نصٌّ كتبه إنسان بلا أن يُرى أنّه كان موجوداً. */
  const includeAll = new URL(req.url).searchParams.get('all') === '1';

  const all = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, description: true, price: true, category: { select: { name: true } } },
    orderBy: { price: 'desc' },
  });
  const missing = all.filter((c) => !String(c.description ?? '').trim());
  const listed = includeAll ? all : missing;
  const byCat: Record<string, number> = {};
  for (const c of missing) byCat[c.category.name] = (byCat[c.category.name] || 0) + 1;

  return NextResponse.json({
    model: DESCRIBE_MODEL,
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    maxPerRun: MAX_PER_RUN,
    total: all.length,
    missing: missing.length,
    byCategory: byCat,
    items: listed.slice(0, 80).map((c) => ({
      id: c.id, part: `${c.brand} ${c.name}`, category: c.category.name, price: c.price,
      described: !!String(c.description ?? '').trim(),
    })),
  });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  /* ---------- اعتماد ما أقرّه الأدمن ---------- */
  if (body?.action === 'apply') {
    const picks: { componentId: string; description: string }[] = Array.isArray(body.picks) ? body.picks : [];
    if (!picks.length) return NextResponse.json({ error: 'لا شيء لاعتماده' }, { status: 400 });

    let added = 0;
    const skipped: string[] = [];
    for (const p of picks) {
      const text = String(p.description ?? '').trim();
      /* ⚠️ ولا يُكتب فارغاً: وصفٌ فارغ يمرّ صامتاً ويظهر كأنّ القطعة نُسيت */
      if (text.length < 400) { skipped.push('مسوّدةٌ قصيرة — لم تُكتب'); continue; }
      await prisma.component.update({ where: { id: p.componentId }, data: { description: text } });
      added++;
    }
    return NextResponse.json({ added, skipped });
  }

  /* ---------- توليد مسوّدات ---------- */
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'لا ANTHROPIC_API_KEY في البيئة' }, { status: 400 });
  }

  const ids: string[] = Array.isArray(body?.componentIds)
    ? body.componentIds.filter((x: any) => typeof x === 'string')
    : [];
  if (!ids.length) return NextResponse.json({ error: 'لم تختر قطعاً' }, { status: 400 });

  const asked = ids.length;
  const take = ids.slice(0, MAX_PER_RUN);

  const all = await prisma.component.findMany({
    include: { category: true, offers: { include: { store: true } } },
  });
  const byId = new Map(all.map((c) => [c.id, c]));

  const results: any[] = [];
  let spent = 0;

  for (const id of take) {
    const c = byId.get(id);
    if (!c) { results.push({ componentId: id, part: id, error: 'قطعةٌ غير موجودة' }); continue; }

    /* بدائل من نفس الفئة وأقربُها سعراً — قائمةٌ كاملة تُغرق الطلب */
    const peers: PeerInput[] = all
      .filter((p) => p.categoryId === c.categoryId && p.id !== c.id && liveOffers(p.offers as any).length > 0)
      .sort((a, b) => Math.abs(a.price - c.price) - Math.abs(b.price - c.price))
      .slice(0, 12)
      .map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, specs: parseSpecs(p.specs) }));

    try {
      const d = await draftDescription({
        id: c.id, brand: c.brand, name: c.name, category: c.category.name,
        price: c.price, tdpWattage: c.tdpWattage, specs: parseSpecs(c.specs),
        stores: liveOffers(c.offers as any).map((o: any) => o.store.name),
      }, peers);
      spent += costUsd(d.usage);
      results.push({
        componentId: c.id,
        part: `${c.brand} ${c.name}`,
        category: c.category.name,
        description: d.description,
        problems: d.problems,
        cost: Number(costUsd(d.usage).toFixed(4)),
      });
    } catch (e: any) {
      results.push({ componentId: c.id, part: `${c.brand} ${c.name}`, error: String(e?.message || e).slice(0, 140) });
    }
  }

  return NextResponse.json({
    model: DESCRIBE_MODEL,
    drafted: results.filter((r) => r.description).length,
    /* ما قُصّ لضيق النافذة — يُقال لا يُبتلع */
    overflow: Math.max(0, asked - take.length),
    maxPerRun: MAX_PER_RUN,
    costUsd: Number(spent.toFixed(4)),
    costSar: Number((spent * 3.75).toFixed(2)),
    results,
  });
}
