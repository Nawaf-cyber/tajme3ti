'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addComponent, deleteComponent, addNews, deleteNews, updateComponent, updateNews } from './actions';
import toast from 'react-hot-toast';
import UpdateCazasouqButton from './components/UpdateCazasouqButton';

export default function AdminManager({ categories, components, news }: { categories: any[], components: any[], news: any[] }) {
  const [activeTab, setActiveTab] = useState<'components' | 'news'>('components');
  
  const [editingComponent, setEditingComponent] = useState<any>(null);
  const [editingNews, setEditingNews] = useState<any>(null);

  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // متغيرات الفلترة والبحث الخاصة بجدول القطع
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const handleAddSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    if (specKey.trim() && specValue.trim()) {
      setSpecs({ ...specs, [specKey.trim()]: specValue.trim() });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpec = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newSpecs = { ...specs };
    delete newSpecs[key];
    setSpecs(newSpecs);
  };

  const startEditComponent = (comp: any) => {
    setEditingComponent(comp);
    setSelectedCategoryId(comp.categoryId);
    setSpecs(comp.specs || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditNews = (n: any) => {
    setEditingNews(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingComponent(null);
    setEditingNews(null);
    setSelectedCategoryId('');
    setSpecs({});
  };

  const selectedCategoryName = categories.find(c => c.id.toString() === selectedCategoryId)?.name || '';

  const handleComponentSubmit = async (formData: FormData) => {
    const loadingToast = toast.loading('جاري الحفظ...');
    try {
      if (editingComponent) {
        await updateComponent(formData);
        toast.success('تم تعديل بيانات القطعة بنجاح', { id: loadingToast });
      } else {
        await addComponent(formData);
        toast.success('تمت إضافة القطعة بنجاح', { id: loadingToast });
      }
      cancelEdit();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ', { id: loadingToast });
    }
  };

  const handleNewsSubmit = async (formData: FormData) => {
    const loadingToast = toast.loading('جاري الحفظ...');
    try {
      if (editingNews) {
        await updateNews(formData);
        toast.success('تم تعديل الخبر بنجاح', { id: loadingToast });
      } else {
        await addNews(formData);
        toast.success('تمت إضافة الخبر بنجاح', { id: loadingToast });
      }
      cancelEdit();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ', { id: loadingToast });
    }
  };

  // تطبيق الفلترة على القطع
  const filteredComponents = components.filter(comp => {
    const matchesSearch = 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      comp.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || comp.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => { setActiveTab('components'); cancelEdit(); }}
          className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'components' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
        >
          💻 إدارة القطع
        </button>
        
        <button 
          onClick={() => { setActiveTab('news'); cancelEdit(); }}
          className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
        >
          📰 إدارة الأخبار
        </button>

        <Link 
          href="/admin/import" 
          className="px-6 py-3 font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          📥 استيراد من JSON
        </Link>

        <Link 
          href="/admin/prebuilds" 
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm">
          <span>➕</span> إضافة تجميعة جاهزة
        </Link>
        {/* داخل الكود الخاص بالصفحة: */}
        <div className="mb-6">
          <UpdateCazasouqButton />
        </div>
      </div>

      {activeTab === 'components' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {editingComponent ? 'تعديل بيانات القطعة' : 'إضافة قطعة جديدة'}
            </h2>
            <form key={editingComponent?.id || 'new-comp'} action={handleComponentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingComponent && <input type="hidden" name="id" value={editingComponent.id} />}
              
              <div className="md:col-span-2">
                <select name="categoryId" required defaultValue={editingComponent?.categoryId || ''} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>-- اختر الفئة --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <input type="text" name="brand" defaultValue={editingComponent?.brand} placeholder="الشركة المصنعة (Brand)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="name" defaultValue={editingComponent?.name} placeholder="اسم القطعة (Name)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" step="0.01" name="price" defaultValue={editingComponent?.price} placeholder="السعر (Price)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" name="tdpWattage" defaultValue={editingComponent?.tdpWattage} placeholder="استهلاك الطاقة بالواط (TDP)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              
              <input type="url" name="imageUrl" defaultValue={editingComponent?.imageUrl || ''} placeholder="رابط صورة القطعة (URL) - اختياري" className="md:col-span-2 p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr" dir="ltr" />
              
              <input type="url" name="amazonUrl" defaultValue={editingComponent?.amazonUrl || ''} placeholder="رابط أمازون (اختياري)" className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr" dir="ltr" />
              <input type="url" name="cazasouqUrl" defaultValue={editingComponent?.cazasouqUrl || ''} placeholder="رابط كازاسوق (اختياري)" className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr" dir="ltr" />
              
              <textarea name="description" defaultValue={editingComponent?.description || ''} placeholder="وصف تفصيلي للقطعة (اختياري، يظهر في نافذة التفاصيل)" className="md:col-span-2 p-3 h-24 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>

              <div className="md:col-span-2 p-4 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 mt-4">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-3">الخصائص التقنية {selectedCategoryName ? `لـ (${selectedCategoryName})` : ''}</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="اسم الخاصية" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className="flex-1 p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                  <input type="text" placeholder="القيمة" value={specValue} onChange={(e) => setSpecValue(e.target.value)} className="flex-1 p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                  <button onClick={handleAddSpec} disabled={!selectedCategoryId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded">إضافة</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                      <span dir="ltr">{key}: {value as string}</span>
                      <button onClick={(e) => handleRemoveSpec(key, e)} className="text-blue-600 dark:text-blue-400 hover:text-red-600 font-bold">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <input type="hidden" name="specs" value={JSON.stringify(specs)} />
              
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
                  {editingComponent ? 'حفظ التعديلات' : 'حفظ القطعة'}
                </button>
                {editingComponent && (
                  <button type="button" onClick={cancelEdit} className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl shadow-sm">
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">إدارة القطع الحالية</h2>
            
            {/* شريط البحث والفلترة */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="ابحث باسم القطعة أو الشركة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              >
                <option value="ALL">جميع الفئات</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700 rounded-tr-lg">الفئة</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700">الشركة</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700">الاسم</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700">السعر</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700 rounded-tl-lg">إجراء</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {filteredComponents.length > 0 ? (
                    filteredComponents.map((comp) => (
                      <tr key={comp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800/50">
                        <td className="p-4">{comp.category?.name}</td>
                        <td className="p-4 font-semibold">{comp.brand}</td>
                        <td className="p-4">{comp.name}</td>
                        <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">${comp.price}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => startEditComponent(comp)} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-200 transition-colors">
                            تعديل
                          </button>
                          <form action={async (formData) => {
                            if (!window.confirm(`حذف (${comp.name})؟`)) return;
                            const t = toast.loading('جاري الحذف...');
                            try {
                              await deleteComponent(formData);
                              toast.success('تم الحذف بنجاح', { id: t });
                            } catch (e) {
                              toast.error('حدث خطأ أثناء الحذف', { id: t });
                            }
                          }}>
                            <input type="hidden" name="id" value={comp.id} />
                            <button type="submit" className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 transition-colors">حذف</button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد قطع مطابقة للبحث</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
            </h2>
            <form key={editingNews?.id || 'new-news'} action={handleNewsSubmit} className="grid grid-cols-1 gap-4">
              {editingNews && <input type="hidden" name="id" value={editingNews.id} />}
              <input type="text" name="title" defaultValue={editingNews?.title} placeholder="عنوان الخبر" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="category" defaultValue={editingNews?.category} placeholder="التصنيف (مثال: CPU, GPU, عام)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="url" name="imageUrl" defaultValue={editingNews?.imageUrl || ''} placeholder="رابط صورة الخبر (URL) - اختياري" className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr" dir="ltr" />
              <textarea name="summary" defaultValue={editingNews?.summary} placeholder="ملخص قصير للخبر" required className="p-3 h-24 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              <textarea name="content" defaultValue={editingNews?.content} placeholder="محتوى الخبر بالكامل" required className="p-3 h-48 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              <div className="flex gap-4 mt-2">
                <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
                  {editingNews ? 'حفظ التعديلات' : 'حفظ الخبر'}
                </button>
                {editingNews && (
                  <button type="button" onClick={cancelEdit} className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl shadow-sm">
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">إدارة الأخبار الحالية</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700 rounded-tr-lg">التاريخ</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700">التصنيف</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700">العنوان</th>
                    <th className="p-4 border-b border-gray-200 dark:border-slate-700 rounded-tl-lg">إجراء</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {news.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800/50">
                      <td className="p-4" dir="ltr">{new Date(n.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">{n.category}</span>
                      </td>
                      <td className="p-4 font-semibold">{n.title}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => startEditNews(n)} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-200 transition-colors">
                          تعديل
                        </button>
                        <form action={async (formData) => {
                          if (!window.confirm(`حذف (${n.title})؟`)) return;
                          const t = toast.loading('جاري الحذف...');
                          try {
                            await deleteNews(formData);
                            toast.success('تم الحذف بنجاح', { id: t });
                          } catch (e) {
                            toast.error('حدث خطأ أثناء الحذف', { id: t });
                          }
                        }}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 transition-colors">حذف</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}