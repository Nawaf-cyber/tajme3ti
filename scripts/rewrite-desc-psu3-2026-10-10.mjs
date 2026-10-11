/**
 * ============ اسم بديلٍ تغيّر: RM850 (2021) White — 2026-10-10 ============
 *
 * fix-mislinks-psu-2026-10-10 سمّى RM850 (2021) باسمه الحقيقيّ «RM850 (2021) White» (عرضاه كلاهما أبيض).
 * ثلاثة أوصافٍ تشير إليه بديلاً بالاسم القديم — يُحدَّث نصّ الرابط فقط، والأسباب كما هي.
 *
 *   node scripts/rewrite-desc-psu3-2026-10-10.mjs           # عرض
 *   node scripts/rewrite-desc-psu3-2026-10-10.mjs --apply   # تنفيذ (نسخة احتياطية أوّلاً)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const TAG = 'psu3';

const alt = (name, id, ...why) => `---\nبإمكانك التوجه إلى [${name}](/components/${id}) إذا كان توجهك يتركز على الآتي:\n${why.map((w) => `* ${w}`).join('\n')}`;

const L = '(/components/cmpfzir17000bx4ymjufo8pu8)';
const REWRITE = [
  { id: 'cmpieb9ip000z00ym8x341l21', edits: [[`[RM850 (2021)]${L}`, `[Corsair RM850 (2021) White]${L}`]] },
  { id: 'cmpi5h9s2000704l1iq4czxdf', edits: [[`[Corsair RM850 (2021)]${L}`, `[Corsair RM850 (2021) White]${L}`]] },
  { id: 'cmpiechx3004c00ym99yztzmk', edits: [[`[RM850 (2021)]${L}`, `[Corsair RM850 (2021) White]${L}`]] },
];
// ---------------------------------------------------------------- التنفيذ
const backup = [];
let bad = 0;
for (const r of REWRITE) {
  const c = await prisma.component.findUnique({ where: { id: r.id }, select: { id: true, name: true, description: true, specs: true } });
  if (!c) { console.log(`✗ ${r.id} غير موجود`); bad++; continue; }
  /* edits: استبدالاتٌ نصّيّة دقيقة [قديم، جديد] — لشرح بندٍ أخضر عارٍ أو إضافة نقطة، بلا إعادة كتابة الوصف كلّه */
  const missing = [];
  let base = c.description.trimEnd();
  if (r.edits) { for (const [a, b] of r.edits) { if (!base.includes(a)) missing.push(a.slice(0, 40)); base = base.replace(a, b); } r.description = base; }
  /* وصفٌ غنيّ ينقصه رابط الشركة وحده: يُلحق الرابط، أو يُنظَّف سطره الأخير، بلا إعادة كتابة */
  if (r.append) r.description = base + '\n' + r.append;
  if (r.trimLast) r.description = base.split('\n').map((l, i, a) => (i === a.length - 1 ? l.replace(/^موقع الشركة الرسمي:\s*/, '').trim() : l)).join('\n');
  /* url: يستبدل سطر الرابط الأخير (أو يُلحقه إن لم يكن) — لرابطٍ مكسور أو بذيل تتبّع */
  if (r.url) { const ls = base.split('\n'); if (/^https?:\/\//.test(ls[ls.length - 1].trim())) ls.pop(); r.description = [...ls, r.url].join('\n'); }
  const d = r.description;
  const errs = missing.map((m) => `مقطعٌ غير موجود «${m}»`);
  if (/\*\*\[(yellow|red)/.test(d)) errs.push('نجوم حول وسم اللون');
  if (!/^https?:\/\/\S+$/.test(d.trim().split('\n').pop())) errs.push('السطر الأخير ليس رابطاً');
  if (!d.startsWith('### ')) errs.push('لا عنوان');
  for (const m of d.matchAll(/\]\(\/components\/([a-z0-9]+)\)/g)) {
    if (!(await prisma.component.findUnique({ where: { id: m[1] }, select: { id: true } }))) errs.push(`بديلٌ مفقود ${m[1]}`);
  }
  /* force: تصحيحُ بياناتٍ في وصفٍ قديمٍ أطولَ بحشوٍ أو بمعلومةٍ خاطئة — الطول هنا ليس المقياس */
  if (!r.trimLast && !r.url && !r.force && d.length <= (c.description || '').length) errs.push(`ليس أطول (${d.length} ≤ ${c.description.length})`);
  console.log(`${errs.length ? '✗' : '✔'} ${c.name}: ${(c.description || '').length} → ${d.length}${r.specs ? ' + مواصفات ' + JSON.stringify(r.specs) : ''}${errs.length ? '  ⟵ ' + errs.join('، ') : ''}`);
  if (errs.length) bad++;
  backup.push(c);
}
if (bad) { console.log(`\n${bad} خطأ — لم يُنفَّذ شيء`); process.exit(1); }
if (apply) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  writeFileSync(`backups/desc-${TAG}-${stamp}.json`, JSON.stringify(backup, null, 2));
  for (const r of REWRITE) {
    const c = backup.find((b) => b.id === r.id);
    const specs = r.specs ? { ...(typeof c.specs === 'string' ? JSON.parse(c.specs) : c.specs), ...r.specs } : undefined;
    await prisma.component.update({ where: { id: r.id }, data: { description: r.description, ...(specs ? { specs } : {}) } });
  }
  console.log(`\nنُفّذ ${REWRITE.length} — النسخة في backups/desc-${TAG}-${stamp}.json`);
} else console.log(`\n${REWRITE.length} وصفاً — (عرضٌ فقط — أضف --apply)`);
await prisma.$disconnect();
