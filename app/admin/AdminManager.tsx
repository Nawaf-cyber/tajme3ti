'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { addComponent, deleteComponent, addNews, deleteNews, updateComponent, updateNews } from './actions';
import toast from 'react-hot-toast';
import UpdatePricesButton from './UpdatePricesButton';
import UpdateSingleButton from './components/UpdateSingleButton';
import CronControlToggle from './components/CronControlToggle';
import ManualUpdateButton from "./components/ManualUpdateButton";
import ExportComponentsButton from './ExportComponentsButton';
import StoreFieldsGroup from './StoreFieldsGroup';
import ScrapeStatusBadge, { isStale } from './ScrapeStatusBadge';
import { storeVars, type StoreInfo } from '../../lib/stores';

// خريطة الحقول التلقائية بناءً على الفئة
const categoryFieldsMap: Record<string, { key: string, label: string, type: 'text' | 'number' | 'select', options?: string[] }[]> = {
  'CPU': [
    { key: 'socket', label: 'المقبس (Socket)', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200', 'LGA1851'] },
    { key: 'cores', label: 'عدد الأنوية', type: 'number' },
    { key: 'threads', label: 'عدد المسارات (Threads)', type: 'number' },
    { key: 'baseClock', label: 'التردد الأساسي (GHz)', type: 'text' },
  ],
  'Motherboard': [
    { key: 'socket', label: 'المقبس (Socket)', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200', 'LGA1851'] },
    { key: 'ramType', label: 'نوع الرام المدعوم', type: 'select', options: ['DDR5', 'DDR4'] },
    { key: 'formFactor', label: 'الحجم (Form Factor)', type: 'select', options: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'] },
  ],
  'RAM': [
    { key: 'type', label: 'نوع الرام', type: 'select', options: ['DDR5', 'DDR4'] },
    { key: 'speed', label: 'السرعة (MHz)', type: 'number' },
    { key: 'capacity', label: 'السعة الإجمالية (GB)', type: 'select', options: ['8GB', '16GB', '32GB', '64GB', '128GB'] },
  ],
  'GPU': [
    { key: 'lengthMm', label: 'طول الكرت (mm)', type: 'number' },
    { key: 'vram', label: 'حجم الذاكرة (VRAM)', type: 'select', options: ['8GB', '10GB', '12GB', '16GB', '20GB', '24GB'] },
  ],
  'Case': [
    { key: 'maxGpuLength', label: 'أقصى طول لكرت الشاشة (mm)', type: 'number' },
    { key: 'formFactor', label: 'حجم الكيس', type: 'select', options: ['Mid Tower', 'Full Tower', 'Micro-ATX Tower', 'Mini-ITX'] },
  ],
  'PSU': [
    { key: 'wattage', label: 'القدرة (Wattage)', type: 'number' },
    { key: 'rating', label: 'التقييم (80+ Rating)', type: 'select', options: ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium', 'None'] },
  ],
  'Storage': [
    { key: 'type', label: 'النوع', type: 'select', options: ['NVMe M.2', 'SATA SSD', 'HDD'] },
    { key: 'capacity', label: 'السعة', type: 'select', options: ['500GB', '1TB', '2TB', '4TB'] },
  ]
};

/** حالة التحديث الآلي كما تعيدها getCronStatus */
type CronStatus = { enabled: boolean; updatesPerDay: number; lastRunAt: Date | string | null };

export default function AdminManager({ categories, components, news, cronStatus, settings = {}, stores = [], newRequests = 0 }: { categories: any[], components: any[], news: any[], cronStatus: CronStatus, settings?: Record<string, string>, stores?: StoreInfo[], newRequests?: number }) {
  const [activeTab, setActiveTab] = useState<'components' | 'news' | 'affiliates'>('components');
  
  const [editingComponent, setEditingComponent] = useState<any>(null);
  const [editingNews, setEditingNews] = useState<any>(null);

  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // متغيرات الفلترة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  // فلتر المتجر: يعرض القطع التي لها رابط ذلك المتجر (لإدارة روابط العمولة)
  const [filterStore, setFilterStore] = useState<string>('ALL');
  // عرض المتأخّرة فقط — للوصول السريع لما لم يُفحص
  const [onlyStale, setOnlyStale] = useState(false);

  useEffect(() => {
    const catName = categories.find(c => c.id.toString() === selectedCategoryId)?.name || '';
    setSelectedCategoryName(catName);
  }, [selectedCategoryId, categories]);

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

  /* هل للقطعة رابط في هذا المتجر؟ من العروض — فالفلتر يشمل أي متجر يُضاف */
  const hasStoreUrl = (comp: any, storeId: string) =>
    (comp.offers || []).some((o: any) => o.storeId === storeId && o.url && String(o.url).length > 12);

  const filteredComponents = components.filter(comp => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || comp.categoryId === filterCategory;
    const matchesStore = filterStore === 'ALL' || hasStoreUrl(comp, filterStore);
    if (onlyStale && !isStale(comp.lastScrapedAt)) return false;
    return matchesSearch && matchesCategory && matchesStore;
  });

  // عدّادات المتاجر لأزرار الفلتر — صفّ لكل متجر مفعّل
  const storeCounts: Record<string, number> = Object.fromEntries(
    stores.map((st) => [st.id, components.filter((c) => hasStoreUrl(c, st.id)).length]),
  );

  /* مؤشّرات صحّة التحديث — تجيب سؤال «هل كل القطع تتحدّث؟» بنظرة واحدة */
  const staleCount = components.filter((c) => isStale(c.lastScrapedAt)).length;
  const failingCount = components.filter((c) =>
    (c.offers || []).some((o: any) => o.url && o.lastError),
  ).length;

  /* متجر بروابط تتبّع مولَّدة: كم قطعة بلا رابط — يقيس تقدّم عملك */
  const deepStore = stores.find((st) => st.usesDeepLinks && filterStore === st.id);
  const deepMissingLink = deepStore
    ? components.filter(
        (c) =>
          hasStoreUrl(c, deepStore.id) &&
          !(c.offers || []).find((o: any) => o.storeId === deepStore.id)?.affiliateUrl,
      ).length
    : 0;

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => { setActiveTab('components'); cancelEdit(); }}
          className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'components' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
        >
          💻 إدارة القطع
        </button>
        {/* صفحة مستقلّة (خادم) لأنها تجلب عدّادات الطلبات — رابط لا تبويب */}
        <Link
          href="/admin/part-requests"
          className="px-6 py-3 font-bold rounded-lg transition-colors bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
        >
          🙋 طلبات القطع
        </Link>
        <Link
          href="/admin/stores"
          className="px-6 py-3 font-bold rounded-lg transition-colors bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
        >
          🏪 المتاجر
          <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 tabular-nums">{stores.length}</span>
        </Link>
        <button 
          onClick={() => { setActiveTab('news'); cancelEdit(); }}
          className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
        >
          📰 إدارة الأخبار
        </button>
        <button 
          onClick={() => { setActiveTab('affiliates'); cancelEdit(); }}
          className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'affiliates' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
        >
          🔗 إدارة العمولات
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
        <ExportComponentsButton />
        
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <UpdatePricesButton />
        <CronControlToggle
          initialStatus={cronStatus.enabled}
          initialPerDay={cronStatus.updatesPerDay}
          lastRunAt={cronStatus.lastRunAt}
        />
      </div>
      <ManualUpdateButton />

      {activeTab === 'affiliates' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">إعدادات التسويق بالعمولة (Affiliates)</h2>
            {/* معرّفات العمولة انتقلت لصفّ كل متجر في «المتاجر».
                إبقاء الحقول هنا كان سيصير فخّاً: تعدّلها وتُحفظ ولا تؤثّر في
                أي رابط، لأن الرابط يُبنى من إعدادات المتجر. مصدر واحد فقط. */}
            <div className="flex flex-col gap-4">
              <div className="p-5 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/60 dark:bg-cyan-950/20">
                <h4 className="text-sm font-black text-cyan-800 dark:text-cyan-300 mb-2">
                  معرّفات العمولة صارت داخل كل متجر
                </h4>
                <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  لكل متجر الآن معامله ومعرّفه الخاص في صفحة «المتاجر» — لأن كل شبكة عمولة تختلف:
                  أمازون بمعامل <span className="font-mono">tag</span>، وكازاسوق يتطلّب رابط تتبّع مولَّداً لكل منتج.
                  المتجر الجديد يحمل إعداداته معه بلا حقل إضافي هنا.
                </p>
                <div className="flex flex-wrap gap-2">
                  {stores.map((st) => (
                    <span
                      key={st.id}
                      style={storeVars(st.color)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border border-[var(--store-soft)] bg-[var(--store-tint)] text-[color:var(--store-color)]"
                    >
                      {st.name}
                      <span className="font-mono text-[10px] opacity-80" dir="ltr">
                        {st.usesDeepLinks ? 'روابط تتبّع' : st.affiliateId ? `${st.affiliateParam}=${st.affiliateId}` : 'بلا عمولة'}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/admin/stores"
                className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-center transition-colors"
              >
                🏪 فتح إدارة المتاجر
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {editingComponent ? 'تعديل بيانات القطعة' : 'إضافة قطعة جديدة'}
            </h2>
            <form key={editingComponent?.id || 'new-comp'} action={handleComponentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingComponent && <input type="hidden" name="id" value={editingComponent.id} />}
              
              <div className="md:col-span-2">
                <select name="categoryId" required defaultValue={editingComponent?.categoryId || ''} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                  <option value="" disabled>-- اختر الفئة أولاً لتظهر الحقول المخصصة --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <input type="text" name="brand" defaultValue={editingComponent?.brand} placeholder="الشركة المصنعة (Brand)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="name" defaultValue={editingComponent?.name} placeholder="اسم القطعة (Name)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" step="0.01" name="price" defaultValue={editingComponent?.price} placeholder="السعر (Price)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" name="tdpWattage" defaultValue={editingComponent?.tdpWattage} placeholder="استهلاك الطاقة بالواط (TDP)" required className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              
              <select name="performanceTier" defaultValue={editingComponent?.performanceTier || ''} className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">مستوى الأداء (خاص بالمعالج والكرت لتقييم عنق الزجاجة)</option>
                <option value="1">1 - اقتصادي (Entry Level)</option>
                <option value="2">2 - متوسط (Mid-Range)</option>
                <option value="3">3 - فوق المتوسط (High-Mid)</option>
                <option value="4">4 - عالي (High-End)</option>
                <option value="5">5 - فئة عليا (Enthusiast)</option>
              </select>

              <input type="url" name="imageUrl" defaultValue={editingComponent?.imageUrl || ''} placeholder="رابط صورة القطعة (URL) - اختياري" className="p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr" dir="ltr" />
              
              <textarea name="description" defaultValue={editingComponent?.description || ''} placeholder="وصف تفصيلي للقطعة (اختياري، يظهر في نافذة التفاصيل)" className="md:col-span-2 p-3 h-24 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              {/* حقول كل متجر مفعّل — تُولَّد من جدول Store */}
              <StoreFieldsGroup
                stores={stores}
                offers={(editingComponent?.offers || []).map((o: any) => ({ storeId: o.storeId, url: o.url, affiliateUrl: o.affiliateUrl, price: o.price, inStock: o.inStock }))}
              />

              <div className="md:col-span-2 p-6 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 mt-4">
                <h3 className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                  الخصائص التقنية {selectedCategoryName ? `لـ (${selectedCategoryName})` : ''}
                </h3>
                
                {selectedCategoryName && categoryFieldsMap[selectedCategoryName] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                    {categoryFieldsMap[selectedCategoryName].map((field) => (
                      <div key={field.key} className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{field.label}</label>
                        {field.type === 'select' ? (
                          <select 
                            value={specs[field.key] || ''}
                            onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })}
                            className="p-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left"
                            dir="ltr"
                          >
                            <option value="">-- غير محدد --</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input 
                            type={field.type}
                            value={specs[field.key] || ''}
                            onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })}
                            className="p-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left"
                            dir="ltr"
                            placeholder={field.type === 'number' ? 'أرقام فقط' : ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm">مواصفات إضافية يدوية (اختياري)</h4>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
                  <input type="text" placeholder="اسم الخاصية (مثال: color)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className="flex-1 min-w-[150px] p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                  <input type="text" placeholder="القيمة (مثال: Black)" value={specValue} onChange={(e) => setSpecValue(e.target.value)} className="flex-1 min-w-[150px] p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                  <button onClick={handleAddSpec} disabled={!selectedCategoryId} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-gray-400 text-white font-bold rounded shrink-0">إضافة يدوية</button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 min-h-[50px]">
                  {Object.keys(specs).length === 0 && <span className="text-gray-500 text-sm">لا توجد خصائص مضافة حالياً.</span>}
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800/50">
                      <span dir="ltr">{key}: {value as string}</span>
                      <button onClick={(e) => handleRemoveSpec(key, e)} className="text-emerald-600 dark:text-emerald-400 hover:text-red-600 font-bold ml-2">×</button>
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

            {/* ===== فلتر المتجر: زرّ لكل متجر مفعّل، بلونه من الجدول ===== */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 ml-1">المتجر:</span>
              <button
                onClick={() => setFilterStore('ALL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all active:scale-95 ${filterStore === 'ALL' ? 'bg-slate-700 text-white border-slate-700' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-700 hover:border-slate-400'}`}
              >
                الكل
                <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black tabular-nums ${filterStore === 'ALL' ? 'bg-white/25' : 'bg-black/5 dark:bg-white/10'}`}>{components.length}</span>
              </button>
              {stores.map((st) => {
                const on = filterStore === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setFilterStore(st.id as any)}
                    style={{
                      ...storeVars(st.color),
                      backgroundColor: on ? st.color : undefined,
                      borderColor: st.color,
                      color: on ? '#fff' : st.color,
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all active:scale-95 bg-[var(--store-tint)]"
                  >
                    {st.name}
                    <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black tabular-nums ${on ? 'bg-white/25' : 'bg-black/5 dark:bg-white/10'}`}>{storeCounts[st.id] ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {/* متجر بروابط تتبّع مولَّدة: نُظهر تقدّم الروابط كي تعرف كم بقي */}
            {deepStore && (
              <div style={storeVars(deepStore.color)} className="mb-4 flex items-center gap-3 p-3 rounded-lg border border-[var(--store-soft)] bg-[var(--store-tint)]">
                <span className="text-xs font-bold text-[color:var(--store-color)]">
                  {deepMissingLink === 0
                    ? `✅ كل قطع ${deepStore.name} (${storeCounts[deepStore.id] ?? 0}) عليها رابط تتبّع عمولة`
                    : `🔗 ${(storeCounts[deepStore.id] ?? 0) - deepMissingLink} من ${storeCounts[deepStore.id] ?? 0} عليها رابط تتبّع — بقي ${deepMissingLink}`}
                </span>
              </div>
            )}

            {/* ===== صحّة التحديث: يجيب "هل كل القطع تتحدّث؟" بنظرة ===== */}
            <div className="flex items-center gap-2 flex-wrap mb-4 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400">صحّة التحديث:</span>
              <span className="text-[11px] font-black px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                ✓ {components.length - staleCount} فُحصت خلال ٢٤ ساعة
              </span>
              <button
                type="button"
                onClick={() => setOnlyStale(!onlyStale)}
                className={`text-[11px] font-black px-2 py-1 rounded-md border transition-colors ${
                  onlyStale
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-amber-100 dark:bg-amber-900/30 border-transparent text-amber-700 dark:text-amber-400 hover:border-amber-500'
                }`}
              >
                ⏸ {staleCount} متأخّرة {onlyStale ? '(اضغط للعودة)' : '(اضغط لعرضها)'}
              </button>
              {failingCount > 0 && (
                <span className="text-[11px] font-black px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                  ⚠ {failingCount} قطعة فيها متجر فشلت قراءته
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-400 mr-auto">
                مرّر المؤشّر على شارة أي قطعة لترى نتيجة كل متجر
              </span>
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
                        <td className="p-4">
                          {comp.name}
                          {/* حالة آخر فحص — تفصيل كل متجر يظهر عند المرور بالمؤشّر */}
                          <span className="mr-2">
                            <ScrapeStatusBadge lastScrapedAt={comp.lastScrapedAt} offers={comp.offers} />
                          </span>
                          {/* شارة رابط التتبّع — عند تصفية متجر يستخدم روابط مولَّدة */}
                          {deepStore && (
                            (comp.offers || []).find((o: any) => o.storeId === deepStore.id)?.affiliateUrl ? (
                              <span className="mr-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 align-middle">
                                ✓ رابط تتبّع
                              </span>
                            ) : (
                              <span className="mr-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 align-middle">
                                ⚠ بلا رابط تتبّع
                              </span>
                            )
                          )}
                        </td>
                        <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        <div className="flex items-center gap-1">
                          {comp.price} 
                         <div 
                           className="h-4 w-4 bg-emerald-600 dark:bg-emerald-400" 
                           style={{ 
                             maskImage: "url('/riyal.svg')", 
                             WebkitMaskImage: "url('/riyal.svg')", 
                             maskSize: 'contain', 
                             WebkitMaskSize: 'contain', 
                             maskRepeat: 'no-repeat', 
                             WebkitMaskRepeat: 'no-repeat',
                             maskPosition: 'center',
                             WebkitMaskPosition: 'center'
                           }} 
                           />
                          </div>
                        </td>
                        <td className="p-4 flex gap-2">
                          <UpdateSingleButton id={comp.id} name={comp.name} />
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