/* ============ قائمة الكتالوج المختصرة — للإشارة داخل الوصف ============
 *
 * حين يكتب الأدمن «@» في وصف قطعة، يحتاج أن يرى قطعنا ليختار منها.
 *
 * ⚠️ والقائمة تُرسل **كاملةً مرّةً واحدة** لا بحثاً مع كل حرف، وقيس:
 * ٣٠١ قطعةً = ٢٦ كيلوبايت. فطلبٌ واحدٌ يجعل الترشيح فوريّاً بلا تأخيرٍ
 * ولا إلغاءِ طلباتٍ متسابقة، والبديل ثلاثون طلباً لجملةٍ واحدة.
 * وإن بلغ الكتالوج آلافاً فالحدّ هنا يُقلَب إلى بحثٍ في الخادم.
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { adminEmail } from '../../../../lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await adminEmail())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const rows = await prisma.component.findMany({
    select: {
      id: true, name: true, brand: true, price: true,
      category: { select: { name: true } },
      /* ⚠️ ومعها متاجرها: منتقي «مصدر ثانٍ» يحتاج أن يقول للأدمن قبل أن
         يختار — هذه بمصدرٍ واحد، وتلك عندها المتجر المطلوب أصلاً فاختيارها
         بحثٌ بلا فائدة. وبلا ذلك يُنفق رصيد الوسيط على قطعةٍ لا تحتاجه. */
      offers: { select: { store: { select: { slug: true } } } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      brand: r.brand,
      price: r.price,
      category: r.category?.name ?? '',
      stores: [...new Set(r.offers.map((o) => o.store.slug))],
    })),
  });
}
