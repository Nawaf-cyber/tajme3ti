/**
 * ============ ثلاثة مفاتيح تنزل إلى «المزايا» ============
 *
 * `frontPanel` (٨ كيسات) و`sidePanel` (٧) و`cableManagement` (٢) — آخر ما
 * بقي خارج المخطّط. وسببُ إخراجها واحد: **تصف مظهراً لا بُعداً يُقاس**.
 * «Mesh» ليست أكبر ولا أصغر من «Tempered Glass»، و«RapidRoute» اسمٌ
 * تجاريّ لا يعني شيئاً لمن لا يعرف كورسير.
 *
 * وبقاؤها مفاتيح كان يَعِد الجدولَ بصفٍّ يقابله في كل قطعة، وسبعةٌ من ٢٧
 * تحمله — فيمتلئ الصفّ بالشرطات. والجملة لا تَعِد بشيء.
 *
 * ⚠️ والقيم تُترجَم لا تُنسخ: «Split Glass/Mesh» مفتاحاً كانت تُقرأ رمزاً،
 * وجملةً تُقرأ خبراً — «لوح جانبي نصفه زجاج ونصفه شبك». وهذا هو المكسب:
 * ما كان يحتاج معرفةً مسبقة صار يُقرأ كما هو.
 *
 *   npx tsx scripts/move-to-features.ts            # عرض
 *   npx tsx scripts/move-to-features.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import { FEATURES_KEY, readFeatures } from '../lib/spec-schema';
import 'dotenv/config';

/** القيمة الإنجليزية → الجملة العربية التي تحلّ محلّها */
const PHRASE: Record<string, Record<string, string>> = {
  frontPanel: {
    'Mesh': 'واجهة أمامية شبكية للتهوية',
    'Polygonal Mesh': 'واجهة أمامية شبكية مضلّعة',
    'High Airflow Mesh': 'واجهة أمامية شبكية عالية التدفّق',
    'High-Airflow Mesh': 'واجهة أمامية شبكية عالية التدفّق',
    'Real Wood': 'واجهة أمامية من خشبٍ حقيقي',
  },
  sidePanel: {
    'Tempered Glass': 'لوح جانبي من زجاج مقوّى',
    'Hinged Tempered Glass': 'لوح جانبي زجاجي بمفصّلة — يُفتح كالباب',
    'Split Glass/Mesh': 'لوح جانبي نصفه زجاج ونصفه شبك',
    'Glass or Vented': 'لوحان جانبيان في العلبة: زجاجيّ ومثقّب — تختار أيّهما',
    'Mesh': 'لوح جانبي مشبّك للتهوية',
    'Aluminum': 'لوح جانبي من ألمنيوم',
  },
  cableManagement: {
    'RapidRoute': 'نظام RapidRoute لتمرير الكابلات خلف اللوحة',
  },
};

const KEYS = Object.keys(PHRASE);

const parse = (s: unknown): Record<string, any> =>
  typeof s === 'string' ? JSON.parse(s) : ((s as any) || {});

async function main() {
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const rows = await prisma.component.findMany({
    select: { id: true, brand: true, name: true, specs: true },
  });

  const updates: { id: string; specs: any }[] = [];
  const unknown: string[] = [];
  let moved = 0;

  for (const r of rows) {
    const specs = { ...parse(r.specs) };
    const present = KEYS.filter((k) => k in specs);
    if (!present.length) continue;

    const features = [...readFeatures(specs)];
    const notes: string[] = [];

    for (const k of present) {
      const val = String(specs[k]).trim();
      const phrase = PHRASE[k][val];
      if (!phrase) { unknown.push(`${k}="${val}"  (${r.brand} ${r.name})`); continue; }
      if (!features.includes(phrase)) features.push(phrase);
      delete specs[k];
      moved++;
      notes.push(`${k}="${val}" → «${phrase}»`);
    }

    if (notes.length) {
      specs[FEATURES_KEY] = features;
      updates.push({ id: r.id, specs });
      console.log(`\n${r.brand} ${r.name}`);
      notes.forEach((n) => console.log(`   ↦ ${n}`));
    }
  }

  console.log(`\nقيم نُقلت: ${moved} · قطع تُحدَّث: ${updates.length}`);
  if (unknown.length) {
    console.log(`⛔ قيمٌ بلا جملة مقابلة (تُترجَم أوّلاً، ولا تُنسخ كما هي):`);
    unknown.forEach((u) => console.log(`   ${u}`));
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!apply) { console.log('\n(عرضٌ فقط — أضف --apply)'); await prisma.$disconnect(); return; }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  writeFileSync(`backups/features-before-${stamp}.json`,
    JSON.stringify(rows.filter((r) => updates.some((u) => u.id === r.id)), null, 2));
  for (const u of updates) await prisma.component.update({ where: { id: u.id }, data: { specs: u.specs } });
  console.log(`✔ حُدّثت ${updates.length} قطعة`);
  await prisma.$disconnect();
}

main();
