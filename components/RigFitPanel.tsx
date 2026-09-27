'use client';

/* ============ «هل يناسب جهازي؟» ============
 *
 * الجوابُ الذي يسأله كلُّ من يملك جهازاً وهو يقرأ صفحة قطعة. وكلُّ آلته
 * موجودةٌ أصلاً: `checkBuild` بثلاثة عشر فحصاً، و`fitsRig` تنسب منها ما
 * يسبّبه المرشَّح وحده.
 *
 * ⚠️ ولا يُعرض شيءٌ لمن لا جهازَ له: دعوةٌ صامتة إلى تسجيله، لا صندوقٌ
 * فارغٌ يشغل مكاناً. و٨٦ من ١٢٩ مستخدماً بلا تجميعةٍ أصلاً.
 *
 * ⚠️ والحساب في المتصفّح لا على الخادم: الجهاز يُجلب مرّةً، والحكم دالّةٌ
 * نقيّة عليه. فلا طلبَ ثانٍ لكلّ صفحةٍ يفتحها.
 */

import { useSession } from 'next-auth/react';
import { useRig } from '../lib/use-rig';
import Link from 'next/link';
import { goToLogin } from '../lib/login-href';
import { fitsRig, type RigCategory, type FitVerdict } from '../lib/rig-fit';
import type { BuildParts, PartLike } from '../lib/build-check';

type Rig = { buildId: string; name: string; rig: BuildParts; customParts: Record<string, string> };

const ICON: Record<FitVerdict['state'], string> = { fits: '✅', warn: '⚠️', block: '⛔' };

const HEAD: Record<FitVerdict['state'], string> = {
  fits: 'تناسب جهازك',
  warn: 'تعمل — مع ملاحظة',
  block: 'لا تناسب جهازك',
};

const TONE: Record<FitVerdict['state'], string> = {
  fits: 'border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-900/15',
  warn: 'border-amber-300 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-900/15',
  block: 'border-rose-300 dark:border-rose-800/50 bg-rose-50/70 dark:bg-rose-900/15',
};

const HEAD_TONE: Record<FitVerdict['state'], string> = {
  fits: 'text-emerald-800 dark:text-emerald-300',
  warn: 'text-amber-800 dark:text-amber-300',
  block: 'text-rose-800 dark:text-rose-300',
};

export default function RigFitPanel({ category, part }: { category: RigCategory; part: PartLike }) {
  const { status } = useSession();
  /* ⚠️ الجلبُ مشتركٌ مع شارات «يدخل كيسك» بجانب المتاجر (lib/use-rig) —
     طلبٌ واحدٌ للصفحة لا طلبٌ لكلّ مكوّن */
  const rigState = useRig();
  const rig: Rig | null | 'none' =
    rigState.state === 'ready' ? (rigState.rig as Rig) : rigState.state === 'none' ? 'none' : null;

  /* الزائر والمسجَّل بلا جهاز: سطرٌ واحد يدعوه، ولا صندوق */
  if (status !== 'authenticated' || rig === 'none') {
    return (
      <Link
        href={status === 'authenticated' ? '/my-builds' : '/login'}
        onClick={status === 'authenticated' ? undefined : goToLogin}
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
      >
        🖥️ سجّل جهازك الحالي لنقول لك: هل تناسبه؟
      </Link>
    );
  }

  if (!rig) return null; // أثناء الجلب — لا هيكلٌ يقفز

  /* ============ هذي في جهازك أصلاً ============
   *
   * ⚠️ وبلا هذا يُقال لصاحب الكرت عن كرته «✅ تناسب جهازك» — جوابٌ صحيحٌ
   * منطقيّاً (الفرقُ بينه وبين نفسه صفر) وفارغٌ من المعنى. ومن يقرأ
   * جواباً فارغاً مرّةً يتوقّف عن قراءة الصندوق.
   */
  const mine = (rig.rig[category] as any)?.id;
  if (mine && mine === (part as any)?.id) {
    return (
      <div className="mt-3 rounded-sm border border-cyan-300 dark:border-cyan-800/50 bg-cyan-50/70 dark:bg-cyan-900/15 p-3.5">
        <p className="text-[13px] font-black text-cyan-800 dark:text-cyan-300">
          🖥️ هذي في جهازك الحالي
        </p>
        <p className="mt-1 text-[12px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
          ولذلك لا نُنبّهك على سعرها — تملكها.
        </p>
      </div>
    );
  }

  const custom = Object.keys(rig.customParts).filter(Boolean) as RigCategory[];
  const v = fitsRig(rig.rig, category, part, custom);

  return (
    <div className={`mt-3 rounded-sm border p-3.5 ${TONE[v.state]}`}>
      <div className="flex items-center gap-2">
        <span className="text-[15px] leading-none">{ICON[v.state]}</span>
        <p className={`text-[13px] font-black ${HEAD_TONE[v.state]}`}>{HEAD[v.state]}</p>
        <span className="mr-auto text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[45%]" title={rig.name}>
          {rig.name}
        </span>
      </div>

      {v.issues.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {v.issues.map((i) => (
            <li key={i.code} className="text-[12px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="opacity-50">— </span>{i.message}
            </li>
          ))}
        </ul>
      )}

      {/* ⚠️ وما لم يُفحص يُقال: `checkBuild` تتخطّى بصمتٍ حين يغيب طرفُ
          الفحص، فمن لم يسجّل كيسه يُقال له «تناسب» في كرتٍ لا يدخل. */}
      {v.unchecked.length > 0 && (
        <p className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/50 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          لم نفحص كلَّ شيء —{' '}
          {v.unchecked.map((u, n) => (
            <span key={u.need}>
              {n > 0 && '، '}
              {u.why}
            </span>
          ))}
          .{' '}
          <Link href="/my-builds" className="underline hover:text-cyan-700 dark:hover:text-cyan-400">
            أكمل جهازك
          </Link>
        </p>
      )}
    </div>
  );
}
