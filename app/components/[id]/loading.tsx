import { Sk } from '../../../components/loading-ui';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <Sk className="h-80 w-full rounded-3xl" />
          <div>
            <Sk className="h-6 w-24 mb-4 rounded-lg" />
            <Sk className="h-10 w-full mb-3" />
            <Sk className="h-10 w-2/3 mb-6" />
            <Sk className="h-12 w-40 mb-8" />
            <div className="space-y-2">
              <Sk className="h-14 w-full rounded-xl" />
              <Sk className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Sk className="h-64 w-full rounded-3xl" />
          <Sk className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </main>
  );
}