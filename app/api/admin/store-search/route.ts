/* ============ بحثٌ حرٌّ في المتاجر — للإدارة ============
 *
 * الفرق عن «مصدر ثانٍ» ليس في المحرّك بل في السؤال:
 *
 *   «مصدر ثانٍ»  يبدأ من **قطعةٍ عندنا** ينقصها متجر، ويسأل: أين أجدها؟
 *   وهذه         تبدأ من **كلمةٍ يكتبها الأدمن**، وتسأل: ماذا في السوق؟
 *
 * فالأولى تُكمل الكتالوج، وهذه تُوسّعه. والمحرّك واحد (`ADAPTERS`).
 *
 * ⚠️ والسعر يُقرأ من صفحة كل منتجٍ على حدة: صفحةُ النتائج لا تحمله في
 * مايكرولس ولا في إنفيني آرك (جُرّب — يعود فارغاً في كل النتائج). فالبحث
 * الواحد = طلبُ بحثٍ + طلبٌ لكل نتيجة. ولذلك يُحدّ العدد، ويُقال للأدمن
 * كم كلّف قبل أن يضغط.
 *
 * ⚠️ ويُعلَّم ما هو عندنا أصلاً: بلا ذلك يكتشف الأدمن التكرار بعد أن يضيف.
 * والمطابقة بالرابط لا بالاسم — الاسم يُكتب بصيغٍ شتّى في كل متجر.
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { adapterFor, searchStore, sourceMeta, readProductPage, maxItemsIn } from '../../../../lib/store-search';
import { seedQueries, unknownOnly, shortTitle, IS_SYSTEM, type Known } from '../../../../lib/discover';
import { draftDescription, costUsd } from '../../../../lib/describe';
import { buildDraft, REQUIRED_SPECS, guessCategory } from '../../../../lib/component-draft';
import { saveComponent } from '../../../../lib/component-save';
import { fetchAttributes, mapAttributes } from '../../../../lib/spec-extract';
import { adminEmail } from '../../../../lib/admin-guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** أقصى ما يُقرأ سعره في طلبٍ واحد — كل واحدٍ منها فتحُ صفحة */
const MAX_READ = 12;

const withSystemsFlag = (b: any) => !!b?.withSystems;

/* ⚠️ القاعدة في `lib/discover.ts` لا هنا: كانت مكتوبةً في هذا الملفّ وحده
   فبقيت غيرَ قابلةٍ للاختبار، وأوّلُ فحصٍ للاكتشاف عدّ اثنتي عشرة تجميعةً
   جاهزة «قطعاً جديدة» لأنّ الفاحص لم يستطع استيرادها. */

export async function GET() {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return NextResponse.json({ sources: sourceMeta(), hasToken: !!process.env.SCRAPER_API_KEY });
}

export async function POST(req: Request) {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}) as any);

  /* ---------- مسودّة قطعة ---------- */
  if (body?.action === 'draft') {
    /* ⚠️ تُقرأ صفحة المنتج مرّةً أخرى — لجدول السمات لا للسعر. وهي الفتحة
       الوحيدة التي تستحقّ: بها تُملأ المواصفات التي يقرؤها فاحص التوافق،
       وبدونها يكتبها الأدمن بيده حقلاً حقلاً. */
    const ad = adapterFor(String(body.source || ''));
    const tok = process.env.SCRAPER_API_KEY || '';
    const title = String(body.title || '');
    /* الفئة تُحسم **قبل** المطابقة: بها تُختار قواعد التسمية. ولو أُجّلت إلى
       ما بعد `buildDraft` لقُرئت السمات بلا قواعد وعادت فارغة. */
    const category = body.category ?? guessCategory(title);
    const attrs = category ? await fetchAttributes(String(body.url || ''), ad?.needsProxy ? tok : '') : {};
    const mapped = mapAttributes(category ?? '', attrs);

    const d = buildDraft({
      readSpecs: mapped.specs,
      derivedSpecs: mapped.derived,
      readTdp: mapped.tdpWattage,
      title,
      url: String(body.url || ''),
      price: body.price == null ? null : Number(body.price),
      currency: body.currency ?? null,
      image: body.image ?? null,
      storeSlug: String(body.source || ''),
      category: body.category ?? null,
    });
    /* ============ الوصف ============
     *
     * ⚠️ `buildDraft` يضع `description: ''` دائماً — ولذلك خرجت ٢٣ قطعةً
     * يوم 2026-09-02 بلا وصفٍ إطلاقاً، ولم يُكتشف حتى سُئل عنه بعد يومين.
     * فالحقل يُملأ هنا لا يُترك للنسيان.
     *
     * ⚠️ وبطلبٍ صريح (`withDescription`) لا تلقائيّاً: النداء يُنفق مالاً،
     * وإنفاقُ مالٍ بلا أن يُطلب مفاجأةٌ في الفاتورة. والكلفة تُعاد مع
     * الجواب كي تُرى قبل أن تتراكم.
     */
    let description = '';
    let descCost = 0;
    let descProblems: string[] = [];
    if (body?.withDescription && d.category && process.env.ANTHROPIC_API_KEY) {
      const peers = (await prisma.component.findMany({
        where: { category: { name: d.category } },
        select: { id: true, brand: true, name: true, price: true, specs: true },
        orderBy: { price: 'desc' },
        take: 40,
      }))
        .sort((a, b) => Math.abs(a.price - (Number(d.price) || 0)) - Math.abs(b.price - (Number(d.price) || 0)))
        .slice(0, 12)
        .map((p) => ({
          id: p.id, brand: p.brand, name: p.name, price: p.price,
          specs: typeof p.specs === 'string' ? JSON.parse(p.specs as any) : ((p.specs as any) || {}),
        }));
      try {
        const w = await draftDescription(
          {
            /* ⚠️ القطعة لم تُحفظ بعد فلا معرّف لها — ويُمرَّر معرّفٌ مستحيل
               كي يبقى حارسُ «لا يربط نفسه» عاملاً بلا أن يمنع شيئاً. */
            id: '__unsaved__',
            brand: d.brand, name: d.name, category: d.category,
            price: Number(d.price) || 0, tdpWattage: d.tdpWattage,
            specs: d.specs || {}, stores: [String(body.source || '')],
          },
          peers,
        );
        description = w.description;
        descProblems = w.problems;
        descCost = Number(costUsd(w.usage).toFixed(4));
      } catch (e: any) {
        descProblems = ['فشل النداء: ' + String(e?.message || e).slice(0, 100)];
      }
    }

    const cats = await prisma.category.findMany({ select: { name: true }, orderBy: { name: 'asc' } });
    return NextResponse.json({
      draft: { ...d, description: description || d.description },
      descProblems,
      descCost,
      descSkipped: body?.withDescription && !process.env.ANTHROPIC_API_KEY ? 'لا ANTHROPIC_API_KEY' : null,
      categories: cats.map((c) => c.name),
      requiredSpecs: REQUIRED_SPECS,
    });
  }

  /* ---------- حفظ ---------- */
  if (body?.action === 'save') {
    const d = body.draft || {};
    /* ⚠️ والمنطق في `lib/component-save.ts` لا هنا: نفس الكتابة تجري من
       سكربتات الإضافة بالجملة، ونسختان تفترقان فتُضاف قطعةٌ بلا نقطة سعر. */
    const r = await saveComponent({
      category: d.category ?? null,
      brand: d.brand ?? '',
      name: d.name ?? '',
      specs: d.specs ?? {},
      tdpWattage: Number(d.tdpWattage) || 0,
      performanceTier: Number(d.performanceTier) || 3,
      imageUrl: d.imageUrl ?? null,
      description: d.description ?? null,
      offers: [{ storeSlug: String(d.storeSlug), url: String(d.url), price: Number(d.price) }],
    });
    if (!r.ok) return NextResponse.json({ error: r.error, existingId: r.existingId }, { status: r.status });
    return NextResponse.json({ ok: true, id: r.id, name: r.name });
  }

  /* ---------- اكتشافٌ تلقائيّ ----------
   *
   * ⚠️ الفرق عن البحث الحرّ سؤالٌ واحد: من يكتب الكلمة؟ هنا يكتبها
   * الكتالوجُ نفسه — عائلاتُ ما نحمله في الفئة تُسأل واحدةً واحدة، وما يعود
   * ولا رابطَ له عندنا يُعرض. فيلتقط النسخ التي كان المستخدم يضيفها بيده:
   * لونٌ آخر، إصدار OC، ماركةٌ ثانية لنفس الشريحة.
   *
   * ⚠️ ولا تُفتح صفحاتُ المنتجات هنا: الفتح ثمنُه طلبٌ لكلّ واحد، والغرض
   * أن يرى الأدمن **ماذا يوجد** أوّلاً. القراءة تأتي عند «أضف».
   */
  if (body?.action === 'discover') {
    const source = String(body?.source || '');
    const category = String(body?.category || '');
    const adapter = adapterFor(source);
    if (!adapter) return NextResponse.json({ error: `متجرٌ غير معروف: «${source}»` }, { status: 400 });
    const token = process.env.SCRAPER_API_KEY || '';
    if (adapter.needsProxy && !token) {
      return NextResponse.json({ error: `${adapter.label} يحتاج SCRAPER_API_KEY` }, { status: 400 });
    }

    const comps = await prisma.component.findMany({
      select: {
        id: true, brand: true, name: true,
        category: { select: { name: true } },
        offers: { select: { url: true } },
      },
    });
    const known: Known[] = comps.map((c) => ({
      id: c.id, brand: c.brand, name: c.name,
      categoryName: c.category.name,
      offerUrls: c.offers.map((o) => o.url).filter(Boolean) as string[],
    }));

    /* السقف من الزمن لا من الرغبة — نفس درس «مصدر ثانٍ» */
    const cap = maxItemsIn(source, maxDuration * 1000);
    const seeds = seedQueries(known, category).slice(0, cap);
    if (!seeds.length) {
      return NextResponse.json({ error: `لا قطعَ في فئة «${category}» تُشتقّ منها كلماتُ بحث` }, { status: 400 });
    }

    const hits: Array<{ title: string; url: string; price?: number | null; image?: string | null; query: string }> = [];
    let failed = 0;
    let systems = 0;
    for (const q of seeds) {
      try {
        const raw = await searchStore(source, q, token);
        for (const c of raw) {
          if (!withSystemsFlag(body) && IS_SYSTEM.test(c.title)) { systems++; continue; }
          hits.push({ title: c.title, url: c.url, price: c.price ?? null, image: c.image ?? null, query: q });
        }
      } catch { failed++; }
      await new Promise((r) => setTimeout(r, adapter.delayMs));
    }

    /* ⚠️ ويُرتَّب بالعائلة ثمّ بالسعر: قائمةٌ بترتيب السؤال تخلط كرت 7800 XT
       بكرت 3070 بكرت 9060، فيقرأ الأدمن ثمانيةً وستّين سطراً بلا أن يستطيع
       المقارنة. والمقارنة هي عملُه كلّه في هذه الصفحة. */
    const fresh = unknownOnly(hits, known).sort(
      (a, b) => a.query.localeCompare(b.query) || (a.price ?? 1e9) - (b.price ?? 1e9),
    );

    return NextResponse.json({
      source, label: adapter.label, category,
      seeds, seedCount: seeds.length, cap,
      scanned: hits.length,
      hiddenSystems: systems,
      failed,
      creditsUsed: adapter.needsProxy ? seeds.length : 0,
      results: fresh.map((f) => ({
        title: f.title,
        /* الاسم المقروء — والعنوان الكامل يبقى لمن أراد التأكّد */
        short: shortTitle(f.title),
        url: f.url, price: f.price ?? null,
        currency: null, inStock: null, image: f.image ?? null, existing: null, query: f.query,
      })),
    });
  }

  const query = String(body?.query || '').trim();
  const source = String(body?.source || '');
  const withSystems = !!body?.withSystems;

  if (query.length < 2) return NextResponse.json({ error: 'اكتب كلمتين على الأقل' }, { status: 400 });

  const adapter = adapterFor(source);
  if (!adapter) {
    return NextResponse.json(
      { error: `متجرٌ غير معروف: «${source}»`, known: sourceMeta().map((m) => m.slug) },
      { status: 400 },
    );
  }

  const token = process.env.SCRAPER_API_KEY || '';
  if (adapter.needsProxy && !token) {
    return NextResponse.json({ error: `${adapter.label} يحتاج SCRAPER_API_KEY` }, { status: 400 });
  }

  try {
    const raw = await searchStore(source, query, token);
    const filtered = withSystems ? raw : raw.filter((c) => !IS_SYSTEM.test(c.title));
    const hidden = raw.length - filtered.length;

    /* ما عندنا: بالرابط، ومجرّداً من الشرطة الأخيرة كي لا يُفلت المكرّر بسببها */
    /* ⚠️ وأمازون يُطابَق بالـASIN لا بنصّ الرابط: روابطنا القديمة عناوينُها
       طويلةٌ مُرمَّزة، ومحوّلُنا يبني `/dp/ASIN` النظيف — فمقارنةُ النصّين
       تُخفي كل مكرّرٍ من أمازون وتُغري الأدمن بإضافته ثانيةً. */
    const norm = (u: string) => {
      const clean = u.replace(/\/$/, '').toLowerCase();
      const asin = clean.match(/\/(?:dp|gp\/product)\/([a-z0-9]{10})/);
      return asin ? 'amazon:' + asin[1] : clean;
    };
    const ours = new Map(
      (await prisma.componentOffer.findMany({
        where: { url: { not: null } },
        select: { url: true, component: { select: { id: true, name: true, brand: true } } },
      })).map((o) => [norm(o.url!), o.component]),
    );

    const picked = filtered.slice(0, MAX_READ);
    const results: any[] = [];
    let hiddenAfterRead = 0;
    let opened = 0;
    for (const c of picked) {
      const mine = ours.get(norm(c.url)) ?? null;
      /* ما هو عندنا لا يُفتَح: لا فائدة من سعرٍ حيٍّ لقطعةٍ يسحبها الكرون.
       * ⚠️ وما جاء بسعره من صفحة النتائج لا يُفتَح أيضاً: بطاقة أمازون تحمل
       *    السعر، وفتحُها بعد ذلك يدفع رصيداً ثانياً لِما نملكه — اثنا عشر
       *    طلباً زائداً في البحث الواحد. */
      const needsRead = !mine && c.price == null;
      const read = needsRead ? await readProductPage(c.url) : null;
      if (needsRead) opened++;
      const title = read?.title || c.title;

      /* ⚠️ ويُعاد المرشِّح على العنوان النهائيّ: قائمة النتائج تسمّي الجهاز
         بالعربية وصفحتُه تسمّيه بالإنجليزية، فما نجا من الأولى يُمسك بالثانية. */
      if (!withSystems && IS_SYSTEM.test(title)) {
        hiddenAfterRead++;
        if (needsRead) await new Promise((r) => setTimeout(r, adapter.delayMs));
        continue;
      }

      results.push({
        title,
        url: c.url,
        price: read?.price ?? c.price ?? null,
        currency: read?.currency ?? null,
        inStock: read?.inStock ?? null,
        image: read?.image ?? null,
        existing: mine ? { id: mine.id, name: `${mine.brand} ${mine.name}` } : null,
      });
      if (needsRead) await new Promise((r) => setTimeout(r, adapter.delayMs));
    }

    return NextResponse.json({
      source,
      label: adapter.label,
      query,
      found: raw.length,
      hiddenSystems: hidden + hiddenAfterRead,
      read: opened,
      /* ما يمرّ عبر Scrape.do يكلّف طلباً لكل فتحة — يُقال للأدمن ما استُهلك.
         والحساب على ما فُتح فعلاً: بحثٌ واحد + ما لم يأتِ بسعره من النتائج. */
      creditsUsed: adapter.needsProxy ? 1 + opened : 0,
      results,
    });
  } catch (e: any) {
    console.error('[POST /api/admin/store-search]', e);
    return NextResponse.json({ error: e?.message || 'تعذّر البحث' }, { status: 500 });
  }
}
