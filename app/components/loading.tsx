import { SkPageHeader, SkCardGrid } from '../../components/loading-ui';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SkPageHeader />
        <SkCardGrid count={9} />
      </div>
    </div>
  );
}