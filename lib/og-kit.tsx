/* ============ عُدّة الصور المولَّدة ============
 *
 * ما تشترك فيه بطاقةُ الرابط (`/build/[id]/opengraph-image`) وستوري الجهاز
 * (`/api/rig/story`): الخطّ، والألوان، والريال، وسطرُ النصّ.
 *
 * ⚠️ مكانٌ واحد لا نسختان: سطرُ النصّ هنا يحمل علاجَين لعيوب Satori
 * (lib/og-bidi.ts)، ونسخةٌ ثانيةٌ منه كانت ستنسى أحدهما يوماً — وهو الدرس
 * الذي تكرّر في هذا المشروع خمس مرّات.
 *
 * خادمٌ فقط: يقرأ الملفّات من القرص.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rtlPieces } from './og-bidi';

export const OG = {
  bg: '#0B1120',
  line: '#1E293B',
  text: '#F8FAFC',
  soft: '#CBD5E1',
  mute: '#64748B',
  cyan: '#22D3EE',
  emerald: '#34D399',
  amber: '#FBBF24',
  rose: '#FB7185',
  blue: '#60A5FA',
};

/* ⚠️ IBM Plex Sans Arabic لا Cairo: الأخير ينقصه ٣٦ شكلاً منفصلاً (og-bidi).
   والخطّ ملفٌّ في المستودع لا جلبٌ من Google: المعاينة تُطلب من خوادم
   واتساب، وجلبٌ يتعثّر يعني صورةً فارغة. */
let fontsOnce: Promise<any[]> | null = null;
export const ogFonts = () =>
  (fontsOnce ??= (async () => {
    const dir = join(process.cwd(), 'assets/fonts');
    const [medium, bold] = await Promise.all([
      readFile(join(dir, 'IBMPlexSansArabic-Medium.ttf')),
      readFile(join(dir, 'IBMPlexSansArabic-Bold.ttf')),
    ]);
    return [
      { name: 'Plex', data: medium, weight: 500 as const, style: 'normal' as const },
      { name: 'Plex', data: bold, weight: 700 as const, style: 'normal' as const },
    ];
  })().catch((e) => { fontsOnce = null; throw e; }));

let riyalOnce: Promise<string> | null = null;
/** أيقونة الريال بلونٍ معيّن، صورةً مضمّنة */
export async function riyalUri(color: string) {
  const svg = await (riyalOnce ??= readFile(join(process.cwd(), 'public/riyal.svg'), 'utf8'));
  return `data:image/svg+xml;base64,${Buffer.from(svg.replace(/#231f20/gi, color)).toString('base64')}`;
}

/** سطرٌ واحد: كلُّ قطعةٍ عنصرٌ، والمسافة هامشٌ لا حرف (lib/og-bidi.ts) */
export function Line({ text, max, style }: { text: string; max?: number; style: Record<string, any> }) {
  return (
    <div style={{ display: 'flex', whiteSpace: 'nowrap', ...style }}>
      {rtlPieces(text, max).map((p, i) => (
        <span key={i} style={{ marginLeft: p.gap ? '0.28em' : 0 }}>{p.text}</span>
      ))}
    </div>
  );
}
