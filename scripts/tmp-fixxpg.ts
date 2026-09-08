import 'dotenv/config';
import { prisma } from '../lib/prisma';
(async () => {
  const c = await prisma.component.findFirst({
    where: { name: { contains: 'ARMAX' } },
    select: { id: true, name: true, price: true, offers: { select: { id: true, url: true, price: true, inStock: true, store: { select: { slug: true } } } } },
  });
  console.log(`قبل: السعر ${c!.price} · ${c!.offers.length} عروض`);

  /* العرضان لمنتجين آخرين: ARMAX 5600 و Lancer 6400 — وقطعتنا ARMAX 6000.
     ولا بديل صحيحاً في المتجرين (كلاهما يبيع 5600 و6400 فقط). */
  const wrong = c!.offers.filter((o) => o.store.slug === 'amazon' || o.store.slug === 'cazasouq');
  for (const o of wrong) {
    await prisma.componentOffer.delete({ where: { id: o.id } });
    console.log(`   حُذف [${o.store.slug}] ${o.price}﷼`);
  }

  const left = await prisma.componentOffer.findMany({
    where: { componentId: c!.id }, select: { price: true, inStock: true },
  });
  const live = left.filter((o) => o.inStock && (o.price ?? 0) > 0).map((o) => o.price!);
  if (live.length) {
    const min = Math.min(...live);
    await prisma.component.update({ where: { id: c!.id }, data: { price: min } });
    console.log(`\nبعد: السعر ${min} · ${left.length} عرض`);
  }
  await prisma.$disconnect();
})();
