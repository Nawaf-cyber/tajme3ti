/* ============ قياس التباين والمقاسات في المتصفّح ============
 *
 * يُلصَق في وحدة تحكّم المتصفّح (أو يُنفَّذ عبر أداة الصفحة) فيُعيد:
 *   sub12  — نصوصٌ دون ١٢ بكسل
 *   low    — نصوصٌ دون AA (٤٫٥ للعادي، ٣ للكبير: ≥٢٤ بكسل أو ≥١٨٫٦٦ عريض)
 *   skipped— ما تعذّر قياسه بصدق فلم يُحسب نجاحاً ولا فشلاً
 *
 * ⚠️ ثلاثة أفخاخٍ أوقعتني في قياسٍ كاذب، ومكتوبةٌ هنا كي لا تتكرّر:
 *
 * ١) **الشفافية**: طليُ كل لونٍ فوق أسودَ معتم يجعل `getImageData` يعيد
 *    alpha=1 دائماً — فيُحسب أولُ سلفٍ شفّاف خلفيةً سوداء. الصحيح: الطلي
 *    على لوحةٍ ممسوحة لتُقرأ الشفافية الحقيقية، ثم تركيب الطبقات بالترتيب.
 *
 * ٢) **النصّ المتدرّج** (`bg-clip-text text-transparent`): لونه المحسوب
 *    شفّافٌ تماماً، فيساوي الخلفية وتخرج النسبة ١٫٠٠. لا يُقاس هكذا.
 *
 * ٣) **الخلفية المتدرّجة**: لونها في `background-image` لا في
 *    `background-color`، فتُقرأ الخلفية شفّافةً ويُقفز إلى ما فوقها.
 *
 * ونطاقه من `window.__A11Y_SCOPE` (مثلاً `'body *'`)، و**يُشغَّل في الوضعين**:
 * فحصُ الداكن وحده أعطى ٥ ملاحظاتٍ على الرئيسية بينما الفاتح فيه ١٦٢.
 */

(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
  const over = (fg, bg) => fg[3] >= 0.999 ? fg : [0,1,2].map(i => fg[i]*fg[3] + bg[i]*(1-fg[3])).concat([1]);
  const lum = ([r,g,b]) => { const f = (v) => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const ratio = (a,b) => { const [l1,l2] = [lum(a),lum(b)].sort((x,y)=>y-x); return (l1+.05)/(l2+.05); };
  const bgOf = (el) => {
    const layers = []; let n = el, grad = false;
    while (n && n !== document.documentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none' && /gradient/.test(s.backgroundImage)) grad = true;
      const c = rgba(s.backgroundColor); if (c[3] > 0.001) layers.push(c);
      if (c[3] >= 0.999) break; n = n.parentElement;
    }
    if (!layers.length || layers[layers.length-1][3] < 0.999) layers.push(rgba(getComputedStyle(document.documentElement).backgroundColor || '#fff'));
    return { rgb: layers.reverse().reduce((base, l) => over(l, base), [255,255,255,1]), grad };
  };
  const sub12 = [], low = [], skipped = [];
  for (const el of document.querySelectorAll(window.__A11Y_SCOPE || 'main *')) {
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (!t) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) continue;
    if (!el.getClientRects().length) continue;
    const px = parseFloat(s.fontSize), w = parseInt(s.fontWeight) || 400;
    if (px < 12) sub12.push([t.slice(0,25), px]);
    const fg = rgba(s.color);
    if (fg[3] < 0.05) { skipped.push([t.slice(0,20), 'نص متدرّج']); continue; }
    const bg = bgOf(el);
    if (bg.grad) { skipped.push([t.slice(0,20), 'خلفية متدرّجة']); continue; }
    const r = ratio(over(fg, bg.rgb), bg.rgb);
    const largeOK = px >= 24 || (px >= 18.66 && w >= 700);
    if (r < (largeOK ? 3 : 4.5)) low.push([t.slice(0,24), px, w, +r.toFixed(2)]);
  }
  const de = document.documentElement;
  return { theme: de.classList.contains('dark') ? 'dark' : 'light', w: innerWidth, sub12, low, skipped, overflow: de.scrollWidth - de.clientWidth };
})()
