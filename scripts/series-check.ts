/* ============ هل لكلّ قطعةٍ سلسلةٌ واحدة بالضبط؟ ============
 *
 * lib/series.ts يطابق بالاسم — وهذا يشغّله على الكتالوج الحقيقيّ:
 * صفرُ قطعٍ بلا سلسلة، وصفرُ قطعٍ بسلسلتين. **يقرأ ولا يكتب.**
 *
 *   npx tsx scripts/series-check.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { matchSeries, offerSeries, seriesBadge, seriesInfo, seriesLine, variantNotes, warrantyText } from '../lib/series';

const G = '\x1b[32m', R = '\x1b[31m', X = '\x1b[0m';
let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

let rowsAll: { brand: string; name: string }[] = [];

async function main() {
  rowsAll = await prisma.component.findMany({ where: { category: { name: 'PSU' } }, select: { brand: true, name: true } });
  for (const category of ['PSU', 'Motherboard', 'CPU', 'Storage', 'Case', 'Cooler', 'RAM']) {
    const rows = await prisma.component.findMany({ where: { category: { name: category } }, select: { brand: true, name: true }, orderBy: [{ brand: 'asc' }, { name: 'asc' }] });
    console.log(`\n${category} — ${rows.length} قطعة`);
    const none: string[] = [], many: string[] = [];
    for (const r of rows) {
      const m = matchSeries(r, category);
      if (m.length === 0) none.push(`${r.brand} ${r.name}`);
      else if (m.length > 1) many.push(`${r.brand} ${r.name} → ${m.map((s) => s.label).join(' + ')}`);
      else console.log(`    ${r.brand.padEnd(14)} ${r.name.padEnd(34)} ${seriesLine(m[0])}`);
    }
    check(`كلُّها لها سلسلة (${rows.length - none.length}/${rows.length})`, none.length === 0, none.join(' · '));
    check('ولا قطعة بسلسلتين', many.length === 0, many.join(' · '));
  }

  console.log('\nالقواعد');
  const s = (brand: string, name: string) => matchSeries({ brand, name }, 'PSU')[0];
  check('RMe ضمانها 7 لا 10 (صفحة المنتج تغلب الدليل العامّ)', s('Corsair', 'RM750e')?.warranty?.max === 7);
  check('RMx SHIFT لا تُحسب RMx', s('Corsair', 'RM850x Shift 850W Gold')?.label === 'RMx SHIFT');
  check('RM (2021) خارج السُّلَّم', !s('Corsair', 'RM850 (2021)')?.rank && !!s('Corsair', 'RM850 (2021)')?.offLadder);
  check('MSI A-DN بلا ضمان — لم تنشره الشركة', !s('MSI', 'MAG A600DN')?.warranty);
  check('الشركة تُطابق بلا اعتبار للحالة', s('corsair', 'RM750e')?.label === 'RMe');
  check('شركةٌ بلا سُلَّم ← لا درجة', !s('DeepCool', 'PL550D')?.rank && !s('DeepCool', 'PL550D')?.ladder);
  check('«12 سنة» · «7 سنوات» · مدى', warrantyText({ min: 12, max: 12 }) === '12 سنة' && warrantyText({ min: 7, max: 7 }) === '7 سنوات' && warrantyText({ min: 7, max: 10 }) === '7 إلى 10 سنوات');
  /* كانت RAM مثالها حتى صارت لها بيانات (2026-10-01) */
  check('فئةٌ بلا بيانات ← لا شيء', matchSeries({ brand: 'Corsair', name: 'Vengeance 32GB' }, 'Monitor').length === 0);

  console.log('\nاللوحات الأمّ');
  const mb = (brand: string, name: string) => matchSeries({ brand, name }, 'Motherboard')[0];
  /* كانت «X670E Carbon WiFi» بلا بادئة واحتاجت استثناءً؛ صُحّح الاسم (scripts/fix-mb-name-2026-09-29.mjs) */
  check('MPG X670E Carbon = MPG', mb('MSI', 'MPG X670E Carbon WiFi')?.label === 'MPG' && mb('MSI', 'MPG X670E Carbon WiFi')?.rank === 2);
  check('Gaming Plus خارج سُلَّم MSI', !mb('MSI', 'B650 Gaming Plus WiFi')?.rank && !!mb('MSI', 'B650 Gaming Plus WiFi')?.offLadder);
  check('MAG Tomahawk ليست Gaming', mb('MSI', 'MAG B650 TOMAHAWK WIFI')?.label === 'MAG');
  check('ASRock: Steel Legend وPro RS درجةٌ واحدة كما قالت', mb('ASRock', 'X670E Steel Legend')?.rank === 1 && mb('ASRock', 'B760M Pro RS')?.rank === 1);
  check('ROG Crosshair وStrix درجةٌ واحدة (ROG)', mb('ASUS', 'ROG Crosshair X670E Hero')?.rank === 3 && mb('ASUS', 'ROG Strix B650-A Gaming WiFi')?.rank === 3);
  check('MAX Gaming وProArt خارج سُلَّم ASUS', !mb('ASUS', 'B850 MAX GAMING WIFI W')?.rank && !mb('ASUS', 'ProArt X670E-Creator WiFi')?.rank);
  check('Gigabyte: لا سُلَّم، وضمان 3 سنوات', !mb('Gigabyte', 'B650M DS3H')?.ladder && mb('Gigabyte', 'B650M DS3H')?.warranty?.max === 3);
  check('ASUS: لا رقم ضمان، بل لفظها', !mb('ASUS', 'PRIME A620M-K')?.warranty && !!mb('ASUS', 'PRIME A620M-K')?.warrantyNote);
  check('ملاحظة الشريحة مع الدرجة فقط', !!mb('MSI', 'MEG Z790 ACE')?.ladderNote && !mb('Gigabyte', 'B650M DS3H')?.ladderNote && !mb('MSI', 'PRO B650M-A WiFi')?.ladderNote);
  check('لا تمسّ المزوّدات', !matchSeries({ brand: 'MSI', name: 'MAG A650BN' }, 'PSU')[0]?.ladderNote);
  const mbi = (brand: string, name: string) => (mb(brand, name)?.issues ?? []).map((i) => i.text.slice(0, 12));
  check('A620M-K: حدّ 120 واط + شريحة A620 + BIOS', mbi('ASUS', 'PRIME A620M-K').length === 3);
  check('TUF A620M-Plus: بلا حدّ 120', mbi('ASUS', 'TUF Gaming A620M-Plus WiFi').length === 2);
  check('ملاحظة الشريحة تعمّ الشركات: A620 عند MSI', mbi('MSI', 'PRO A620M-E').some((t) => t.startsWith('شريحة A620')));
  check('BIOS لوحات 600 فقط: B650 نعم، B850 وX870 لا', mbi('Gigabyte', 'B650M DS3H').length === 1 && mbi('MSI', 'B850 GAMING PLUS WiFi').length === 0 && mbi('Gigabyte', 'X870 AORUS Elite WiFi7').length === 0);
  check('H610 وH810 عند أربع شركات', mbi('ASRock', 'H610M-HDV/M.2+ D5').length === 1 && mbi('Gigabyte', 'H810M H').length === 1 && mbi('MSI', 'PRO H610M-G WiFi DDR4').length === 1 && mbi('ASUS', 'PRIME H610M-K D4').length === 1);
  check('لا تمسّ Intel B760 وZ790', mbi('MSI', 'PRO B760M-A WiFi').length === 0 && mbi('ASUS', 'Prime Z790-P WiFi').length === 0);
  check('ملاحظات الشرائح لا تمسّ المزوّدات', (matchSeries({ brand: 'Corsair', name: 'RM750e' }, 'PSU')[0]?.issues.length ?? 0) === 1);

  console.log('\nالمعالجات');
  const cpu = (brand: string, name: string) => matchSeries({ brand, name }, 'CPU')[0];
  const ci = (brand: string, name: string) => (cpu(brand, name)?.issues ?? []).map((i) => i.text);
  const vmin = (n: string) => ci('Intel', n).some((t) => t.startsWith('من معالجات الجيلين'));
  const exempt = (n: string) => ci('Intel', n).some((t) => t.startsWith('أعلنت Intel أنّ معالجات i5'));
  check('Vmin على الثمانية: i5 بـK وi7 وi9 من 13 و14', ['Core i5-13600KF', 'Core i5-14600K', 'Core i5-14600KF', 'Core i7-13700K', 'Core i7-14700', 'Core i7-14700K', 'Core i9-13900KS', 'Core i9-14900K'].every(vmin));
  check('والمستثناة رسمياً: i5 بلا K وi3 من 13 و14', ['Core i5-13400F', 'Core i5-14400F', 'Core i5-14500', 'Core i3-13100F', 'Core i3-14100F'].every((n) => exempt(n) && !vmin(n)));
  check('الجيل 12 خارج الاثنتين', !vmin('Core i5-12400F') && !exempt('Core i5-12400F') && !vmin('Core i7-12700K'));
  check('Core Ultra: غير متأثّرة بلفظ Intel', ci('Intel', 'Core Ultra 7 265K').length === 1 && !vmin('Core Ultra 7 265K'));
  check('احتراق 7000X3D على 7800X3D و7950X3D لا 9800X3D', ci('AMD', 'Ryzen 7 7800X3D').length === 1 && ci('AMD', 'Ryzen 9 7950X3D').length === 1 && ci('AMD', 'Ryzen 7 9800X3D').length === 0);
  check('لا سُلَّم ولا جملة «لم نجد»: الدرجة في الاسم', !cpu('AMD', 'Ryzen 7 7700')?.ladder && cpu('AMD', 'Ryzen 7 7700')?.tierInName === true);
  check('الضمان 3 سنوات ومعه لفظ العلبة', cpu('Intel', 'Core i5-14400F')?.warranty?.max === 3 && !!cpu('Intel', 'Core i5-14400F')?.warrantyNote && cpu('AMD', 'Ryzen 5 7600')?.warranty?.max === 3);
  check('خطّا Intel لا يتداخلان', matchSeries({ brand: 'Intel', name: 'Core Ultra 9 285K' }, 'CPU').length === 1 && matchSeries({ brand: 'Intel', name: 'Core i9-14900K' }, 'CPU').length === 1);

  console.log('\nكروت الشاشة');
  const gpus = await prisma.component.findMany({ where: { category: { name: 'GPU' } }, select: { brand: true, name: true, offers: { select: { variant: true } } } });
  const CHIP = ['NVIDIA', 'AMD', 'Intel'];
  const partners = gpus.filter((g) => !CHIP.includes(g.brand));
  const unmatchedP = partners.filter((g) => matchSeries(g, 'GPU').length !== 1).map((g) => `${g.brand} ${g.name} (${matchSeries(g, 'GPU').map((s) => s.label).join('+') || '—'})`);
  check(`صفوف الشركاء لكلٍّ سلسلةٌ واحدة (${partners.length - unmatchedP.length}/${partners.length})`, unmatchedP.length === 0, unmatchedP.join(' · '));
  const variants = [...new Set(gpus.flatMap((g) => g.offers.map((o) => o.variant)).filter(Boolean) as string[])];
  const noSeries = variants.filter((v) => !offerSeries(v, 'GPU'));
  console.log(`    نسخ العروض: ${variants.length}، بلا سلسلة: ${noSeries.join(' · ') || '—'}`);
  check('كلّ نسخةٍ مسمّاة لها سلسلة إلا مرجعيّة AMD', noSeries.every((v) => /^AMD reference$/i.test(v)));
  check('شارة ASUS TUF: «TUF Gaming · الدرجة 2 من 4»', seriesBadge(offerSeries('ASUS TUF OC', 'GPU')!) === 'TUF Gaming · الدرجة 2 من 4');
  check('شارة Gigabyte بلا درجة', seriesBadge(offerSeries('Gigabyte WINDFORCE OC SFF', 'GPU')!) === 'WINDFORCE' && seriesBadge(offerSeries('Gigabyte AORUS Master ICE', 'GPU')!) === 'AORUS');
  check('ASUS Dual خارج السُّلَّم', !offerSeries('ASUS Dual OC', 'GPU')?.rank);
  check('صفّ الشريحة العامّ بلا سلسلة: RTX 5070 ملاحظة الذاكرة وحدها', seriesInfo({ brand: 'NVIDIA', name: 'GeForce RTX 5070 12GB' }, 'GPU')?.notesOnly === true && seriesInfo({ brand: 'NVIDIA', name: 'GeForce RTX 5070 12GB' }, 'GPU')?.issues.length === 1);
  check('وRTX 5060 العامّ: لا شيء', seriesInfo({ brand: 'NVIDIA', name: 'GeForce RTX 5060' }, 'GPU') === null);
  check('وRTX 5090 العامّ: ملاحظة NVIDIA وحدها', seriesInfo({ brand: 'NVIDIA', name: 'GeForce RTX 5090 32GB' }, 'GPU')?.notesOnly === true);
  const hasRops = (b: string, n: string) => (seriesInfo({ brand: b, name: n }, 'GPU')?.issues ?? []).some((i) => i.text.includes('ROP'));
  check('وصفّ الشريك يحمل ROPs مع سلسلته: Astral 5090 وVentus 5070 Ti', hasRops('ASUS', 'ROG Astral RTX 5090 OC 32GB') && hasRops('MSI', 'GeForce RTX 5070 Ti 16G VENTUS 3X OC'));
  check('RTX 5070 Ti لا يُحسب 5070 (لا ROPs على 5070)', !hasRops('MSI', 'GeForce RTX 5070 12G VENTUS 2X OC'));
  check('XFX: ضمان 2 إلى 3 ومعه شرط التسجيل', offerSeries('XFX Speedster MERC 319', 'GPU')?.warranty?.min === 2 && !!offerSeries('XFX Speedster MERC 319', 'GPU')?.warrantyNote);
  const oi = (v: string, row: string) => (offerSeries(v, 'GPU', row)?.issues ?? []).map((i) => i.text);
  check('TUF على 5090: صاخبٌ افتراضياً · وعلى 5070: اختبارٌ نظيف', oi('ASUS TUF OC', 'GeForce RTX 5090 32GB').some((t) => t.startsWith('صاخبٌ')) && oi('ASUS TUF OC', 'GeForce RTX 5070 12GB').length === 0 && !!offerSeries('ASUS TUF OC', 'GPU', 'GeForce RTX 5070 12GB')?.cleanTest);
  check('معجون Gigabyte على RTX 50 لا RTX 40', oi('Gigabyte WINDFORCE OC SFF', 'GeForce RTX 5070 12GB').length === 1 && oi('Gigabyte WINDFORCE OC', 'GeForce RTX 4070 12GB').length === 0);
  check('Gigabyte Gaming OC على 5080: المعجون والاستهلاك · وعلى 3070 الصوت وحده (لا معجون RTX 50)', oi('Gigabyte Gaming OC', 'GeForce RTX 5080 16GB').length === 2 && oi('Gigabyte Gaming OC', 'GeForce RTX 3070 8GB').join() === 'ليس من أهدأ النسخ بحسب المراجع («could be quieter»).');
  const ct = (v: string, row: string) => offerSeries(v, 'GPU', row)?.cleanTest?.url ?? '';
  check('WINDFORCE: المبرّد الضعيف على 4060 وحده — لا 4060 Ti ولا 4070', oi('Gigabyte WINDFORCE OC', 'GeForce RTX 4060').some((t) => t.startsWith('مبرّده ضعيف')) && oi('Gigabyte WINDFORCE OC', 'GeForce RTX 4070 12GB').length === 0 && oi('Gigabyte WINDFORCE OC', 'GeForce RTX 4070 Ti SUPER').length === 0 && oi('Gigabyte WINDFORCE OC', 'GeForce RTX 4060 Ti').length === 0);
  check('MERC: صوت 7900 XTX · ونظيفٌ باختباره على 7800 XT و6800 XT', oi('XFX Speedster MERC 310', 'Radeon RX 7900 XTX').length === 1 && !offerSeries('XFX Speedster MERC 310', 'GPU', 'Radeon RX 7900 XTX')?.cleanTest && ct('XFX Speedster MERC 319', 'Radeon RX 7800 XT').includes('7800-xt') && ct('XFX Speedster MERC 319', 'Radeon RX 6800 XT').includes('6800-xt'));
  check('وMERC على 6700 XT لم تُختبر: لا حكم', !offerSeries('XFX Speedster MERC 319', 'GPU', 'Radeon RX 6700 XT 12GB')?.cleanTest);
  check('QICK نظيفٌ على 7700 XT وحده', ct('XFX Speedster QICK 319', 'Radeon RX 7700 XT').includes('7700-xt-qick') && !ct('XFX Speedster QICK 319', 'Radeon RX 7600 XT'));
  check('PULSE: 9060 XT بـ16GB نظيف · وبـ8GB لا', ct('Sapphire PULSE OC', 'Radeon RX 9060 XT 16GB').includes('9060-xt-pulse') && !ct('Sapphire PULSE OC', 'Radeon RX 9060 XT 8GB') && ct('Sapphire PULSE', 'Radeon RX 9070 XT').includes('9070-xt-pulse'));
  check('ZOTAC Solid Core ليست Solid ولا ترث اختبارها', offerSeries('ZOTAC Solid Core OC', 'GPU', 'GeForce RTX 5070 12GB')?.label === 'Solid Core' && !ct('ZOTAC Solid Core OC', 'GeForce RTX 5070 12GB') && !!ct('ZOTAC Solid OC', 'GeForce RTX 5070 12GB'));
  check('ونسخة العرض لا تكرّر ملاحظة الشريحة (ROPs)', !oi('Gigabyte AORUS Master ICE', 'GeForce RTX 5090 32GB').some((t) => t.includes('ROP')));
  const gi = (b: string, n: string) => (seriesInfo({ brand: b, name: n }, 'GPU')?.issues ?? []).map((i) => i.text);
  check('Astral الهوائيّ: الصوت · والمائيّ LC: المشعاع والمضخّة', gi('ASUS', 'ROG Astral RTX 5090 OC 32GB').some((t) => t.startsWith('ليس هادئاً')) && gi('ASUS', 'ROG Astral LC RTX 5090 OC 32GB').some((t) => t.startsWith('تبريدٌ مائيّ')) && !gi('ASUS', 'ROG Astral LC RTX 5090 OC 32GB').some((t) => t.startsWith('ليس هادئاً')));
  check('ذاكرة 12GB على RTX 5070 لا 5070 Ti', gi('NVIDIA', 'GeForce RTX 5070 12GB').some((t) => t.includes('12 جيجابايت')) && !gi('NVIDIA', 'GeForce RTX 5070 Ti 16GB').some((t) => t.includes('12 جيجابايت')));
  check('Ventus 5070 Ti: صاخبة · Ventus 5070: لا', gi('MSI', 'GeForce RTX 5070 Ti 16G VENTUS 3X OC').some((t) => t.startsWith('مروحته صاخبةٌ')) && !gi('MSI', 'GeForce RTX 5070 12G VENTUS 2X OC').some((t) => t.startsWith('مروحته')));
  const vn5070 = variantNotes('GeForce RTX 5070 12GB', [
    { variant: 'Gigabyte WINDFORCE OC SFF', store: { name: 'أمازون' } }, { variant: 'Gigabyte WINDFORCE OC SFF', store: { name: 'نون' } },
    { variant: 'ASUS TUF OC', store: { name: 'مايكرولس' } }, { variant: 'ZOTAC Solid OC', store: { name: 'ريد زون' } },
  ], 'GPU');
  check('ملاحظات نسخ RTX 5070 مجمّعةٌ بمتاجرها', vn5070.length === 3 && vn5070.find((v) => v.variant.startsWith('Gigabyte'))?.stores.join('،') === 'أمازون،نون');

  console.log('\nالملاحظات');
  const iss = (brand: string, name: string) => s(brand, name)?.issues ?? [];
  check('ملاحظة الموديل تخصّه: A850GL نعم، A750GL لا (عليه ملاحظة السلسلة وحدها)', iss('MSI', 'MAG A850GL PCIe 5').some((i) => i.text.startsWith('أداؤه')) && !iss('MSI', 'MAG A750GL PCIe 5').some((i) => i.text.startsWith('أداؤه')));
  check('ملاحظة السلسلة تعمّ: كلُّ RMe', ['RM750e', 'RM1000e', 'RM850e 850W ATX 3.1 Gold White'].every((n) => iss('Corsair', n).length === 1));
  check('الاستدعاء المنتهي موسوم', !!iss('Corsair', 'SF750 Platinum SFX')[0]?.resolved);
  check('ولا يعمّ SF850 — صدر بعد دفعات 2019-2020', iss('Corsair', 'SF850 Platinum SFX').length === 0);
  check('SHIFT: شرط التركيب رسميّ', iss('Corsair', 'RM850x Shift 850W Gold')[0]?.level === 'official');
  check('اختبارٌ نظيف يُقال بمصدره', !!s('be quiet!', 'Pure Power 13 M 850W')?.cleanTest && iss('be quiet!', 'Pure Power 13 M 850W').length === 0);
  check('لا ملاحظة بلا مصدر https', rowsAll.every((r) => (matchSeries(r, 'PSU')[0]?.issues ?? []).every((i) => i.sources.length > 0 && i.sources.every((x) => x.url.startsWith('https://')))));
  check('«متداول» غير مستعمل الآن', rowsAll.every((r) => (matchSeries(r, 'PSU')[0]?.issues ?? []).every((i) => i.level !== 'reported')));
  check('A850GL: ملاحظة السلسلة وملاحظته معاً', iss('MSI', 'MAG A850GL PCIe 5').length === 2 && iss('MSI', 'MAG A650GL').length === 1);
  check('A-BN: A550BN وA650BN نعم، A750BN PCIe 5 III لا', iss('MSI', 'MAG A550BN').length === 1 && iss('MSI', 'MAG A650BN').length === 1 && iss('MSI', 'MAG A750BN PCIe 5 III').length === 0);
  check('اختبار SF850 النظيف لا يُنسب لـSF750', !!s('Corsair', 'SF850 Platinum SFX')?.cleanTest && !s('Corsair', 'SF750 Platinum SFX')?.cleanTest);
  check('Power Zone 2 نظيف باختباره هو لا باختبار Pure Power', s('be quiet!', 'POWER ZONE 2 850W')?.cleanTest?.url.includes('power-zone-2') === true);
  /* الاختبار النظيف لا يجتمع مع ملاحظة اختبار — ويجتمع مع الرسميّة (شرط تركيب SHIFT) */
  check('ولا قطعة بملاحظة اختبارٍ واختبارٍ نظيفٍ معاً', rowsAll.every((r) => { const x = matchSeries(r, 'PSU')[0]; return !(x?.issues.some((i) => i.level === 'tested') && x?.cleanTest); }));
  check('SHIFT: الشرط الرسميّ والاختبار النظيف معاً', iss('Corsair', 'RM850x Shift 850W Gold')[0]?.level === 'official' && !!s('Corsair', 'RM850x Shift 850W Gold')?.cleanTest);
  const silent = rowsAll.filter((r) => { const x = matchSeries(r, 'PSU')[0]; return !x?.issues.length && !x?.cleanTest; });
  console.log(`    بلا شيء (لا اختبار مطابق): ${silent.map((r) => r.name).join(' · ')}`);
  const withIssues = rowsAll.filter((r) => (matchSeries(r, 'PSU')[0]?.issues.length ?? 0) > 0);
  console.log(`    ${withIssues.length} من ${rowsAll.length} مزوّداً عليه ملاحظة: ${withIssues.map((r) => r.name).join(' · ')}`);

  console.log('\nالتخزين');
  const st = (brand: string, name: string) => matchSeries({ brand, name }, 'Storage')[0];
  const sti = (brand: string, name: string) => (st(brand, name)?.issues ?? []).map((i) => i.text);
  const storage = await prisma.component.findMany({ where: { category: { name: 'Storage' } }, select: { brand: true, name: true } });
  check('لا «Western Digital» بعد التوحيد', !storage.some((r) => r.brand === 'Western Digital'));
  check('SN580: شاشة 24H2 على 2TB وحدها', sti('WD', 'Blue SN580 2TB').some((t) => t.includes('24H2')) && !sti('WD', 'Blue SN580 1TB').some((t) => t.includes('24H2')));
  check('SN770 1TB لا يرث شاشة 24H2 (تخصّ 2TB)', !sti('WD', 'Black SN770 1TB').some((t) => t.includes('24H2')));
  check('BarraCuda: SMR على 4TB و8TB وحدهما', sti('Seagate', 'BarraCuda 4TB HDD').length === 1 && sti('Seagate', 'BarraCuda 8TB HDD').length === 1 && sti('Seagate', 'BarraCuda 1TB HDD').length === 0 && sti('Seagate', 'BarraCuda 2TB HDD').length === 0);
  check('BarraCuda ضمانه سنتان · وFireCuda خمس', st('Seagate', 'BarraCuda 1TB HDD')?.warranty?.max === 2 && st('Seagate', 'FireCuda 530 2TB')?.warranty?.max === 5);
  check('Micron على كلّ Crucial', ['BX500 1TB SATA', 'P3 Plus 1TB NVMe', 'T705 2TB Gen5'].every((n) => sti('Crucial', n).some((t) => t.includes('Micron'))));
  check('BX500 بلا رقم ضمان ولا ملاحظة TBW (لم يُقرأ) · وP310 بهما', st('Crucial', 'BX500 1TB SATA')?.warranty === undefined && !st('Crucial', 'BX500 1TB SATA')?.warrantyNote && st('Crucial', 'P310 1TB')?.warrantyNote?.includes('TBW') === true);
  check('990 PRO: البرمجيّة رسميّة ومنتهية · و980 PRO بلا شيء', !!st('Samsung', '990 PRO 2TB')?.issues[0]?.resolved && sti('Samsung', '980 Pro 1TB').length === 0);
  check('SN850X: 1TB باسم الاختبار وحده · و2TB «على نسخة 1TB»', st('WD', 'Black SN850X 1TB')?.cleanTest?.name === "Tom's Hardware" && st('WD', 'Black SN850X 2TB')?.cleanTest?.name.includes('1TB') === true);
  check('Adata وXPG كلٌّ بخطّه', st('Adata', 'Legend 800 1TB')?.warranty?.max === 3 && st('XPG', 'GAMMIX S70 Blade 512GB')?.warranty?.max === 5);
  check('ولا قطعة تخزين بملاحظة اختبارٍ واختبارٍ نظيفٍ معاً', storage.every((r) => { const x = st(r.brand, r.name); return !(x?.issues.some((i) => i.level === 'tested') && x?.cleanTest); }));
  check('ولا ملاحظة تخزين بلا مصدر https', storage.every((r) => (st(r.brand, r.name)?.issues ?? []).every((i) => i.sources.length > 0 && i.sources.every((x) => x.url.startsWith('https://')))));

  console.log('\nالكيسات');
  const cs = (brand: string, name: string) => matchSeries({ brand, name }, 'Case')[0];
  const csi = (brand: string, name: string) => (cs(brand, name)?.issues ?? []).map((i) => i.text);
  const cases = await prisma.component.findMany({ where: { category: { name: 'Case' } }, select: { brand: true, name: true } });
  /* صفوفٌ روابطها لمنتجٍ غير المختبَر — لا شيء عليها (lib/series-case) */
  /* صفّان مراجعتهما لنسخةٍ غير المبيعة — لا شيء عليهما */
  const mixed: [string, string][] = [['Cooler Master', 'MasterBox NR200P V2'], ['Fractal Design', 'Meshify 3 White']];
  check('NR200P V2 وMeshify 3 بلا ملاحظة ولا اختبارٍ نظيف', mixed.every(([b, n]) => csi(b, n).length === 0 && !cs(b, n)?.cleanTest), mixed.filter(([b, n]) => csi(b, n).length || cs(b, n)?.cleanTest).map(([, n]) => n).join('، '));
  check('صفّ NR200P صار V2 في القاعدة', cases.some((r) => r.name === 'MasterBox NR200P V2') && !cases.some((r) => r.name === 'MasterBox NR200P'));
  /* وصُحّحت روابط الستّة (fix-case-offers-2026-10-01) فانطبقت مراجعاتها — على النسخة الصحيحة وحدها */
  check('GT502 الأصليّ بلا مراوح · لا PLUS ولا Horizon', csi('ASUS', 'TUF GT502').length === 1 && csi('ASUS', 'TUF GT502 Plus').length === 0 && csi('ASUS', 'TUF GT502 Horizon').length === 0);
  check('4000D Airflow عليه · وFRAME 4000D لا', csi('Corsair', '4000D Airflow').length === 1 && csi('Corsair', 'FRAME 4000D').length === 0);
  check('5000D Airflow وMeshify 2 نظيفان · وMeshify 2 Compact لا', !!cs('Corsair', '5000D Airflow')?.cleanTest && !!cs('Fractal Design', 'Meshify 2')?.cleanTest && !cs('Fractal Design', 'Meshify 2 Compact')?.cleanTest);
  check('H9 Flow (2023) عليه · وH9 Flow (2025) لا', csi('NZXT', 'H9 Flow').length === 1 && csi('NZXT', 'H9 Flow (2025)').length === 0);
  check('North XL: «Noisy» من Tom\'s يغلب نظافة TechPowerUp', csi('Fractal Design', 'North XL').length === 1 && !cs('Fractal Design', 'North XL')?.cleanTest);
  check('وMomentum بحدود السقف والكرت لا بصوت XL', csi('Fractal Design', 'North Momentum Edition (Black)').some((t) => t.includes('240')) && !csi('Fractal Design', 'North Momentum Edition (Black)').some((t) => t.includes('Noisy')));
  check('AIR 903: BASE نظيف · وMAX بتذبذب الصوت', !!cs('Montech', 'AIR 903 BASE White')?.cleanTest && csi('Montech', 'AIR 903 BASE White').length === 0 && csi('Montech', 'AIR 903 MAX White').length === 1 && !cs('Montech', 'AIR 903 MAX White')?.cleanTest);
  check('KING 65 PRO بلونيه · وSky One Lite بلا شيء', csi('Montech', 'KING 65 PRO').length === 1 && csi('Montech', 'KING 65 PRO White').length === 1 && csi('Montech', 'Sky One Lite ARGB').length === 0);
  check('Y70 وY70 Touch كلٌّ باختباره', cs('HYTE', 'Y70 Snow White')?.issues[0]?.sources[0].url.includes('hyte-y70/') === true && cs('HYTE', 'Y70 Touch')?.issues[0]?.sources[0].url.includes('y70-touch') === true);
  check('H6 Flow عليه · وH6 Compact لا', csi('NZXT', 'H6 Flow RGB White').length === 1 && csi('NZXT', 'H6 Compact White').length === 0);
  check('Lian Li سنةٌ واحدة بلفظها', cs('Lian Li', 'O11 Dynamic EVO')?.warranty?.max === 1 && !!cs('Lian Li', 'O11 Dynamic EVO')?.warrantyNote);
  check('ولا كيس بملاحظة اختبارٍ واختبارٍ نظيفٍ معاً', cases.every((r) => { const x = cs(r.brand, r.name); return !(x?.issues.some((i) => i.level === 'tested') && x?.cleanTest); }));
  check('ولا ملاحظة كيس بلا مصدر https', cases.every((r) => (cs(r.brand, r.name)?.issues ?? []).every((i) => i.sources.length > 0 && i.sources.every((x) => x.url.startsWith('https://')))));
  const withNotes = cases.filter((r) => csi(r.brand, r.name).length || cs(r.brand, r.name)?.cleanTest);
  console.log(`    ${withNotes.length} من ${cases.length} كيساً عليه ملاحظة أو اختبارٌ نظيف`);

  console.log('\nالمبرّدات');
  const co = (brand: string, name: string) => matchSeries({ brand, name }, 'Cooler')[0];
  const coi = (brand: string, name: string) => (co(brand, name)?.issues ?? []).map((i) => i.text);
  const coolers = await prisma.component.findMany({ where: { category: { name: 'Cooler' } }, select: { brand: true, name: true } });
  check('Phantom Spirit 120 EVO: الرامات والصوت · وVision EVO وSE بلا شيء', coi('Thermalright', 'Phantom Spirit 120 EVO').length === 1 && coi('Thermalright', 'Phantom Spirit 120 Vision EVO').length === 0 && coi('Thermalright', 'Phantom Spirit 120 SE ARGB').length === 0);
  check('Peerless Assassin 120 SE نظيف بلونيه، باسم النسخة المختبَرة', ['Peerless Assassin 120 SE ARGB', 'Peerless Assassin 120 SE ARGB White'].every((n) => co('Thermalright', n)?.cleanTest?.name.includes('بلا إضاءة') === true));
  check('GL360 V2 نظيف · وGL240 V2 لم يُختبر', !!co('Gamdias', 'Aura GL360 V2')?.cleanTest && !co('Gamdias', 'Aura GL240 V2')?.cleanTest);
  check('Kraken Plus المختلط بلا اختبار · وضمانه ستّ', !co('NZXT', 'Kraken Plus 360 RGB')?.cleanTest && coi('NZXT', 'Kraken Plus 360 RGB').length === 0 && co('NZXT', 'Kraken Plus 360 RGB')?.warranty?.max === 6);
  check('DeepCool: AG سنة · LE ثلاث · LT وMystique خمس', co('DeepCool', 'AG300')?.warranty?.max === 1 && co('DeepCool', 'LE360 V2')?.warranty?.max === 3 && co('DeepCool', 'LT360 ARGB')?.warranty?.max === 5 && co('DeepCool', 'Mystique 360 ARGB')?.warranty?.max === 5);
  check('Thermalright مدى 3 إلى 6 بلفظها', co('Thermalright', 'Frozen Notte 240 White ARGB V2')?.warranty?.min === 3 && co('Thermalright', 'Frozen Notte 240 White ARGB V2')?.warranty?.max === 6 && !!co('Thermalright', 'Frozen Notte 240 White ARGB V2')?.warrantyNote);
  check('ولا مبرّد بملاحظة اختبارٍ واختبارٍ نظيفٍ معاً', coolers.every((r) => { const x = co(r.brand, r.name); return !(x?.issues.some((i) => i.level === 'tested') && x?.cleanTest); }));
  const coolNotes = coolers.filter((r) => coi(r.brand, r.name).length || co(r.brand, r.name)?.cleanTest);
  console.log(`    ${coolNotes.length} من ${coolers.length} مبرّداً عليه ملاحظة أو اختبارٌ نظيف`);

  console.log('\nالرامات');
  const rm = (brand: string, name: string) => matchSeries({ brand, name }, 'RAM')[0];
  check('«مدى الحياة (محدود)» نصّاً', !!rm('Corsair', 'Vengeance DDR5 32GB 6000MHz')?.warranty && warrantyText(rm('Corsair', 'Vengeance DDR5 32GB 6000MHz')!.warranty!) === 'مدى الحياة (محدود)' && seriesLine(rm('Corsair', 'Vengeance DDR5 32GB 6000MHz')!).includes('مدى الحياة'));
  check('خروج Micron على رام Crucial — النصّ نفسه الذي في التخزين', rm('Crucial', 'Pro DDR5 32GB 5600MHz')?.issues[0]?.text === matchSeries({ brand: 'Crucial', name: 'P310 1TB' }, 'Storage')[0]?.issues.find((i) => i.text.includes('Micron'))?.text);
  check('TeamGroup: Delta بضمانه · وVulcan وElite بلا رقم', rm('TeamGroup', 'T-Force Delta RGB 32GB 6400MHz')?.warranty?.lifetime === true && !rm('TeamGroup', 'T-Force Vulcan 32GB DDR5 6000MHz')?.warranty && !rm('TeamGroup', 'Elite 16GB (2x8GB) 4800MHz')?.warranty);
  check('Renegade لا تُحسب Beast', rm('Kingston', 'Fury Renegade 48GB 7200MHz')?.label === 'FURY Renegade' && rm('Kingston', 'Fury Beast DDR5 32GB 6000MHz')?.label === 'FURY Beast');

  console.log(`\n${'═'.repeat(46)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
