import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getArticle, AUTHOR } from '../../../lib/content';
import JsonLd, { absUrl, plainText, breadcrumbs, SITE_URL } from '../../../components/JsonLd';
import ArticleView from '../../../components/ArticleView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'دليل غير موجود', robots: { index: false, follow: true } };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `https://www.tajme3ti.com/guides/${id}` },
  };
}

export default async function GuideDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return notFound();

  // لو الرابط دليل لكن المحتوى خبر، حوّله لمساره الصحيح (تفادي محتوى مكرّر)
  if (!article.isGuide) redirect(`/news/${id}`);

  /* بيانات منظّمة للبحث: المقال وكاتبه ومسار التنقّل */
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title.slice(0, 110),
    description: plainText(article.summary && article.summary !== 'بدون ملخص' ? article.summary : article.content, 200),
    datePublished: new Date(article.createdAt).toISOString(),
    author: { '@type': 'Person', name: AUTHOR.name, url: absUrl('/about') },
    publisher: { '@type': 'Organization', name: 'تجميعتي', url: SITE_URL, logo: { '@type': 'ImageObject', url: absUrl('/icon.png') } },
    ...(article.imageUrl ? { image: absUrl(article.imageUrl) } : {}),
    mainEntityOfPage: absUrl(`/guides/${article.id}`),
  };

  return (
    <div className="min-h-screen overflow-x-clip selection:bg-cyan-500/20">
      <JsonLd data={[articleLd, breadcrumbs([['الرئيسية', '/'], ['الأدلّة', '/guides'], [article.title, `/guides/${article.id}`]])]} />
      {/* الرأس والنصّ والعمود الجانبيّ في components/ArticleView — مشترك بين الخبر والدليل */}
      <ArticleView article={article} kind="guide" />
    </div>
  );
}