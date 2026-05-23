"use client";
import { useState } from 'react';

export default function AdminPrebuildForm({ dbComponents, categories, action }: { dbComponents: any[], categories: any[], action: any }) {
  // حالة حفظ القطع المحددة
  const [selections, setSelections] = useState<Record<string, string>>({});

  // دالة لتحويل نصوص المواصفات إلى كائن JSON
  const parseSpecs = (specsStr: any) => {
    if (!specsStr) return {};
    try {
      return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
    } catch (e) {
      return {};
    }
  };

  // دالة لجلب القطعة المحددة حالياً بناءً على اسم الفئة
  const getSelectedCompByName = (catName: string) => {
    const cat = categories.find((c: any) => c.name === catName);
    if (!cat) return null;
    const compId = selections[cat.id];
    return dbComponents.find(c => c.id === compId) || null;
  };

  // دالة لفلترة القطع وعرض المتوافق منها فقط
  const getFilteredComps = (category: any) => {
    const baseComps = dbComponents.filter(c => c.categoryId === category.id);

    const cpu = getSelectedCompByName('CPU');
    const mobo = getSelectedCompByName('Motherboard');
    const ram = getSelectedCompByName('RAM');
    const gpu = getSelectedCompByName('GPU');
    const pcCase = getSelectedCompByName('Case');

    return baseComps.filter(comp => {
      const specs = parseSpecs(comp.specs);

      // توافق اللوحة الأم مع المعالج والرام
      if (category.name === 'Motherboard') {
        if (cpu) {
          const cpuSpecs = parseSpecs(cpu.specs);
          if (specs.socket && cpuSpecs.socket && specs.socket !== cpuSpecs.socket) return false;
        }
        if (ram) {
          const ramSpecs = parseSpecs(ram.specs);
          if (specs.ramType && ramSpecs.type && specs.ramType !== ramSpecs.type) return false;
        }
      }
      
      // توافق المعالج مع اللوحة الأم
      if (category.name === 'CPU' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.socket && moboSpecs.socket && specs.socket !== moboSpecs.socket) return false;
      }
      
      // توافق الرام مع اللوحة الأم
      if (category.name === 'RAM' && mobo) {
        const moboSpecs = parseSpecs(mobo.specs);
        if (specs.type && moboSpecs.ramType && specs.type !== moboSpecs.ramType) return false;
      }
      
      // توافق الكيس مع طول كرت الشاشة
      if (category.name === 'Case' && gpu) {
        const gpuSpecs = parseSpecs(gpu.specs);
        if (specs.maxGpuLength && gpuSpecs.lengthMm && parseFloat(specs.maxGpuLength) < parseFloat(gpuSpecs.lengthMm)) return false;
      }
      
      // توافق كرت الشاشة مع الكيس
      if (category.name === 'GPU' && pcCase) {
        const caseSpecs = parseSpecs(pcCase.specs);
        if (specs.lengthMm && caseSpecs.maxGpuLength && parseFloat(specs.lengthMm) > parseFloat(caseSpecs.maxGpuLength)) return false;
      }

      return true;
    });
  };

  // حساب السعر الإجمالي آلياً
  const totalPrice = Object.values(selections).reduce((sum, compId) => {
    const comp = dbComponents.find(c => c.id === compId);
    return sum + (comp?.price || 0);
  }, 0);

  return (
    <form action={action} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">إضافة تجميعة جديدة (نظام الاختيار)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم التجميعة</label>
          <input type="text" name="title" required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فئة الميزانية</label>
          <select name="budgetType" required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white">
            <option value="economic">اقتصادية</option>
            <option value="midrange">متوسطة</option>
            <option value="highend">احترافية عليا</option>
          </select>
        </div>
      </div>

      {/* منطقة اختيار القطع */}
      <div className="mb-6 bg-slate-50 dark:bg-[#0B1120] p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">اختيار القطع الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat: any) => {
            // جلب القطع المتوافقة فقط لهذه الفئة
            const compatibleComps = getFilteredComps(cat);
            
            return (
              <div key={cat.id}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{cat.name}</label>
                <select
                  className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm"
                  value={selections[cat.id] || ''}
                  onChange={(e) => setSelections({ ...selections, [cat.id]: e.target.value })}
                >
                  <option value="">-- اختر {cat.name} --</option>
                  {compatibleComps.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.brand} {c.name} - ${c.price}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">وصف التجميعة ومميزاتها</label>
        <textarea name="description" rows={4} required className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white whitespace-pre-wrap"></textarea>
      </div>

      {/* حقول مخفية لإرسال السعر والقطع للقاعدة */}
      <input type="hidden" name="componentsJson" value={JSON.stringify(selections)} />
      <input type="hidden" name="price" value={totalPrice} />

      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-4">
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          السعر: ${totalPrice.toFixed(2)}
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          حفظ التجميعة 
        </button>
      </div>
    </form>
  );
}