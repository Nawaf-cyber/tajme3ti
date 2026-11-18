/**
 * 2026-11-18 — إكمال مواصفات الشاشات الناقصة (نوّاف: «راجع كل مواصفات الشاشات… وخلها جاهزة… إذا قلت لك ضيف»).
 *
 * الجرد (51 شاشة): الأساسيّات كاملة (المقاس، الدقّة، الهرتز، اللوحة، المنافذ، HDR). الناقص:
 * dsc ٤١ · usbC ٣٣ · speakers ١٧ · brightnessNits ٤ · dpUhbr ١ (LG 27GX790A، الوحيدة بـDP 2.1).
 * والجديد responseType (GtG/MPRT) لكلّ شاشة: رقم الاستجابة يُعلَن بطريقتين لا تُقارنان (IPS «1ms MPRT»
 * وOLED «0.03ms GtG») — كانت المقارنة تكتب «أعلى بـ 3233%».
 *
 * المصدر: scripts/data/monitor-specs-fill-2026-11-18.json — بحث أربعة وكلاء في صفحات الشركات ونشراتها
 * وأدلّتها (الدليل لكلّ قيمة في evidence). يُضاف الناقص فقط؛ والتصحيحات (corrections) لا تُطبَّق إلّا
 * المعتمدة في APPROVED_CORRECTIONS أدناه. ومعه توحيد أسماء VRR (تجميليّ).
 *
 *   node scripts/fill-monitor-specs-2026-11-18.mjs           # عرض
 *   node scripts/fill-monitor-specs-2026-11-18.mjs --apply   # نسخة احتياطيّة ثمّ كتابة
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, writeFileSync } from 'node:fs';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes('--apply');
const DATA = JSON.parse(readFileSync('scripts/data/monitor-specs-fill-2026-11-18.json', 'utf8'));

/** تصحيحاتٌ اعتُمدت بعد المراجعة: [معرّف القطعة، الحقل، القيمة] */
const APPROVED_CORRECTIONS = [
  /* AOC تكتب «FreeSync Premium» في جدول المواصفات */
  ['cmwgr5cxe001g3oym89scjzrb', 'vrr', 'FreeSync Premium'],
  /* Dell: 165 أصلاً و180 بالرفع — نسجّل الأصليّ (كما G2524H: 240 لا 280)؛ «شاشة تلائم كرتك» يقرأ الهرتز */
  ['cmwkd9mhq001gt0ymb391f8vk', 'refreshHz', '165'],
];
/** وسطر الوصف الأوّل الذي يذكر 180 كأنّه الأصليّ */
const DESC_FIX = [[
  'cmwkd9mhq001gt0ymb391f8vk',
  '4K بـ180 هرتز أو 1080p بـ360 هرتز.',
  '4K بـ165 هرتز (180 بالرفع) أو 1080p بـ330 هرتز (360 بالرفع).',
]];

const ALLOWED = {
  dsc: ['Yes', 'No'], usbC: ['Yes', 'No'], speakers: ['Yes', 'No'],
  dpUhbr: ['UHBR10', 'UHBR13.5', 'UHBR20'], responseType: ['GtG', 'MPRT'],
};
const VRR = {
  'Adaptive-Sync (FreeSync)': 'FreeSync · Adaptive-Sync',
  'FreeSync Premium Pro · VESA AdaptiveSync': 'FreeSync Premium Pro · Adaptive-Sync',
  'FreeSync Premium Pro · G-Sync Compatible · VESA AdaptiveSync': 'FreeSync Premium Pro · G-Sync Compatible · Adaptive-Sync',
};

const comps = await prisma.component.findMany({ where: { category: { name: 'Monitor' } }, select: { id: true, brand: true, name: true, specs: true, description: true } });
const byId = Object.fromEntries(comps.map((c) => [c.id, c]));
const plan = [];
let bad = false;
for (const d of DATA) {
  const c = byId[d.id];
  if (!c) { console.log(`⛔ لا شاشة ${d.id}`); bad = true; continue; }
  const sp = { ...c.specs };
  const changes = [];
  for (const [k, v] of Object.entries(d.add || {})) {
    if (ALLOWED[k] && !ALLOWED[k].includes(v)) { console.log(`⛔ ${c.name}: ${k}=${v}`); bad = true; continue; }
    if (k === 'brightnessNits' && !(+v > 50 && +v < 3000)) { console.log(`⛔ ${c.name}: سطوع ${v}`); bad = true; continue; }
    if (sp[k] != null && sp[k] !== '') continue; // الناقص فقط
    sp[k] = String(v); changes.push(`${k}=${v}`);
  }
  if (VRR[sp.vrr]) { changes.push(`vrr «${sp.vrr}» ← «${VRR[sp.vrr]}»`); sp.vrr = VRR[sp.vrr]; }
  for (const [id, k, v] of APPROVED_CORRECTIONS) if (id === d.id) { changes.push(`✎ ${k}: ${sp[k]} ← ${v}`); sp[k] = v; }
  let desc = null;
  for (const [id, from, to] of DESC_FIX) if (id === d.id) {
    if (!c.description.includes(from)) { console.log(`⛔ ${c.name}: نصّ الوصف تغيّر`); bad = true; } else { desc = c.description.replace(from, to); changes.push('الوصف: ' + to); }
  }
  if (changes.length) plan.push({ c, sp, changes, desc });
}
for (const p of plan) console.log(`＋ ${p.c.brand} ${p.c.name}: ${p.changes.join(' · ')}`);
const pending = DATA.flatMap((d) => (d.corrections || []).map((x) => `${byId[d.id]?.name}: ${x.field} عندنا ${x.ours} والشركة ${x.maker}`));
if (pending.length) console.log(`\nتصحيحاتٌ مقترحة تنتظر الاعتماد (${pending.length}):\n  ${pending.join('\n  ')}`);
console.log(`\n${plan.length} شاشة تتغيّر`);
if (bad || !apply) { console.log(bad ? '⛔ متوقّف' : '(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); process.exit(bad ? 1 : 0); }

const file = `backups/monitor-specs-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
writeFileSync(file, JSON.stringify(plan.map((p) => ({ id: p.c.id, specs: p.c.specs, description: p.desc ? p.c.description : undefined })), null, 1));
for (const p of plan) await prisma.component.update({ where: { id: p.c.id }, data: p.desc ? { specs: p.sp, description: p.desc } : { specs: p.sp } });
console.log(`نسخة: ${file}\n✔ حُدّثت ${plan.length} شاشة`);
await prisma.$disconnect();
