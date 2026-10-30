import { notFound, redirect } from 'next/navigation';
import { getArticle, AUTHOR } from '../../../lib/content';
import JsonLd, { absUrl, plainText, breadcrumbs, SITE_URL } from '../../../components/JsonLd';
import ArticleView from '../../../components/ArticleView';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const news = await getArticle(id);
  if (!news) return { title: 'الخبر غير موجود', robots: { index: false, follow: true } };

  const description = (news.summary || news.content || '')
    .replace(/[#*\[\]]/g, '')
    .trim()
    .slice(0, 155);

  return {
    title: news.title,
    description,
    alternates: { canonical: `/news/${id}` },
    openGraph: {
      title: news.title,
      description,
      url: `/news/${id}`,
      type: 'article',
      images: news.imageUrl ? [news.imageUrl] : undefined,
    },
  };
}

export default async function NewsDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const news = await getArticle(id);

  if (!news) {
    return notFound();
  }

  // لو الرابط خبر لكن المحتوى دليل، حوّله لمساره الصحيح (تفادي محتوى مكرّر)
  if (news.isGuide) redirect(`/guides/${id}`);

  /* بيانات منظّمة للبحث: المقال وكاتبه ومسار التنقّل */
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title.slice(0, 110),
    description: plainText(news.summary && news.summary !== 'بدون ملخص' ? news.summary : news.content, 200),
    datePublished: new Date(news.createdAt).toISOString(),
    author: { '@type': 'Person', name: AUTHOR.name, url: absUrl('/about') },
    publisher: { '@type': 'Organization', name: 'تجميعتي', url: SITE_URL, logo: { '@type': 'ImageObject', url: absUrl('/icon.png') } },
    ...(news.imageUrl ? { image: absUrl(news.imageUrl) } : {}),
    mainEntityOfPage: absUrl(`/news/${news.id}`),
  };

  return (
    <div className="min-h-screen overflow-x-clip selection:bg-cyan-500/20">
      <JsonLd data={[articleLd, breadcrumbs([['الرئيسية', '/'], ['الأخبار', '/news'], [news.title, `/news/${news.id}`]])]} />
      {/* الرأس والنصّ والعمود الجانبيّ في components/ArticleView — مشترك بين الخبر والدليل */}
      <ArticleView article={news} kind="news" />
    </div>
  );
}