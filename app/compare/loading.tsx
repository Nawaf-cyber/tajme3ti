import { Sk } from '../../components/loading-ui';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Sk className="h-10 w-52 mb-4" />
        <Sk className="h-4 w-80 mb-8" />
        <div className="bg-white/70 dark:bg-[#0F172A]/50 border-t-2 border-t-cyan-500 border-x border-b border-slate-200 dark:border-slate-800 rounded-sm p-4">
          {/* رؤوس الأعمدة */}
          <div className="grid grid-cols-4 gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <Sk className="h-4 w-16 mt-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Sk className="h-24 w-full mb-3 rounded-sm" />
                <Sk className="h-3 w-12 mb-1.5 mx-auto" />
                <Sk className="h-4 w-full" />
              </div>
            ))}
          </div>
          {/* صفوف المواصفات */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
              <Sk className="h-3.5 w-20" />
              <Sk className="h-3.5 w-16 mx-auto" />
              <Sk className="h-3.5 w-16 mx-auto" />
              <Sk className="h-3.5 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}