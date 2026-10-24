/**
 * ============ MSI PRO H610M-G WiFi DDR4 — مطابقة صفحة الشركة — 2026-10-24 ============
 *
 * طلب نوّاف: «تأكد من هذي المذربورد (بياناتها التقنية)». قُرئت صفحة المواصفات وقائمة المعالجات
 * في msi.com: الحقول العشرة كلّها مطابقة (و maxCpuTdpW = ١٥٠ من i9-14900KS أعلى القائمة).
 * والمختلف ثلاثة:
 *   - lan ناقص: المنفذ Intel I219V بسرعة 1 جيجابت.
 *   - «الواي فاي على منفذ M.2 من نوع E-key» لا تذكره MSI — المنفذ الوحيد عندها للتخزين (Key M).
 *     وبلوتوث 4.2 غائبٌ عن الوصف.
 *   - «مراحل طاقة أساسية لا تناسب i7 وi9» لا مصدر له: MSI لا تنشر عدد المراحل، وقائمتها الرسمية
 *     فيها ١٨ معالج i9. فحلّ محلّه ما تقوله الصفحة: لا Type-C، وأسرع منافذ USB بسرعة 5Gbps.
 *
 *   npx tsx scripts/fix-h610m-g-wifi-2026-10-24.ts           # عرض
 *   npx tsx scripts/fix-h610m-g-wifi-2026-10-24.ts --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';

const ID = 'cmsrkfc9y0004rcym0o63ae54';
const apply = process.argv.includes('--apply');

/* [القديم كما هو في القاعدة، الجديد] — المقطع المفقود خطأٌ يوقف التنفيذ */
const EDITS: [string, string][] = [
  [
    '[green]واي‑فاي مزدوج النطاق مدمج:[/green] 802.11ac على منفذ M.2 من نوع E-key مخصّص للشبكة.',
    '[green]واي‑فاي وبلوتوث مدمجان:[/green] Wi‑Fi 5 (802.11ac) على نطاقَي 2.4 و5 جيجاهرتز، وبلوتوث 4.2 للسمّاعات ويد التحكّم، ومعهما منفذ شبكة سلكية 1 جيجابت من Intel.',
  ],
  [
    '[green]تقبل الجيل 12 و13 و14:[/green] بما فيها معالجات Core i5 و i7.',
    '[green]تقبل الجيل 12 و13 و14:[/green] من Core i3 إلى i9، وأعلاها في قائمة MSI الرسمية i9-14900KS بقدرة 150 واط.',
  ],
  [
    '* مراحل طاقة أساسية — لا تناسب معالجات i7 وi9 تحت حمل طويل.',
    '* لا منفذ USB Type‑C، لا في الخلف ولا وصلة للواجهة الأمامية، وأسرع منافذها USB بسرعة 5Gbps.',
  ],
];

(async () => {
  const c = await prisma.component.findUnique({ where: { id: ID }, select: { id: true, name: true, specs: true, description: true } });
  if (!c || c.name !== 'PRO H610M-G WiFi DDR4') throw new Error(`القطعة غير موجودة أو تغيّر اسمها: ${c?.name}`);

  let desc = c.description ?? '';
  for (const [from, to] of EDITS) {
    const n = desc.split(from).length - 1;
    if (n !== 1) throw new Error(`المقطع موجود ${n} مرّة (المطلوب مرّة): ${from}`);
    desc = desc.replace(from, to);
  }
  if (/\*\*\[(green|yellow|red)\]/.test(desc)) throw new Error('نجومٌ حول وسم لون — يظهر الوسم خاماً');

  const specs = { ...(c.specs as Record<string, unknown>), lan: '1GbE' };
  console.log('lan:', (c.specs as any)?.lan ?? '—', '→', specs.lan);
  console.log('طول الوصف:', (c.description ?? '').length, '→', desc.length);
  for (const [from, to] of EDITS) console.log(`\n- ${from}\n+ ${to}`);

  if (apply) {
    writeFileSync(`backups/fix-h610m-g-wifi-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`, JSON.stringify(c, null, 2));
    await prisma.component.update({ where: { id: ID }, data: { specs, description: desc } });
    console.log('\nحُدّثت (نسخةٌ في backups/)');
  } else console.log('\n(عرضٌ فقط — أضف --apply)');
  await prisma.$disconnect();
})();
