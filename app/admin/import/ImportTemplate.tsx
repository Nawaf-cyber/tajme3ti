'use client';

/* ============ نموذج ملف الاستيراد ============
 *
 * ⚠️ **مولَّدٌ من المخطّط لا مكتوبٌ يدوياً.** المثال المكتوب بالنصّ يتقادم
 * بصمت: نضيف مفتاح توافقٍ إلى `lib/spec-schema.ts` فيصير المثالُ ناقصاً،
 * ويتبعه الرافعُ فتُرفض قطعُه ولا يفهم لماذا — والصفحة نفسها هي التي
 * علّمته الخطأ.
 *
 * فالقوالب هنا تُبنى وقت العرض من `SPEC_SCHEMA` ومن معرّفات الفئات
 * الحقيقية المجلوبة من `/api/categories`. أي تعديلٍ على المخطّط يظهر هنا
 * في اللحظة نفسها.
 *
 * ومعرّف الفئة يُجلب ولا يُكتب: هو cuid لا يحفظه أحد، وكتابته في مثالٍ
 * ثابت تعني أن نسخه من الصفحة يُنتج ملفاً يشير إلى فئةٍ خاطئة إن تغيّر.
 */

import { useEffect, useMemo, useState } from 'react';
import { SPEC_SCHEMA, FEATURES_KEY } from '../../../lib/spec-schema';
import { fieldMeta } from '../../../lib/spec-fields';
import { specLabel } from '../../../lib/spec-labels';

type Cat = { id: string; name: string };

/** اسمٌ وسعرٌ وفئةُ أداءٍ مصدّقة لكل فئة — من الكتالوج نفسه */
const IDENTITY: Record<string, { brand: string; name: string; price: number; tier: number; tdp: number }> = {
  CPU: { brand: 'AMD', name: 'Ryzen 7 9800X3D', price: 2199, tier: 5, tdp: 120 },
  GPU: { brand: 'NVIDIA', name: 'GeForce RTX 5070 Ti', price: 3899, tier: 5, tdp: 300 },
  Motherboard: { brand: 'MSI', name: 'PRO B650M-A WIFI', price: 649, tier: 3, tdp: 0 },
  RAM: { brand: 'G.Skill', name: 'Flare X5 32GB DDR5-6000', price: 449, tier: 4, tdp: 0 },
  Storage: { brand: 'Samsung', name: '990 PRO 2TB', price: 799, tier: 5, tdp: 0 },
  PSU: { brand: 'Corsair', name: 'RM850e', price: 549, tier: 4, tdp: 0 },
  Case: { brand: 'Corsair', name: '4000D Airflow', price: 427, tier: 3, tdp: 0 },
};

/** قيمةٌ مثالٌ لكل مفتاح — من `fieldMeta` كي لا تتناقض مع تلميحات النموذج */
const sample = (category: string, key: string): string => {
  const m = fieldMeta(category, key);
  if (m.options?.length) return m.options[0];
  if (!m.hint) return '…';
  /* التلميح قد يحمل شرحاً بعد الشرطة («3x 120mm — أو لا يوجد»)؛ يصلح داخل
     خانةٍ رماديّة ولا يصلح قيمةً في ملفٍ يُنسخ ويُرفع. فنأخذ ما قبلها. */
  return m.hint.split(' — ')[0];
  /* وكلّها نصّ ولو كانت عدداً: هكذا يكتبها نموذج اللوحة وهكذا هي في كل
     قطعةٍ قائمة. مثالٌ يكتب cores: 8 بلا اقتباس يُنتج jsonb مختلط الأنواع. */
};

export default function ImportTemplate() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [active, setActive] = useState('Case');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCats(Array.isArray(d) ? d : d.categories ?? []))
      .catch(() => setCats([]));
  }, []);

  const catId = cats.find((c) => c.name === active)?.id;
  const schema = SPEC_SCHEMA[active];

  const template = useMemo(() => {
    if (!schema) return '';
    const id = IDENTITY[active] ?? IDENTITY.Case;
    const specs: Record<string, unknown> = {};
    for (const k of [...schema.compat, ...schema.compare]) specs[k] = sample(active, k);
    /* المزايا **داخل** specs لا بجانبها — المستورد لا يقرأ حقلاً أعلى باسم
       features، فمثالٌ يضعه في الخارج يعلّم خطأً يضيع بصمت. */
    specs[FEATURES_KEY] = ['ميزةٌ تظهر في صفحة القطعة وحدها'];

    const obj: Record<string, unknown> = {
      categoryId: catId ?? '⟵ انسخ معرّف الفئة من الجدول أسفله',
      brand: id.brand,
      name: id.name,
      price: id.price,
      performanceTier: id.tier,
      tdpWattage: id.tdp,
      imageUrl: 'https://…/image.jpg',
      description: '### وصف القطعة\n\nنصّ يظهر في صفحتها.',
      specs,
      amazonUrl: 'https://www.amazon.sa/dp/XXXXXXXXXX',
      amazonPrice: id.price,
      amazonInStock: true,
    };
    return '[\n' + JSON.stringify(obj, null, 2).split('\n').map((l) => '  ' + l).join('\n') + '\n]';
  }, [active, catId, schema]);

  const copy = () => {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/60 font-black text-sm text-slate-800 dark:text-slate-200">
        📄 شكل الملف المطلوب
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(SPEC_SCHEMA).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-colors ${
                active === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ما يُرفض وما يُحذَّر منه — قبل القالب لا بعده */}
        {schema && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-900/10 p-3">
              <p className="font-black text-red-700 dark:text-red-400 mb-1">
                🔒 إلزامية — نقصُها يرفض القطعة
              </p>
              <p className="text-red-600 dark:text-red-300 leading-relaxed">
                {schema.compat.map((k) => `${specLabel(k)} (${k})`).join(' · ')}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-900/10 p-3">
              <p className="font-black text-amber-700 dark:text-amber-400 mb-1">
                📊 تُحفظ وتُذكَر إن نقصت
              </p>
              <p className="text-amber-600 dark:text-amber-300 leading-relaxed">
                {schema.compare.map((k) => `${specLabel(k)} (${k})`).join(' · ')}
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={copy}
            className="absolute top-2 left-2 px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-black"
          >
            {copied ? '✔ نُسخ' : 'نسخ'}
          </button>
          <pre
            dir="ltr"
            className="p-4 pt-10 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[11.5px] leading-relaxed"
          >
            <code>{template}</code>
          </pre>
        </div>

        {/* معرّفات الفئات — تُجلب حيّةً، فلا تشير إلى فئةٍ حُذفت أو تغيّرت */}
        <div>
          <p className="text-[12px] font-black text-slate-700 dark:text-slate-300 mb-2">
            معرّفات الفئات (<span className="font-mono" dir="ltr">categoryId</span>)
          </p>
          {cats.length === 0 ? (
            <p className="text-[12px] text-slate-500">جاري الجلب…</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300"
                  dir="ltr"
                >
                  {c.name}: {c.id}
                </span>
              ))}
            </div>
          )}
        </div>

        <ul className="text-[12px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
          <li>• الملف <b>مصفوفة</b> من الكائنات — قطعةٌ واحدة تُكتب داخل <span className="font-mono" dir="ltr">[ ]</span> أيضاً.</li>
          <li>• أضف <span className="font-mono" dir="ltr">id</span> لتعديل قطعةٍ قائمة. وبدونه تُطابَق بالاسم، فإن لم تُوجد أُنشئت.</li>
          <li>
            • ⚠️ <span className="font-mono" dir="ltr">specs</span> <b>يستبدل</b> ولا يدمج — أرسله كاملاً،
            فإرسال مفتاحٍ واحد يمحو الباقي (ويُرفض إن كان الناقص مفتاح توافق).
          </li>
          <li>
            • <span className="font-mono" dir="ltr">features</span> مفتاحٌ <b>داخل</b>{' '}
            <span className="font-mono" dir="ltr">specs</span> لا بجانبه — مصفوفةُ جُمَلٍ حرّة تظهر
            في صفحة القطعة وحدها ولا تدخل الجدول ولا المقارنة.
          </li>
          <li>
            • <span className="font-mono" dir="ltr">performanceTier</span> (١–٥) مطلوبٌ لكل قطعة
            جديدة — بدونه تُرفض، لأن الفئة هي ما يبني عليه المُجمّع اختياره.
          </li>
          <li>
            • أعمدة المتاجر لكل متجر: <span className="font-mono" dir="ltr">&lt;slug&gt;Url</span> ·{' '}
            <span className="font-mono" dir="ltr">&lt;slug&gt;Price</span> ·{' '}
            <span className="font-mono" dir="ltr">&lt;slug&gt;InStock</span> ·{' '}
            <span className="font-mono" dir="ltr">&lt;slug&gt;AffiliateUrl</span> — مثل{' '}
            <span className="font-mono" dir="ltr">noonUrl</span>. والمتجر بلا أعمدة لا يُمسّ عرضه.
          </li>
        </ul>
      </div>
    </div>
  );
}
