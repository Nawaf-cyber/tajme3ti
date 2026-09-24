/* ============ رسمُ ستوري «جهازي» ============
 *
 * مفصولٌ عن المسار (app/api/rig/story): المسار يتحقّق من الجلسة ويجلب
 * جهازك، وهذا يرسم ما يُعطى فقط. وبهذا يُجرَّب الرسم على بياناتٍ حقيقيّة
 * بلا تسجيل دخول ولا كتابةٍ في القاعدة (scripts/story-check.ts --render).
 *
 * ⚠️ والمساحةُ فوق ١٧٠ وتحت ٢٥٠ فارغةٌ عمداً: سناب وإنستقرام يغطّيانها
 * باسم الحساب وحقل الردّ.
 */

import { ImageResponse } from 'next/og';
import { formatTotal, isAutoName, CARD_CATEGORIES, type BuildCard } from './build-card';
import { OG, Line, ogFonts, riyalUri } from './og-kit';
import type { Balance } from './bottleneck';

/* ⚠️ نصوصٌ هنا لا عناوين `bottleneck()`: تلك تبدأ برموزٍ تعبيريّة
   (⚠️ 💡) وSatori لا يرسمها بلا محمّلٍ خارجيّ — فتظهر مربّعاتٍ فارغة. */
const BALANCE: Record<Balance['kind'], { title: string; desc: string; color: string }> = {
  balanced: { title: 'متوازن', desc: 'المعالج والكرت من نفس الفئة', color: OG.emerald },
  'cpu-weak': { title: 'المعالج أضعف من الكرت', desc: 'ترقية المعالج تُطلق أداء الكرت', color: OG.amber },
  'gpu-weak': { title: 'الكرت أضعف من المعالج', desc: 'الكرت هو أوّل ترقية', color: OG.blue },
};

type Row = { category: string; label: string; text: string; custom: boolean };

export async function renderRigStory(card: BuildCard, opts: { price: boolean }): Promise<ImageResponse> {
  /* القطع والنصوص في قائمةٍ واحدة بترتيب الفئات. والكرت والمعالج باسم
     الموديل بلا شركة: السطر الكبير يضيق عن «PNY GeForce RTX 5070 Ti 16GB»،
     والموديل هو ما يُسأل عنه. */
  const rows: Row[] = CARD_CATEGORIES.flatMap((cat): Row[] => {
    const p = card.parts.find((x) => x.category === cat);
    if (p) {
      const hero = cat === 'GPU' || cat === 'CPU';
      return [{ category: cat, label: p.label, text: hero ? p.model : p.title, custom: false }];
    }
    const c = card.custom.find((x) => x.category === cat);
    return c ? [{ category: cat, label: c.label, text: c.text, custom: true }] : [];
  });
  const hero = rows.filter((r) => r.category === 'GPU' || r.category === 'CPU');
  const rest = rows.filter((r) => r.category !== 'GPU' && r.category !== 'CPU');

  /* ⚠️ والسعر يسقط إن كان في الجهاز قطعةٌ مكتوبة: لا سعرَ لها، فالمجموع
     أقلُّ من الجهاز — و«لو تشتريه اليوم» عندها رقمٌ خاطئ. */
  const showPrice = opts.price && card.custom.length === 0 && card.total > 0;
  const balance = card.balance ? BALANCE[card.balance] : null;
  const title = isAutoName(card.name) ? null : card.name;

  const [fonts, riyal] = await Promise.all([ogFonts(), riyalUri(OG.emerald)]);

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'linear-gradient(180deg, #0B1120 0%, #0E1A33 55%, #0B1120 100%)', fontFamily: 'Plex', padding: '170px 80px 250px' }}>
      {/* الرأس */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Line text="جهازي" style={{ fontSize: 112, fontWeight: 700, color: OG.text, lineHeight: 1.25 }} />
          <div style={{ width: 12, height: 100, borderRadius: 6, background: OG.cyan }} />
        </div>
        {title && <Line text={title} max={30} style={{ fontSize: 38, fontWeight: 500, color: OG.mute, marginTop: 14 }} />}
      </div>

      {/* الوسط يتوسّط ما بين الرأس والذيل: جهازٌ بخمس قطع لا يترك فجوةً
          تحت قائمته */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingTop: 40, paddingBottom: 40 }}>

      {/* الكرت والمعالج */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {hero.map((r, i) => (
          <div key={r.category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <Line text={r.label} style={{ fontSize: i === 0 ? 31 : 26, fontWeight: 500, color: OG.cyan }} />
            <Line
              text={r.text}
              max={i === 0 ? 26 : 30}
              style={{ fontSize: i === 0 ? 62 : 52, fontWeight: 700, color: r.custom ? OG.mute : i === 0 ? OG.text : OG.soft }}
            />
          </div>
        ))}
      </div>

      {/* البقيّة: القطعة يساراً وتسميتها يميناً في عمودٍ ثابت */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 36, paddingTop: 34, borderTop: `3px solid ${OG.line}` }}>
          {rest.map((r) => (
            <div key={r.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18 }}>
              <Line text={r.text} max={30} style={{ fontSize: 36, fontWeight: 700, color: r.custom ? OG.mute : OG.soft }} />
              <Line text={r.label} style={{ fontSize: 26, fontWeight: 500, color: OG.mute, width: 170, justifyContent: 'flex-end', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* التوازن — لا يُقال إلّا حين يُعرف المعالج والكرت كلاهما */}
      {balance && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24, marginTop: 44, padding: '22px 34px', borderRadius: 28, border: `3px solid ${balance.color}`, background: `${balance.color}14` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Line text={balance.title} style={{ fontSize: 42, fontWeight: 700, color: balance.color }} />
            <Line text={balance.desc} style={{ fontSize: 28, fontWeight: 500, color: OG.soft }} />
          </div>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: balance.color }} />
        </div>
      )}

      </div>

      {/* القيمة — بإذن صاحبها */}
      {showPrice && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={riyal} width={62} height={69} />
            <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: OG.emerald, lineHeight: 1 }}>{formatTotal(card.total)}</div>
          </div>
          <Line text="لو تشتريه اليوم" style={{ fontSize: 34, fontWeight: 500, color: OG.mute }} />
        </div>
      )}

      {/* الدعوة */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 34, padding: '24px 36px', borderRadius: 999, background: '#FFFFFF10', border: `2px solid ${OG.line}` }}>
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, color: OG.cyan }}>tajme3ti.com</div>
        <Line text="سجّل جهازك واعرف وش يناسبه" style={{ fontSize: 34, fontWeight: 500, color: OG.soft }} />
      </div>
    </div>,
    { width: 1080, height: 1920, fonts },
  );

}
