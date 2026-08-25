/* ============ إصلاح ما أثبته الفحص ============
 *
 * `scripts/audit-offer-links.ts` أنذر بأربعة، وثبت اثنان بعد فتح
 * الصفحات — والاثنان الآخران كانا كذبَ نصِّ المتجر لا خطأَ رابطنا
 * (`sx6000…256gb…512gt` و`dominator…64gb…cmp48gx5`).
 *
 * ١) «Ryzen 5 9600x» عند كازاسوق يشير إلى `amd-ryzen-7-9600x-cpu-21944`
 *    — وفُتح: **يُعيد التوجيه إلى الصفحة الرئيسية**، لا منتجَ خلفه.
 *    والصحيح `amd-ryzen-5-9600x-tray-cpu-33423` (BHD 91 = ٩١٠ ﷼).
 *
 *    ⚠️ وهو **Tray** لا Boxed: بلا علبةٍ ولا مبرّدٍ مرفق. يُسجَّل لأنه
 *    نفس المعالج، وسعره أغلى من أمازون (٧٩٠) فلا يغيّر السعر المعروض —
 *    لكنه شاهدٌ ثانٍ، وهو ما ينقصنا.
 *
 * ٢) «Z790 Steel Legend WiFi» عند مايكرولس بـ`http://` — يُرقّى إلى
 *    `https://`. رابطٌ غير مشفّر يُعرّض لإعادة توجيهٍ في الطريق.
 *
 *   npx tsx scripts/fix-audited-links.ts          (عرض فقط)
 *   npx tsx scripts/fix-audited-links.ts --apply  (تنفيذ)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

const FIXES: { part: string; store: string; from: string; to: string; why: string }[] = [
  {
    part: 'Ryzen 5 9600x', store: 'cazasouq',
    from: 'https://www.cazasouq.com/amd-ryzen-7-9600x-cpu-21944?search=Ryzen%205%209600x',
    to: 'https://www.cazasouq.com/amd-ryzen-5-9600x-tray-cpu-33423',
    why: 'الرابط القديم يُعيد التوجيه إلى الرئيسية — لا منتجَ خلفه',
  },
  {
    part: 'Z790 Steel Legend WiFi', store: 'microless',
    from: 'http://saudi.microless.com/product/asrock-z790-steel-legend-wifi-lga1700-atx-motherboard-intel-z790-chipset-4x-2-channel-ddr5-128gb-max-realtek-2-5g-lan-1-pcie-5-0-x16-1x-hdmi-2-1-dp-1-2-usb-3-2-2-0-90-mxbkd0-a0uayz/',
    to: 'https://saudi.microless.com/product/asrock-z790-steel-legend-wifi-lga1700-atx-motherboard-intel-z790-chipset-4x-2-channel-ddr5-128gb-max-realtek-2-5g-lan-1-pcie-5-0-x16-1x-hdmi-2-1-dp-1-2-usb-3-2-2-0-90-mxbkd0-a0uayz/',
    why: 'http غير مشفّر → https',
  },
];

async function main() {
  console.log(APPLY ? `\n${Y}وضع التنفيذ${X}` : `\n${D}عرض فقط — أضف --apply للتنفيذ${X}`);

  let done = 0, skip = 0;
  for (const f of FIXES) {
    const offer = await prisma.componentOffer.findFirst({
      where: { component: { name: f.part }, store: { slug: f.store }, url: f.from },
      select: { id: true, url: true, price: true, component: { select: { name: true } }, store: { select: { name: true } } },
    });
    if (!offer) {
      skip++;
      console.log(`  ${D}—${X} «${f.part}» عند ${f.store}: لا عرضَ برابطٍ مطابق (صُحّح سابقاً؟)`);
      continue;
    }
    console.log(`\n«${offer.component.name}» · ${offer.store.name}`);
    console.log(`  ${D}${f.why}${X}`);
    console.log(`  ${R}من:${X}  ${f.from.slice(0, 92)}`);
    console.log(`  ${G}إلى:${X} ${f.to.slice(0, 92)}`);
    if (APPLY) {
      /* يُمسح الخطأ ووقتُ الفحص كي تدخل الدورة القادمة برابطها الجديد
         بلا أن يُقرأ حكمٌ قديمٌ على رابطٍ لم يعد موجوداً. */
      await prisma.componentOffer.update({
        where: { id: offer.id },
        data: { url: f.to, lastError: null },
      });
      done++;
      console.log(`  ${G}✔ صُحّح${X}`);
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(APPLY ? `صُحّح ${done} · تُخطّي ${skip}` : `جاهز: ${FIXES.length - skip}`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
