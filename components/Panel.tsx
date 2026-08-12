import type { ReactNode } from 'react';

/**
 * ============ لغة الشكل في صفحة القطعة ============
 *
 * كانت الصفحة تتكلّم ثلاث لغات: بطاقةُ الرأس وجدولُ المواصفات والوصف
 * بحدٍّ سماويّ علويّ و`rounded-sm`، والرسمُ البياني بـ`rounded-2xl` بلا
 * حدٍّ ولا عنوان قسم — كأنه قُصَّ من صفحة أخرى. وسلسلةُ الأصناف نفسها
 * مكتوبة ثلاث مرّات حرفياً، فأيّ تعديل على اللوحة يحتاج ثلاثة تعديلات
 * ويُنسى رابعٌ يُضاف لاحقاً.
 *
 * هنا مصدر الشكل الواحد: لوحة، وعنوان قسم، وشريط إحصاء.
 */

/** السطح المعتمد: حدٌّ سماويّ علويّ فوق زجاجٍ ضبابي */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-sm border-x border-b border-t-2 border-slate-200 border-t-cyan-500/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:border-t-cyan-500/70 dark:bg-[#0F172A]/60 ${className}`}
    >
      {children}
    </div>
  );
}

/** عنوان قسم: شريطٌ متدرّج ثم العنوان، وملحوظةٌ اختيارية أخفت منه */
export function SectionHeading({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <h3 className="flex items-center gap-2 px-2 text-xl font-black text-slate-900 dark:text-white">
      <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px] shadow-cyan-500/40" />
      {children}
      {note && (
        <span className="text-[12.5px] font-semibold text-slate-400 dark:text-slate-500">{note}</span>
      )}
    </h3>
  );
}

/**
 * ============ عنوانٌ صغير ============
 *
 * كان الشكل المعتمد للعناوين الصغيرة: `font-mono uppercase tracking-widest`
 * بحجم ١٠ بكسل. وهو مقبول على اللاتينية، وثلاثة أخطاء على العربية:
 * `font-mono` لا يحمل محارف عربية فيسقط إلى خطٍّ بديل مختلف عن بقية
 * الصفحة، و`uppercase` لا معنى له، و`tracking-widest` يفصل حروفاً يجب
 * أن تتّصل. ولا فرق بين ١٠ بكسل وبين ألّا تكتبها.
 */
export function MicroLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11.5px] font-bold text-slate-400 dark:text-slate-500 ${className}`}>
      {children}
    </p>
  );
}

export type Accent = 'cyan' | 'emerald' | 'rose' | 'none';

const ACCENTS: Record<Accent, { box: string; text: string; dot: string }> = {
  cyan: {
    box: 'border-cyan-400/70 bg-cyan-50/80 dark:border-cyan-500/40 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  emerald: {
    box: 'border-emerald-400/70 bg-emerald-50/80 dark:border-emerald-500/40 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  rose: {
    box: 'border-rose-400/70 bg-rose-50/80 dark:border-rose-500/40 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  none: {
    box: 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50',
    text: 'text-slate-900 dark:text-white',
    dot: 'bg-slate-400',
  },
};

export type Stat = {
  label: string;
  value: string;
  /** لاحقة صغيرة تلتصق بالقيمة: «مم» و«واط» و«﷼» */
  unit?: string;
  accent?: Accent;
  /** نقطةٌ في الزاوية مع شرحها عند التأشير */
  marker?: string;
};

/* حجمٌ واحد للبطاقات الثلاث يُشتقّ من أطولها. اشتقاقُ كلٍّ على حدة يُخرج
   ثلاثة أحجام متجاورة فيبدو الشريط مضطرباً لا مقصوداً.

   والوحدة تدخل في القياس: بدونها قيست «6000» ستّةَ أحرف فأُعطيت ٢٢ بكسل،
   ثم رُسمت «6000 MT/s» فانكسرت سطرين وبقيت «MT/s» وحدها في الثاني. */
const stripSize = (stats: Stat[]): string => {
  const longest = Math.max(...stats.map((s) => s.value.length + (s.unit ? s.unit.length + 1 : 0)));
  if (longest <= 6) return 'text-[22px]';
  if (longest <= 9) return 'text-[18px]';
  if (longest <= 13) return 'text-[15px]';
  return 'text-[13px]';
};

/**
 * ============ شريط الإحصاء ============
 *
 * ثلاثٌ تُقرأ من بعيد فوق تفصيلٍ يُقرأ عند الحاجة. تعلوان معاً في جدول
 * المواصفات وفي الرسم البياني، فيتشابه القسمان بلا أن يتكرّر الكود.
 */
export function StatStrip({ stats, dense = false }: { stats: Stat[]; dense?: boolean }) {
  if (stats.length === 0) return null;
  const font = stripSize(stats);

  return (
    <div className={`grid grid-cols-3 ${dense ? 'mb-3 gap-1.5' : 'mb-4 gap-2'}`}>
      {stats.map((s) => {
        const a = ACCENTS[s.accent ?? 'none'];
        return (
          <div
            key={s.label}
            className={`relative rounded-lg border px-2 py-3 text-center transition-colors ${a.box}`}
          >
            {s.marker && (
              <span
                title={s.marker}
                aria-label={s.marker}
                className={`absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_6px] ${a.dot} shadow-current/70`}
              />
            )}
            <div
              dir="ltr"
              className={`break-words font-black leading-tight tabular-nums ${font} ${a.text}`}
            >
              {s.value}
              {s.unit && (
                <>
                  {' '}
                  <span className="text-[11px] font-bold opacity-60">{s.unit}</span>
                </>
              )}
            </div>
            {/* بلا tracking: العربية متّصلة والتباعد يكسر الوصل */}
            <div className="mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
