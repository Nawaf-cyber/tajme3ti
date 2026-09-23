/* ============ صورةُ معاينة رابط التجميعة ============
 *
 * ما يراه من يستلم الرابط في واتساب وX قبل أن يفتحه. وهو الإعلانُ الوحيد
 * الذي يصنعه المستخدم بنفسه: يرسل تجميعته لصاحبه يسأله رأيه — فإمّا
 * شعارٌ عامّ، أو القطعُ والسعر واسمُ الموقع.
 *
 * ⚠️ العربيّ يمرّ على `rtlPieces` لا مباشرةً: Satori يرصّ الكلمات يساراً
 * (lib/og-bidi.ts). والخطّ ملفٌّ في المستودع لا جلبٌ من Google في كلّ
 * رسم — المعاينة تُطلب من خوادم واتساب، وجلبٌ يتعثّر يعني صورةً فارغة.
 */

import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCard, STATE_TEXT, formatTotal, type CardState, type CardPart } from '../../../lib/build-card';
import { rtlPieces } from '../../../lib/og-bidi';

export const alt = 'تجميعة على منصة تجميعتي — القطع والسعر وفحص التوافق';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
/* الأسعار تتغيّر يومياً، والمعاينة تُطلب مرّةً لكلّ مشاركة — ساعةٌ تكفي */
export const revalidate = 3600;

const C = {
  bg: '#0B1120',
  surface: '#0F172A',
  line: '#1E293B',
  text: '#F8FAFC',
  soft: '#CBD5E1',
  mute: '#64748B',
  cyan: '#22D3EE',
  emerald: '#34D399',
};

const STATE_COLOR: Record<CardState, string> = {
  fits: '#34D399',
  warn: '#FBBF24',
  block: '#FB7185',
};

/** سطرٌ بقطعه المرئيّة — والمسافة هامشٌ لا حرف */
function Line({ text, max, style }: { text: string; max?: number; style: Record<string, any> }) {
  return (
    <div style={{ display: 'flex', whiteSpace: 'nowrap', ...style }}>
      {rtlPieces(text, max).map((p, i) => (
        <span key={i} style={{ marginLeft: p.gap ? '0.28em' : 0 }}>{p.text}</span>
      ))}
    </div>
  );
}

/** [القيمة][التسمية] — التسمية يميناً كما تُقرأ */
function Row({ part, size: fs, labelSize, max, color }: { part: CardPart; size: number; labelSize: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18, overflow: 'hidden' }}>
      <Line text={part.title} max={max} style={{ fontSize: fs, fontWeight: 700, color }} />
      <Line text={part.label} style={{ fontSize: labelSize, fontWeight: 500, color: C.mute, flexShrink: 0 }} />
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dir = join(process.cwd(), 'assets/fonts');
  const [medium, bold, riyalSvg, card] = await Promise.all([
    readFile(join(dir, 'IBMPlexSansArabic-Medium.ttf')),
    readFile(join(dir, 'IBMPlexSansArabic-Bold.ttf')),
    readFile(join(process.cwd(), 'public/riyal.svg'), 'utf8'),
    buildCard(id).catch(() => null),
  ]);
  const fonts = [
    { name: 'Plex', data: medium, weight: 500 as const, style: 'normal' as const },
    { name: 'Plex', data: bold, weight: 700 as const, style: 'normal' as const },
  ];

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: C.cyan }} />
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: C.soft }}>tajme3ti.com</div>
    </div>
  );

  /* رابطٌ لتجميعةٍ حُذفت: شعارٌ لا خطأ — المعاينة تبقى في المحادثة */
  if (!card || card.parts.length === 0) {
    return new ImageResponse(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%', height: '100%', background: C.bg, fontFamily: 'Plex' }}>
        <Line text="تجميعتي" style={{ fontSize: 96, fontWeight: 700, color: C.text }} />
        <Line text="افحص توافق القطع وقارن أسعار المتاجر السعودية" style={{ fontSize: 34, fontWeight: 500, color: C.soft }} />
        {brand}
      </div>,
      { ...size, fonts },
    );
  }

  const [hero, second, ...rest] = card.parts;
  const right = rest.filter((_, i) => i % 2 === 0);
  const left = rest.filter((_, i) => i % 2 === 1);
  const stateColor = STATE_COLOR[card.state];
  const riyal = `data:image/svg+xml;base64,${Buffer.from(riyalSvg.replace(/#231f20/gi, C.emerald)).toString('base64')}`;

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: C.bg, fontFamily: 'Plex', padding: '40px 60px 38px' }}>
      {/* الرأس: الاسم يميناً بشريط الموقع، والنطاق يساراً */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {brand}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Line text={card.name} max={32} style={{ fontSize: 54, fontWeight: 700, color: C.text }} />
          <div style={{ width: 8, height: 54, borderRadius: 4, background: C.cyan }} />
        </div>
      </div>

      {/* الكرت والمعالج — عنوانُ التجميعة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 34 }}>
        {hero && <Row part={hero} size={56} labelSize={26} max={30} color={C.text} />}
        {second && <Row part={second} size={40} labelSize={24} max={40} color={C.soft} />}
      </div>

      {/* البقيّة عمودان — الأوّل يميناً */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', gap: 48, marginTop: 26, paddingTop: 22, borderTop: `2px solid ${C.line}` }}>
          {[left, right].map((col, n) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'hidden' }}>
              {col.map((p) => (
                <Row key={p.category} part={p} size={23} labelSize={19} max={32} color={C.soft} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* الذيل: المجموع يميناً، والتوافق يساراً */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px', borderRadius: 40, border: `2px solid ${stateColor}`, background: `${stateColor}1A` }}>
          <Line text={STATE_TEXT[card.state]} style={{ fontSize: 28, fontWeight: 700, color: stateColor }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: stateColor }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={riyal} width={50} height={56} />
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, color: C.emerald, lineHeight: 1 }}>
              {formatTotal(card.total)}
            </div>
          </div>
          <Line text="المجموع" style={{ fontSize: 24, fontWeight: 500, color: C.mute }} />
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
