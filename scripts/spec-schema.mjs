/**
 * يستخرج «عقد المواصفات» الفعلي من الكتالوج: أي مفاتيح تحملها كل فئة،
 * ونسبة امتلائها، والقيم المستعملة فعلاً — كي تُضاف القطع الجديدة بنفس
 * الصيغة حرفياً بدل تخمينها.
 *
 * التشغيل:  node scripts/spec-schema.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const cats = await prisma.category.findMany({
  include: { components: { select: { specs: true, tdpWattage: true, performanceTier: true, description: true, imageUrl: true } } },
});

for (const cat of cats) {
  const comps = cat.components;
  if (!comps.length) continue;
  console.log(`\n══════════ ${cat.name} (${comps.length} قطعة) ══════════`);
  console.log(`id الفئة: ${cat.id}`);

  const keys = new Map(); // key → {count, values:Set}
  for (const c of comps) {
    const s = typeof c.specs === 'string' ? JSON.parse(c.specs || '{}') : c.specs || {};
    for (const [k, v] of Object.entries(s)) {
      if (!keys.has(k)) keys.set(k, { count: 0, values: new Set() });
      const e = keys.get(k);
      e.count++;
      if (e.values.size < 8) e.values.add(String(v));
    }
  }

  const sorted = [...keys.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log('\nمفاتيح المواصفات:');
  for (const [k, e] of sorted) {
    const pct = Math.round((e.count / comps.length) * 100);
    const flag = pct === 100 ? '● إلزامي' : pct >= 60 ? '◐ شائع  ' : '○ نادر  ';
    console.log(`  ${flag} ${k.padEnd(16)} ${String(pct).padStart(3)}%  مثال: ${[...e.values].slice(0, 4).join(' · ')}`);
  }

  // الحقول خارج specs
  const tdp = comps.filter((c) => c.tdpWattage > 0).length;
  const tier = comps.filter((c) => c.performanceTier != null).length;
  const desc = comps.filter((c) => (c.description || '').length > 30).length;
  const img = comps.filter((c) => c.imageUrl).length;
  const p = (n) => `${Math.round((n / comps.length) * 100)}%`;
  console.log(`\nحقول أخرى: tdpWattage ${p(tdp)} · performanceTier ${p(tier)} · description ${p(desc)} · imageUrl ${p(img)}`);
}

await prisma.$disconnect();
