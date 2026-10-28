/**
 * ============ صور كازاسوق بعد تغيير موقعهم — 2026-10-28 ============
 *
 * ٥٤ قطعة صورتُها على `static.cazasouq.com` — النطاق لا يردّ منذ غيّروا موقعهم (~2026-10-25)، ووسيطنا
 * يرجع 502، فالبطاقة تسقط إلى الصورة البديلة. وصفحة المنتج الجديدة تحمل صورته في og:image على مخزنهم
 * الجديد (`chqgmmjhrrcjwtnbhcpr.supabase.co/storage/v1/object/public/media-library/…`) — الصورة نفسها،
 * من النطاق الجديد. (والنطاق أُضيف إلى lib/image-hosts بعينه — لا `*.supabase.co`، وإلّا صار الوسيط
 * مفتوحاً لكلّ مشروع على supabase.)
 *
 * قُرئت og:image لصفحات ٥١ عرضاً في لوحة المتصفّح (طلبٌ عاديّ من نفس الموقع)، والملفّ:
 *   [componentId, httpStatus, og:type, og:image, og:title]
 * ولا يُكتب إلّا ما og:type فيه «product»، وما تُحمَّل صورته فعلاً (200 و image/*). ويُستثنى ما لم
 * يطابق اسمُه قطعتنا في قراءة الأسعار (scripts/cazasouq-browser-refresh-2026-10-28: C1000 Gold Core).
 *
 * ونُفّذ ثانيةً بأربع صور من أمازون (بالملفّ نفسه شكلاً) لقطعٍ بلا صفحة منتجٍ عندهم يُؤخذ منها:
 * 8700G (رابطه القديم يفتح صفحة فئة) وثلاثٍ بلا عرض كازاسوق أصلاً — وأمازون أوّل المصادر في
 * scripts/fetch-images.ts. قُرئت `#landingImage` (data-old-hires) من صفحاتها في المتصفّح وطابق عنوانُها القطعة.
 * وبقي C1000 Gold Core على صورته القديمة: لا أمازون له، ومايكرولس مستبعدٌ مصدراً للصور.
 *
 *   npx tsx scripts/cazasouq-images-2026-10-28.ts <readings.json>           # عرض وفحص
 *   npx tsx scripts/cazasouq-images-2026-10-28.ts <readings.json> --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { prisma } from '../lib/prisma';
import { imageHostAllowed } from '../lib/image-hosts';

type Row = [componentId: string, status: number | string, ogType: string | null, ogImage: string | null, ogTitle: string | null];

/* لم يطابق اسمُ صفحته قطعتَنا بيقين — صورةُ منتجٍ آخر أسوأ من صورةٍ بديلة */
const SKIP = new Set(['cmuzsa32o001nu8ymb4r6viqf']);

(async () => {
  const file = process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!file) throw new Error('مسار ملفّ القراءات مطلوب');
  const rows: Row[] = JSON.parse(readFileSync(file, 'utf8'));
  const comps = new Map((await prisma.component.findMany({ where: { id: { in: rows.map((r) => r[0]) } }, select: { id: true, name: true, imageUrl: true } })).map((c) => [c.id, c]));

  const plan: { id: string; name: string; from: string | null; to: string }[] = [];
  for (const [id, , type, img, title] of rows) {
    const c = comps.get(id);
    if (!c) { console.log(`⛔ لا قطعة ${id}`); continue; }
    if (SKIP.has(id)) { console.log(`· تُركت (مراجعة): ${c.name}`); continue; }
    if (type !== 'product' || !img) { console.log(`· تُركت (ليست صفحة منتج): ${c.name} — ${title}`); continue; }
    if (!imageHostAllowed(img)) { console.log(`⛔ نطاقٌ غير مسموح في lib/image-hosts: ${new URL(img).hostname}`); process.exit(1); }
    const res = await fetch(img, { method: 'HEAD' }).catch(() => null);
    const ct = res?.headers.get('content-type') || '';
    if (!res?.ok || !ct.startsWith('image/')) { console.log(`· تُركت (الصورة لا تُحمَّل ${res?.status ?? 'ERR'} ${ct}): ${c.name}`); continue; }
    plan.push({ id, name: c.name, from: c.imageUrl, to: img });
  }

  console.log(`\nتُحدَّث ${plan.length} صورة من ${rows.length}`);
  for (const p of plan.slice(0, 5)) console.log(`  ${p.name}\n    ${p.from}\n  → ${p.to}`);
  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  writeFileSync(`backups/cazasouq-images-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`, JSON.stringify(plan.map((p) => ({ id: p.id, imageUrl: p.from })), null, 2));
  for (const p of plan) await prisma.component.update({ where: { id: p.id }, data: { imageUrl: p.to } });
  console.log(`\nنُفّذ (النسخة في backups/)`);
  await prisma.$disconnect();
})();
