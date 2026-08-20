/* ============ رابطان يقودان إلى منتجٍ آخر ============
 *
 * فُحص كلٌّ منهما بفتح صفحته على أمازون وقراءة رقم الطراز في العنوان:
 *
 *   • «Blue SN580 1TB» يشير إلى `B0C8WP6B8R` = **WDS500G3B0E** — نصف
 *     السعة. والصحيح `B0C8XMH264` = WDS100T3B0E، وسعره هناك ٤٤٩ ﷼،
 *     أي نفس ما نعرضه — فالسعر كان صحيحاً والرابط وحده هو الكاذب.
 *
 *   • «P3 Plus 4TB» يشير إلى `B0B25P44CL` = **CT4000P3SSD8**، وهو
 *     P3 العاديّ لا P3 **Plus**: PCIe 3.0 بسرعة 3500 لا PCIe 4.0 بسرعة
 *     4800. منتجٌ مختلف، وصفحته نفسها «غير متوفّر» اليوم. ولا وجود
 *     لـ`CT4000P3PSSD8` على amazon.sa إطلاقاً، فلا رابطَ صحيحاً يُوضع
 *     مكانه — يُحذف العرض. ويبقى عرض مايكرولس (المنتج الصحيح، نافد).
 *
 * ⚠️ والسعر المخزّن على «P3 Plus 4TB» (٩٩٩ ﷼) مأخوذٌ من المنتج الخطأ.
 * لا يُلمس هنا: تغييره يمسّ مجاميع تجميعاتٍ محفوظة، وهو بندٌ مستقلّ.
 * يُطبع تنبيهاً كي لا يُنسى.
 *
 *   npx tsx scripts/fix-wrong-product-links.ts          (عرض فقط)
 *   npx tsx scripts/fix-wrong-product-links.ts --apply  (تنفيذ)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const CORRECT_SN580_1TB = 'https://www.amazon.sa/dp/B0C8XMH264';

async function main() {
  console.log(APPLY ? `\n${Y}وضع التنفيذ${X}` : `\n${D}عرض فقط — أضف --apply للتنفيذ${X}`);

  /* ١ — SN580 1TB: يُصحَّح الرابط */
  const sn = await prisma.component.findFirst({
    where: { name: { contains: 'SN580 1TB' } },
    select: { id: true, name: true, offers: { select: { id: true, url: true, price: true, store: { select: { name: true } } } } },
  });
  if (!sn) throw new Error('لم تُوجد Blue SN580 1TB');
  const snAmazon = sn.offers.find((o) => o.store.name === 'أمازون');
  if (!snAmazon) {
    console.log(`  ${Y}⚠${X} لا عرض أمازون على «${sn.name}» — لعلّه صُحّح سابقاً`);
  } else if (snAmazon.url === CORRECT_SN580_1TB) {
    console.log(`  ${G}✔${X} «${sn.name}» رابطه صحيح أصلاً`);
  } else {
    console.log(`\n«${sn.name}» — ${snAmazon.price} ﷼`);
    console.log(`  ${R}من:${X} ${snAmazon.url.slice(0, 90)}`);
    console.log(`  ${G}إلى:${X} ${CORRECT_SN580_1TB}`);
    if (APPLY) {
      await prisma.componentOffer.update({ where: { id: snAmazon.id }, data: { url: CORRECT_SN580_1TB } });
      console.log(`  ${G}✔ صُحّح${X}`);
    }
  }

  /* ٢ — P3 Plus 4TB: يُحذف عرض أمازون (منتجٌ آخر) */
  const p3 = await prisma.component.findFirst({
    where: { name: { contains: 'P3 Plus 4TB' } },
    select: { id: true, name: true, price: true, offers: { select: { id: true, url: true, price: true, store: { select: { name: true } } } } },
  });
  if (!p3) throw new Error('لم تُوجد P3 Plus 4TB');
  const p3Amazon = p3.offers.find((o) => o.store.name === 'أمازون');
  if (!p3Amazon) {
    console.log(`  ${G}✔${X} «${p3.name}» لا عرض أمازون عليها — حُذف سابقاً`);
  } else {
    console.log(`\n«${p3.name}» — عرض أمازون ${p3Amazon.price} ﷼`);
    console.log(`  ${R}يشير إلى CT4000P3SSD8 (P3 عاديّ، غير متوفّر) — يُحذف${X}`);
    if (APPLY) {
      await prisma.componentOffer.delete({ where: { id: p3Amazon.id } });
      console.log(`  ${G}✔ حُذف${X}`);
    }
  }

  /* الحالة بعد التنفيذ */
  if (APPLY) {
    const after = await prisma.component.findMany({
      where: { OR: [{ name: { contains: 'SN580 1TB' } }, { name: { contains: 'P3 Plus 4TB' } }] },
      select: { name: true, price: true, offers: { select: { url: true, price: true, inStock: true, store: { select: { name: true } } } } },
    });
    console.log(`\n${'─'.repeat(46)}\nبعد التنفيذ:`);
    for (const c of after) {
      console.log(`\n${c.name}  (${c.price} ﷼ مخزّن)`);
      if (!c.offers.length) console.log(`   ${D}لا عروض${X}`);
      for (const o of c.offers) console.log(`   ${o.store.name}: ${o.price ?? '—'} ﷼  ${D}${o.url.slice(0, 70)}${X}`);
    }
    console.log(`\n${Y}تنبيه:${X} سعر «P3 Plus 4TB» المخزّن (٩٩٩ ﷼) جاء من المنتج الخطأ، ولم يُلمس.`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
