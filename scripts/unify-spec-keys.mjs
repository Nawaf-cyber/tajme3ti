/**
 * ============ توحيد مفاتيح المواصفات ============
 *
 * الكتالوج بُني على دفعتين بعُرفين مختلفين، والدليل أن الانقسام نصفيّ
 * بالضبط: 22 كرتاً تكتب `ports` و22 تكتب `Ports`. والنتيجة ليست جمالية:
 * محرّك التوافق يقرأ `lengthMm` و`vram` حصراً، فالقطعة التي تكتب `length`
 * أو `VRAM` **غير مرئية له** — تُستبعد من فحص طول الكرت بصمت.
 *
 * القاعدة: مفتاح واحد لكل معنى، camelCase، واسمٌ يقرؤه الكود لا العين.
 *
 * التشغيل:
 *   node scripts/unify-spec-keys.mjs           معاينة (لا كتابة)
 *   node scripts/unify-spec-keys.mjs --apply   التطبيق
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/* الاسم المعتمد ← كل صيغه المرصودة في القاعدة.
   لا اجتهاد وقت التشغيل: كل صيغة مكتوبة هنا صراحةً، وما لم يُذكر لا يُمسّ. */
const CANON = {
  GPU: {
    vram: ['VRAM'],
    lengthMm: ['length', 'Length'],
    memoryType: ['memory Type', 'Memory Type'],
    memoryBus: ['Memory Bus'],
    powerConnectors: ['Power Connectors'],
    interface: ['Interface'],
    ports: ['Ports'],
    architecture: ['Architecture'],
  },
  CPU: {
    boostClock: ['Boost Clock', 'BoostClock'],
    l3Cache: ['L3 Cache', 'L3Cache'],
    pCores: ['P-Cores', 'Performance-cores', 'performanceCores'],
    eCores: ['E-Cores', 'Efficient-cores', 'efficientCores'],
    integratedGraphics: ['Graphics'],
    architecture: ['Architecture'],
  },
  RAM: {
    capacity: ['Capacity'],
    speed: ['Speed'],
    kit: ['Kit'],
    casLatency: ['Cas Latency'],
    profile: ['Profile'],
    rgb: ['RGB'],
    color: ['Color'],
  },
  Case: {
    includedFans: ['Included Fans', 'Fans'],
    radiatorSupport: ['Radiator Support'],
    frontPanel: ['Front Panel'],
    sidePanel: ['Side Panels', 'Side Panel'],
    cableManagement: ['Cable Management'],
    verticalGpu: ['Vertical GPU', 'Vertical GPU Mount', 'GPU Mount'],
    dualChamber: ['Dual Chamber'],
    pcieRiser: ['PCIe Riser'],
    coolingModes: ['Cooling Modes'],
    design: ['Design'],
    airflow: ['Airflow'],
    screen: ['Screen'],
    storage: ['Storage'],
    glass: ['Glass'],
    handles: ['Handles'],
    color: ['Color'],
    modular: ['Modular'],
    acoustics: ['Acoustics'],
    /* ⚠️ «Form» ليست formFactor: Tower 300 يحمل الاثنين — «Micro-ATX Tower»
       هو الحجم الذي يطابق به المحرّك اللوحة، و«Vertical/Horizontal» وضعية
       العرض. دمجُهما كان سيمحو الحجم ويكسر فحص التوافق لهذا الصندوق. */
    orientation: ['Form'],
  },
  Motherboard: {},
  PSU: {},
  Storage: {},
};

/* ⚠️ الترتيب هنا **لا أثر له في القاعدة**: عمود specs من نوع Json وPostgres
   يخزّنه jsonb، وjsonb يعيد ترتيب المفاتيح بطول الاسم ثم أبجدياً ويتجاهل
   ترتيب الإدخال (تحقّقنا: أطوال المفاتيح تخرج تصاعدية دائماً).
   فترتيب العرض يُفرض وقت الرسم في lib/spec-labels (sortedSpecs)، ويبقى هذا
   هنا لأن الملف يقرؤه بشر — وليُبقى مصدراً واحداً للترتيب المقصود. */
const ORDER = {
  CPU: ['socket', 'cores', 'threads', 'baseClock', 'boostClock', 'l3Cache', 'pCores', 'eCores', 'integratedGraphics', 'memorySupport', 'architecture'],
  GPU: ['vram', 'memoryType', 'memoryBus', 'lengthMm', 'powerConnectors', 'interface', 'ports', 'architecture', 'formFactor'],
  Motherboard: ['socket', 'chipset', 'formFactor', 'ramType', 'maxRam', 'memorySpeed', 'm2Slots', 'pcieVersion'],
  RAM: ['type', 'capacity', 'kit', 'speed', 'casLatency', 'profile', 'rgb', 'color'],
  Storage: ['type', 'capacity', 'interface', 'formFactor', 'readSpeed', 'writeSpeed'],
  PSU: ['wattage', 'rating', 'modularity', 'formFactor'],
  Case: ['formFactor', 'maxGpuLength', 'includedFans', 'radiatorSupport', 'airflow', 'sidePanel', 'frontPanel', 'cableManagement', 'verticalGpu', 'dualChamber', 'pcieRiser', 'coolingModes', 'design', 'screen', 'glass', 'handles', 'storage', 'color', 'modular', 'acoustics'],
};

const parse = (s) => { try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { return {}; } };

const comps = await prisma.component.findMany({ include: { category: { select: { name: true } } } });

const conflicts = [];
const changes = [];

for (const c of comps) {
  const cat = c.category?.name || '';
  const map = CANON[cat];
  if (!map) continue;

  const src = { ...parse(c.specs) };
  const out = {};
  const renamed = [];

  /* ---- إنقاذ تركيبة الطقم قبل الدمج ----
   * قطعتان تكتبان السعة مرّتين: capacity="48GB" وCapacity="48GB (2x24GB)".
   * قاعدة «المعتمد يفوز» كانت ستُبقي «48GB» وتُسقط تركيبة الطقم — ومعلومة
   * «شريحتان × 24GB» ليست زخرفاً: عليها يتوقّف عدد فتحات الرام المشغولة
   * ومجال الترقية. فننقلها إلى مفتاحها الصحيح قبل أن تضيع. */
  if (cat === 'RAM' && !(src.kit ?? src.Kit)) {
    const rich = String(src.Capacity ?? '');
    const m = rich.match(/\(([^)]+)\)/);
    if (m) {
      src.kit = m[1];
      renamed.push(`أُنقذ الطقم من Capacity → kit = ${m[1]}`);
    }
  }

  // ١) نجمع كل صيغة إلى مفتاحها المعتمد
  const aliasOf = {};
  for (const [canon, aliases] of Object.entries(map)) for (const a of aliases) aliasOf[a] = canon;

  /* ============ القاعدة الحاكمة: التوحيد يُعيد التسمية ولا يغيّر قيمة ============
   * حين توجد الصيغتان معاً، **يفوز المفتاح المعتمد** لأن قيمته هي التي
   * يقرؤها الموقع اليوم — فلا يتغيّر أي سلوك بعد الترحيل.
   *
   * كانت القاعدة «أبقِ الأول» فكانت تُبقي «32GB GDDR7» بدل «32GB» في vram
   * (والنوع محفوظ في memoryType أصلاً) — أي أنها تغيّر قيمةً يقرؤها المحرّك.
   */
  for (const [k, v] of Object.entries(src)) {
    const target = aliasOf[k] || k;
    if (target !== k) renamed.push(`${k} → ${target}`);

    const isCanonicalSource = k === target;          // القيمة جاءت من المفتاح المعتمد نفسه
    const already = out[target];

    if (already !== undefined && String(already) !== String(v)) {
      if (isCanonicalSource) {
        // المعتمد وصل متأخّراً: يزيح ما كتبته صيغةٌ بديلة قبله
        conflicts.push({ cat, name: c.name, key: target, kept: v, dropped: already, winner: 'المعتمد' });
        out[target] = v;
      } else {
        conflicts.push({ cat, name: c.name, key: target, kept: already, dropped: v, winner: 'المعتمد' });
      }
      continue;
    }
    if (already === undefined) out[target] = v;
  }

  // ٢) نرتّبه بالترتيب المعتمد، والمفاتيح غير المذكورة تُلحق بآخره كما هي
  const order = ORDER[cat] || [];
  const ordered = {};
  for (const k of order) if (out[k] !== undefined) ordered[k] = out[k];
  for (const k of Object.keys(out)) if (ordered[k] === undefined) ordered[k] = out[k];

  /* المقارنة بمجموعة المفاتيح والقيم لا بترتيبها: القاعدة لا تحفظ الترتيب،
     فمقارنةُ نصّ JSON كانت تُبلّغ عن «٢٢٤ قطعة ستتغيّر» في كل تشغيلة وإن لم
     يبقَ شيء يُصلَح — إنذارٌ كاذب يُفقد الفاحص قيمته. */
  const flat = (o) => Object.keys(o).sort().map((k) => `${k}=${o[k]}`).join('|');
  if (flat(src) !== flat(ordered)) {
    changes.push({ id: c.id, cat, name: c.name, renamed, specs: ordered, reordered: renamed.length === 0 });
  }
}

console.log(`الوضع: ${APPLY ? '🔴 تطبيق' : '🟢 معاينة (لا كتابة)'}\n`);
console.log(`قطع ستتغيّر: ${changes.length} من ${comps.length}`);
console.log(`   منها إعادة تسمية : ${changes.filter((c) => c.renamed.length).length}`);
console.log(`   إعادة ترتيب فقط  : ${changes.filter((c) => c.reordered).length}`);

console.log('\n══ إعادة التسمية حسب الفئة ══');
const byCat = {};
for (const ch of changes) for (const r of ch.renamed) ((byCat[ch.cat] ||= {})[r] ||= 0), byCat[ch.cat][r]++;
for (const [cat, m] of Object.entries(byCat)) {
  console.log(`\n── ${cat}`);
  Object.entries(m).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log(`     ${String(n).padStart(3)} × ${r}`));
}

console.log(`\n══ تعارضات (الصيغتان بقيمتين مختلفتين): ${conflicts.length} ══`);
conflicts.forEach((c) => console.log(`   ${c.cat}/${c.name}: ${c.key} — أُبقيت «${c.kept}» وأُسقطت «${c.dropped}» (من ${c.from})`));

/* أثر مباشر يُقاس: كم قطعة صارت مرئية لمحرّك التوافق بعد التوحيد؟ */
const need = { GPU: ['lengthMm', 'vram'], CPU: ['socket'], Motherboard: ['socket', 'ramType'], Case: ['maxGpuLength'], PSU: ['wattage'], RAM: ['type', 'capacity'], Storage: ['type', 'capacity'] };
const missBefore = comps.filter((c) => (need[c.category?.name] || []).some((k) => parse(c.specs)[k] == null)).length;
const finalSpecs = new Map(comps.map((c) => [c.id, parse(c.specs)]));
changes.forEach((ch) => finalSpecs.set(ch.id, ch.specs));
const missAfter = comps.filter((c) => (need[c.category?.name] || []).some((k) => finalSpecs.get(c.id)[k] == null)).length;
console.log(`\n══ قطع ينقصها مفتاح يقرؤه محرّك التوافق ══`);
console.log(`   قبل: ${missBefore}  →  بعد: ${missAfter}`);

if (!APPLY) {
  console.log('\nمعاينة — لم يُكتب شيء. للتطبيق: node scripts/unify-spec-keys.mjs --apply');
} else {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.mkdirSync('backups', { recursive: true });
  const file = `backups/specs-before-unify-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(comps.map((c) => ({ id: c.id, name: c.name, specs: c.specs })), null, 1), 'utf8');
  console.log(`\nنسخة المواصفات قبل التعديل: ${file}`);
  for (const ch of changes) await prisma.component.update({ where: { id: ch.id }, data: { specs: ch.specs } });
  console.log(`✅ حُدِّثت ${changes.length} قطعة.`);
}

await prisma.$disconnect();
