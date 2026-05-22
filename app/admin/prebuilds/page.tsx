import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import AdminPrebuildForm from './AdminPrebuildForm';

export default async function AdminPrebuildsPage() {
  const prebuilds = await prisma.prebuild.findMany({ orderBy: { createdAt: 'desc' } });
  const components = await prisma.component.findMany();
  const categories = await prisma.category.findMany();

  // دالة الإضافة
  async function createPrebuild(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const budgetType = formData.get('budgetType') as string;
    const description = formData.get('description') as string;
    const componentsJson = formData.get('componentsJson') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!title || !description) return;

    await prisma.prebuild.create({
      data: {
        title,
        budgetType,
        price: isNaN(price) ? 0 : price,
        description,
        components: componentsJson ? JSON.parse(componentsJson) : {},
      },
    });

    revalidatePath('/admin/prebuilds');
    revalidatePath('/prebuilds');
  }

  // دالة الحذف
  async function deletePrebuild(formData: FormData) {
    'use server';
    await prisma.prebuild.delete({ where: { id: formData.get('id') as string } });
    revalidatePath('/admin/prebuilds');
    revalidatePath('/prebuilds');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">إدارة التجميعات الجاهزة</h1>

        {/* نموذج البناء (Client Component) */}
        <AdminPrebuildForm dbComponents={components} categories={categories} action={createPrebuild} />

        {/* قائمة التجميعات المضافة */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">التجميعات المضافة ({prebuilds.length})</h2>
          
          {prebuilds.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">لا توجد تجميعات مضافة بعد.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prebuilds.map((build) => {
                // حساب عدد القطع المختارة
                const compObj = typeof build.components === 'string' ? JSON.parse(build.components) : build.components || {};
                const compCount = Object.keys(compObj as object).filter(k => (compObj as any)[k] !== '').length;

                return (
                  <div key={build.id} className="py-4 flex justify-between items-start gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{build.title}</h3>
                      <div className="flex gap-4 text-sm font-semibold mb-2">
                        <span className="text-emerald-600 dark:text-emerald-400">${build.price}</span>
                        <span className="text-blue-600 dark:text-blue-400">تحتوي على {compCount} قطع</span>
                        <span className="text-slate-400">
                          {build.budgetType === 'economic' && 'اقتصادية'}
                          {build.budgetType === 'midrange' && 'متوسطة'}
                          {build.budgetType === 'highend' && 'احترافية عليا'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{build.description}</p>
                    </div>
                    <form action={deletePrebuild}>
                      <input type="hidden" name="id" value={build.id} />
                      <button type="submit" className="text-sm font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        حذف
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}