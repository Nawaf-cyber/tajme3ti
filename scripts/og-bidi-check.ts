/**
 * فحصُ ترتيب السطر العربيّ لمولّد الصور (lib/og-bidi.ts).
 *
 *   npx tsx scripts/og-bidi-check.ts
 *
 * والفحصُ البصريّ الحقيقيّ هو الصورة نفسها: /build/<id>/opengraph-image.
 * هذا يحرس القواعد كي لا تنكسر بصمت.
 */
import { shape, rtlPieces, rtlLine, clip } from '../lib/og-bidi';

let failed = 0;
const hex = (s: string) => [...s].map((c) => c.codePointAt(0)!.toString(16).toUpperCase()).join(' ');
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`}`);
};
const u = (...cps: number[]) => String.fromCharCode(...cps);

/* الوصل */
eq('كرت: كـ أوّل، ـر أخير، ت منفصلة (الراء لا تصل بما بعدها)', hex(shape('كرت')), hex(u(0xfedb, 0xfeae, 0xfe95)));
eq('لا ← شكلٌ واحد', hex(shape('لا')), hex(u(0xfefb)));
eq('الأم: ا منفصلة، لأ منفصلة، م منفصلة', hex(shape('الأم')), hex(u(0xfe8d, 0xfef7, 0xfee1)));
eq('سلام: لام‑ألف أخيرة بعد السين', hex(shape('سلام')), hex(u(0xfeb3, 0xfefc, 0xfee1)));
eq('هـ: الهاء أوّليّة قبل التطويل', hex(shape('هـ')), hex(u(0xfeeb, 0x640)));
eq('الحركات تُحذف', hex(shape('كَرْت')), hex(shape('كرت')));
eq('الهمزة لا تصل', hex(shape('جزء')), hex(u(0xfe9f, 0xfeb0, 0xfe80)));

/* الترتيب المرئيّ */
const rev = (s: string) => [...shape(s)].reverse().join('');
eq('كلمتان تُعكسان', rtlLine('كرت الشاشة'), `${rev('الشاشة')} ${rev('كرت')}`);
eq('اللاتينيّ المتتالي كتلةٌ بترتيبها', rtlPieces('تجميعة RTX 5070 Ti').map((p) => p.text), ['RTX 5070 Ti', rev('تجميعة')]);
eq('التاريخ بعلامات الاتجاه: ٢٣/٩/٢٠٢٦ يُرى ٢٠٢٦/٩/٢٣ بلا مسافات',
  rtlLine('تجميعة ٢٣\u200F/٩\u200F/٢٠٢٦'), `٢٠٢٦/٩/٢٣ ${rev('تجميعة')}`);
eq('الفاصلة العربيّة على يسار كلمتها', rtlLine('الآخر، ١٤٤٨'), `١٤٤٨ ،${rev('الآخر')}`);
eq('القوس يُقلب', rtlLine('تجميعة (الرخص)'), `(${rev('الرخص')}) ${rev('تجميعة')}`);
eq('الشرطة بين عربيّتين قطعةٌ مستقلّة', rtlPieces('نواف — متوافقة').length, 3);
eq('اللاتينيّ الخالص كما هو', rtlPieces('Ab707'), [{ text: 'Ab707', gap: false }]);
eq('أوّلُ قطعةٍ يساراً بلا مسافة', rtlPieces('كرت الشاشة')[0].gap, false);

/* القصّ على الترتيب المنطقيّ: يبقى أوّلُ الاسم */
eq('القصّ يُبقي الأوّل ويضع …', clip('تجميعة الأحلام الكبرى للألعاب الثقيلة', 20), 'تجميعة الأحلام…');
eq('القصيرُ لا يُقصّ', clip('تجميعتي 1', 20), 'تجميعتي 1');

console.log(failed ? `\n✗ ${failed} فشل` : '\n✓ كلّها');
process.exit(failed ? 1 : 0);
