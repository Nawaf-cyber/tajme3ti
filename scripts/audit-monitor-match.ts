/**
 * ============ تدقيق «شاشة تناسب كرتك» (lib/monitor-match) على الكتالوج الحيّ ============
 * لكلّ شريحةٍ في الكتالوج (بأوّل كرتٍ يحملها): الدقّة والإطارات والنطاق والاختيارات الثلاثة.
 * قراءةٌ فقط. يُراجَع الجدول قبل الواجهة (طلب نوّاف 2026-11-14).
 *
 *   npx tsx scripts/audit-monitor-match.ts [out.md]
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'node:fs';
import 'dotenv/config';
import { adviseMonitors, type MonitorLike } from '../lib/monitor-match';
import { gpuPerf } from '../lib/gpu-perf';

const spec = (s: any) => (typeof s === 'string' ? JSON.parse(s) : s || {});

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const mons = await prisma.component.findMany({
    where: { category: { name: 'Monitor' } },
    select: { id: true, brand: true, name: true, price: true, specs: true, offers: { select: { inStock: true, price: true } } },
  });
  const monitors: MonitorLike[] = mons.map((m) => ({
    id: m.id, brand: m.brand, name: m.name, price: m.price, specs: spec(m.specs),
    available: m.offers.some((o) => o.inStock && (o.price ?? 0) > 0),
  }));
  const gpus = await prisma.component.findMany({ where: { category: { name: 'GPU' } }, select: { name: true, specs: true }, orderBy: { price: 'asc' } });

  const seen = new Set<string>();
  const rows: string[] = [];
  const short = (m: MonitorLike) => `${m.brand} ${m.name.replace(/^(ROG Strix|TUF Gaming|UltraGear|Odyssey) /, '')}`;
  for (const g of gpus) {
    const s = spec(g.specs);
    const p = gpuPerf(g.name, Number(String(s.vram ?? '').replace(/\D/g, '')) || null);
    const key = p ? `${p.chip}|${s.vram}` : `—${g.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const a = adviseMonitors({ name: g.name, specs: s }, monitors);
    if (!a) { rows.push(`| ${g.name} | — | — | — | لا قياس للكرت | | |`); continue; }
    const cell = (role: string) => {
      const k = a.picks.find((x) => x.role === role);
      if (!k) return '—';
      const f = k.fit?.kind === 'full' ? '' : k.fit?.kind === 'dsc' ? ' ·DSC' : k.fit?.kind === 'dsc-unsure' ? ' ·DSC؟' : k.fit ? ` ·⚠${k.fit.maxHz}Hz` : '';
      return `${short(k.mon)} (${k.res} ${k.mon.specs.refreshHz}Hz ${k.mon.specs.panel}, ${Math.round(k.mon.price)})${f}`;
    };
    rows.push(`| ${p!.chip}${s.vram && /5060 TI|9060 XT|4060 TI|3060/.test(p!.chip) ? ' ' + s.vram : ''} | ${a.res} | ${Math.round(a.fps)} | ${a.band[0]}–${a.band[1]} | ${cell('best')} | ${cell('image')} | ${cell('alt')} |`);
  }
  const head = '| الكرت | الدقّة | إطاراته | الهرتز المناسب | الأنسب | صورة أفضل (OLED) | بديل |\n|---|---|---|---|---|---|---|';
  const md = `${head}\n${rows.join('\n')}`;
  console.log(md);
  console.log(`\n${rows.length} شريحة · ${monitors.filter((m) => m.available).length}/${monitors.length} شاشة متوفّرة`);
  if (process.argv[2]) writeFileSync(process.argv[2], md);
  await prisma.$disconnect();
}
main();
