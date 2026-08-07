import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const revalidate = 3600; // الفئات شبه ثابتة — ساعة كافية

/**
 * قائمة الفئات للاختيار في بطاقة اقتراح القطعة.
 * عامّة ومقصودة: لا تحوي إلا المعرّف والاسم، وهي معروضة أصلاً في كل صفحة.
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
