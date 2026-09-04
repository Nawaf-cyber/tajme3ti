/* ============ كاتب الأخبار — مسار الإدارة ============
 *
 * ثلاث خطوات منفصلة، ولا تُدمج:
 *
 *   POST { action: 'topics' } → يبحث ويقترح عناوين **ولا يكتب مقالاً**
 *   POST { action: 'write'  } → يكتب مقال العنوان الذي اخترتَه
 *   POST { action: 'save'   } → يحفظ ما أقررتَه أنت
 *
 * ⚠️ والفصل بين الأولى والثانية هو الطلب نفسه: أن يعرض ما يوجد قبل أن
 * يكتب. ونداءُ البحث أرخص من نداء الكتابة بكثير، فاقتراحُ سبعة عناوين
 * ثمّ كتابةُ واحد أرخص من كتابة سبعة ورمي ستّة.
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { adminEmail } from '../../../../lib/admin-guard';
import { suggestTopics, writeArticle, costUsd, wordCount, NEWS_MODEL } from '../../../../lib/news-agent';

export const dynamic = 'force-dynamic';
/* ⚠️ والبحث الحيّ أبطأ من التوليد وحده: ثمانية طلبات بحثٍ داخل النداء
   الواحد. فالسقف الأقصى، وتُطلب خطوةٌ واحدةٌ في كلّ مرّة. */
export const maxDuration = 300;

export async function GET() {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const last = await prisma.news.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, title: true } });
  const count = await prisma.news.count();
  return NextResponse.json({
    model: NEWS_MODEL,
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    total: count,
    lastAt: last?.createdAt ?? null,
    lastTitle: last?.title ?? null,
    daysSince: last ? Math.round((Date.now() - new Date(last.createdAt).getTime()) / 86400000) : null,
  });
}

export async function POST(req: Request) {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const body = await req.json().catch(() => ({}) as any);

  /* ---------- حفظ ما أقرّه المحرّر ---------- */
  if (body?.action === 'save') {
    const title = String(body?.title ?? '').trim();
    const content = String(body?.content ?? '').trim();
    if (!title || !content) return NextResponse.json({ error: 'العنوان والنصّ مطلوبان' }, { status: 400 });
    /* ⚠️ ولا يُحفظ ما لم يُقرأ: حدٌّ أدنى يمنع حفظ جوابٍ مبتور بالخطأ */
    if (wordCount(content) < 200) {
      return NextResponse.json({ error: 'المقال قصيرٌ جدّاً — راجعه قبل الحفظ' }, { status: 400 });
    }
    const created = await prisma.news.create({
      data: {
        title,
        summary: String(body?.summary ?? '').trim() || 'بدون ملخص',
        content,
        category: String(body?.category ?? '').trim() || 'عام',
        imageUrl: String(body?.imageUrl ?? '').trim() || null,
      },
      select: { id: true, title: true },
    });
    return NextResponse.json({ ok: true, ...created });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'لا ANTHROPIC_API_KEY في البيئة' }, { status: 400 });
  }

  /* ---------- اقتراح عناوين ---------- */
  if (body?.action === 'topics') {
    try {
      const r = await suggestTopics(String(body?.focus ?? ''));
      return NextResponse.json({
        topics: r.topics,
        /* ⚠️ ويُعاد النصّ الخام حين يفشل التحليل: بلا ذلك يرى المحرّر
           «صفر عناوين» ولا يعرف أنّ البحث نجح والصيغة وحدها اختلّت. */
        raw: r.topics.length ? null : r.raw.slice(0, 1200),
        costUsd: Number(costUsd(r.usage).toFixed(4)),
        costSar: Number((costUsd(r.usage) * 3.75).toFixed(2)),
      });
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message || e).slice(0, 200) }, { status: 502 });
    }
  }

  /* ---------- كتابة المقال ---------- */
  if (body?.action === 'write') {
    const title = String(body?.title ?? '').trim();
    if (!title) return NextResponse.json({ error: 'اختر عنواناً أوّلاً' }, { status: 400 });
    try {
      const r = await writeArticle(
        { title, angle: body?.angle, source: body?.source },
        String(body?.notes ?? ''),
      );
      return NextResponse.json({
        article: r.article,
        problems: r.problems,
        words: r.article ? wordCount(r.article.content) : 0,
        raw: r.article ? null : r.raw.slice(0, 1200),
        costUsd: Number(costUsd(r.usage).toFixed(4)),
        costSar: Number((costUsd(r.usage) * 3.75).toFixed(2)),
      });
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message || e).slice(0, 200) }, { status: 502 });
    }
  }

  return NextResponse.json({ error: 'إجراءٌ غير معروف' }, { status: 400 });
}
