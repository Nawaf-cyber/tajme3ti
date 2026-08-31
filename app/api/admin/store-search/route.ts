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
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { adapterFor, searchStore, sourceMeta, readProductPage } from '../../../../lib/store-search';

export const dynamic = 'force-dynamic';

/** أقصى ما يُقرأ سعره في طلبٍ واحد — كل واحدٍ منها فتحُ صفحة */
const MAX_READ = 12;

/* حاسوبٌ جاهز أو خادمٌ لا قطعة — تُذكر مواصفاته فيلتقطه البحث.
   ⚠️ و«خادم» أُضيف بعد أن ظهر EPYC بـ١٬٠١٦٬٥٩٢ ﷼ مرشّحاً لقرص NVMe. */
/* ⚠️ والعربيّة أُضيفت بعد قياس: إنفيني آرك يسمّي أجهزته في قائمة النتائج
   بالعربية («بي سي قيمنق»)، فمرّت أربعةُ أجهزةٍ من مرشِّحٍ لاتينيٍّ خالص.
   و«Desktop Configuration» لا تحمل أيّ كلمةٍ دالّة أصلاً. */
const IS_SYSTEM =
  /gaming pc|desktop pc|desktop configuration|\bpc\b.*(ryzen|core ultra|rtx)|prebuilt|barebone|workstation|\bserver\b|rack ?mount|\bepyc\b|laptop|notebook|بي ?سي ?قيمنق|جهاز جاهز|تجميعة جاهزة|كمبيوتر مكتبي/i;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === 'ADMIN' ? email : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return NextResponse.json({ sources: sourceMeta(), hasToken: !!process.env.SCRAPER_API_KEY });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const body = await req.json().catch(() => ({}) as any);
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
    const norm = (u: string) => u.replace(/\/$/, '').toLowerCase();
    const ours = new Map(
      (await prisma.componentOffer.findMany({
        where: { url: { not: null } },
        select: { url: true, component: { select: { id: true, name: true, brand: true } } },
      })).map((o) => [norm(o.url!), o.component]),
    );

    const picked = filtered.slice(0, MAX_READ);
    const results: any[] = [];
    let hiddenAfterRead = 0;
    for (const c of picked) {
      const mine = ours.get(norm(c.url)) ?? null;
      /* ما هو عندنا لا يُفتَح: لا فائدة من سعرٍ حيٍّ لقطعةٍ يسحبها الكرون */
      const read = mine ? null : await readProductPage(c.url);
      const title = read?.title || c.title;

      /* ⚠️ ويُعاد المرشِّح على العنوان النهائيّ: قائمة النتائج تسمّي الجهاز
         بالعربية وصفحتُه تسمّيه بالإنجليزية، فما نجا من الأولى يُمسك بالثانية. */
      if (!withSystems && IS_SYSTEM.test(title)) {
        hiddenAfterRead++;
        if (!mine) await new Promise((r) => setTimeout(r, adapter.delayMs));
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
      if (!mine) await new Promise((r) => setTimeout(r, adapter.delayMs));
    }

    return NextResponse.json({
      source,
      label: adapter.label,
      query,
      found: raw.length,
      hiddenSystems: hidden + hiddenAfterRead,
      read: results.filter((r) => !r.existing).length,
      /* ما يمرّ عبر Scrape.do يكلّف طلباً لكل فتحة — يُقال للأدمن ما استُهلك */
      creditsUsed: adapter.needsProxy ? 1 + results.filter((r) => !r.existing).length : 0,
      results,
    });
  } catch (e: any) {
    console.error('[POST /api/admin/store-search]', e);
    return NextResponse.json({ error: e?.message || 'تعذّر البحث' }, { status: 500 });
  }
}
