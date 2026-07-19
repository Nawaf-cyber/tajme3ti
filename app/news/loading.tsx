import { Sk, SkArticleCard } from '../../components/loading-ui';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 pt-8">
          <Sk className="h-8 w-40 mb-10 rounded-full" />
          <Sk className="h-14 w-72 mb-5" />
          <Sk className="h-4 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <SkArticleCard key={i} />)}
        </div>
      </div>
    </main>
  );
}