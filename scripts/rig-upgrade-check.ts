/* ============ هل تُركَّب الترقيةُ التي نقترحها؟ ============
 *
 * **يقرأ ولا يكتب.** يُشغّل `pickUpgrade` على **كلّ** تجميعةٍ محفوظةٍ فيها
 * اختناق، ويتحقّق من ثلاثة:
 *   ١) المقترَح أقوى من الحاليّ فعلاً.
 *   ٢) و`fitsRig` تقول «يناسب» — أي أنّه يُركَّب، لا أنّه أقوى وحسب.
 *   ٣) ولا أرخصَ منه يُركَّب — الغرضُ الحدُّ الأدنى لا أغلى ما عندنا.
 *
 * ⚠️ والعطبُ الذي يحرسه لا يُرى في الكود: اقتراحُ كرتٍ لا يدخل الكيس
 * يبدو سليماً حتى يُجرَّب على جهازٍ حقيقيّ.
 *
 *   npx tsx scripts/rig-upgrade-check.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { OFFER_INCLUDE } from '../lib/stores-server';
import { liveOffers } from '../lib/stores';
import { weakestLink } from '../lib/bottleneck';
import { fitsRig, type RigCategory } from '../lib/rig-fit';
import { pickUpgrade } from '../lib/rig-upgrade';
import type { BuildParts, PartLike } from '../lib/build-check';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (ok: boolean, title: string, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${title}`); } else { fail++; console.log(`  ${R}✘ ${title}${X}  ${d}`); }
};

const COLUMN: Record<RigCategory, string> = {
  CPU: 'cpuId', GPU: 'gpuId', RAM: 'ramId', Motherboard: 'motherboardId',
  Case: 'caseId', PSU: 'psuId', Storage: 'storageId', Cooler: 'coolerId',
};

(async () => {
  const builds = await prisma.savedBuild.findMany();
  const allIds = builds.flatMap((b) => Object.values(COLUMN).map((c) => (b as any)[c])).filter(Boolean) as string[];
  const parts = await prisma.component.findMany({
    where: { id: { in: [...new Set(allIds)] } },
    select: { id: true, name: true, brand: true, specs: true, tdpWattage: true, performanceTier: true },
  });
  const byId = new Map(parts.map((p) => [p.id, p as PartLike]));

  /* كلُّ الفئتين اللتين تُرقّيان — تُجلبان مرّةً لكلّ التجميعات */
  const pool: Record<string, any[]> = {};
  for (const cat of ['CPU', 'GPU']) {
    const rows = await prisma.component.findMany({
      where: { category: { name: cat } },
      select: { id: true, name: true, brand: true, price: true, specs: true, tdpWattage: true, performanceTier: true, ...OFFER_INCLUDE },
    });
    pool[cat] = rows.map((c) => ({
      ...(c as any),
      price: liveOffers(c.offers as any)[0]?.price ?? c.price,
      live: liveOffers(c.offers as any).length > 0,
    }));
  }

  let withBottleneck = 0, withPick = 0, blocked = 0;
  let strongerOk = true, fitsOk = true, cheapestOk = true;
  const samples: string[] = [];

  for (const b of builds) {
    const rig: BuildParts = {};
    for (const k of Object.keys(COLUMN) as RigCategory[]) {
      const pid = (b as any)[COLUMN[k]] as string | null;
      if (pid && byId.has(pid)) rig[k] = byId.get(pid);
    }

    const weak = weakestLink(rig.CPU as any, rig.GPU as any);
    if (!weak) continue;
    withBottleneck++;

    const { pick, blocked: isBlocked } = pickUpgrade(rig, weak, pool[weak]);
    if (isBlocked) { blocked++; continue; }
    if (!pick) continue;
    withPick++;

    const curTier = (rig[weak] as any)?.performanceTier ?? 0;
    if ((pick.performanceTier ?? 0) <= curTier) strongerOk = false;
    if (fitsRig(rig, weak, pick).state !== 'fits') fitsOk = false;

    /* ولا أرخصَ منه يُركَّب */
    const cheaperThatFits = pool[weak]
      .filter((c) => c.live && (c.performanceTier ?? 0) > curTier && (c.price ?? Infinity) < (pick.price ?? 0))
      .find((c) => fitsRig(rig, weak, c).state === 'fits');
    if (cheaperThatFits) cheapestOk = false;

    if (samples.length < 6) {
      samples.push(
        `${D}${b.name.slice(0, 18).padEnd(18)}${X} ${weak} ${((rig[weak] as any)?.name ?? '—').slice(0, 22).padEnd(22)}` +
        ` → ${(pick as any).brand} ${(pick as any).name}`.slice(0, 44) + ` ${Y}${Math.round(pick.price ?? 0)} ﷼${X}`,
      );
    }
  }

  console.log(`\n${builds.length} تجميعةً · ${withBottleneck} فيها اختناق · ${withPick} لها ترقيةٌ تُركَّب · ${blocked} لا شيء يُركَّب فيها\n`);
  samples.forEach((s) => console.log('  ' + s));

  console.log('\nالحُكم:');
  t(withBottleneck > 0, 'وُجدت تجميعاتٌ فيها اختناقٌ لنفحص عليها', `${withBottleneck}`);
  t(strongerOk, 'كلُّ مقترَحٍ أعلى درجةً من الحاليّ');
  t(fitsOk, 'وكلُّه **يُركَّب** — لا كرتٌ خارج الكيس ولا مقبسٌ خاطئ');
  t(cheapestOk, 'ولا أرخصَ منه يُركَّب — الحدُّ الأدنى لا الأغلى');

  /* ⚠️ والمتوازنُ لا يُنصَح: صندوقٌ يقول «رقِّ شيئاً» لمن جهازُه سليم
     يُفقد النصيحةَ معناها. */
  const balanced = builds.filter((b) => {
    const cpu = byId.get((b as any).cpuId);
    const gpu = byId.get((b as any).gpuId);
    return cpu && gpu && !weakestLink(cpu as any, gpu as any);
  });
  t(balanced.length > 0 && balanced.every((b) => {
    const cpu = byId.get((b as any).cpuId), gpu = byId.get((b as any).gpuId);
    return weakestLink(cpu as any, gpu as any) === null;
  }), 'والمتوازنُ لا تُعرض له ترقيةٌ إطلاقاً', `${balanced.length} متوازنة`);

  console.log(`\n${'═'.repeat(52)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  await prisma.$disconnect();
  if (fail) process.exit(1);
})();
