import { NextResponse } from 'next/server';
import { getPartRequestMode } from '../../../../lib/part-request-mode';

export const dynamic = 'force-dynamic';

/* ============ وضع الاقتراح للبطاقة ============
   تقرؤه «اقترح قطعة ناقصة» لتعرف: نموذجٌ للزائر أم دعوةُ تسجيل.
   بلا تخزين — تبديل المفتاح في اللوحة يظهر في الصفحة التالية فوراً. */
export async function GET() {
  const mode = await getPartRequestMode();
  return NextResponse.json({ requireAccount: mode === 'account' }, { headers: { 'Cache-Control': 'no-store' } });
}
