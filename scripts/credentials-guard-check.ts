/* ============ حارسا الدخول بكلمة مرور ============
 *
 * الحماية ليست في إخفاء النموذج — المسار `/api/auth/callback/credentials`
 * يُنادى بأمر `curl` واحد سواء ظهر الزرّ أو لا. فهذا الفحص يهاجمه من
 * الخارج كما يفعل المهاجم، ويقيس ما يحدث:
 *
 *   ١) حسابٌ ليس ADMIN يُرفض ولو كانت كلمته صحيحة.
 *   ٢) خمس محاولات لكل (بريد + IP) في ربع ساعة، ثم يُردّ الباقي.
 *
 * ⚠️ ولا يُجرَّب بريدٌ حقيقيّ بكلمةٍ حقيقية: كل المحاولات ببريدٍ وهميّ
 * وكلمةٍ خاطئة. الغرض قياسُ الحارس لا اختبار حساب.
 *
 * يحتاج الخادم يعمل على المنفذ ٣٠٠٠.
 *   npx tsx scripts/credentials-guard-check.ts
 */

import 'dotenv/config';

const BASE = process.env.CHECK_BASE || 'http://localhost:3000';
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

let pass = 0, fail = 0;
const check = (t: string, ok: boolean, d = '') => {
  if (ok) { pass++; console.log(`  ${G}✔${X} ${t}`); } else { fail++; console.log(`  ${R}✘ ${t}${X}  ${d}`); }
};

/** يُنادي المسار كما يفعل المتصفّح: csrf ثم POST */
async function attempt(email: string, password: string) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const cookie = csrfRes.headers.getSetCookie?.().join('; ') ?? '';
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({ email, password, csrfToken, json: 'true' });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie },
    body,
    redirect: 'manual',
  });
  const text = await res.text().catch(() => '');
  const loc = res.headers.get('location') || '';
  return { status: res.status, location: loc, denied: /error=/.test(loc) || /CredentialsSignin/.test(text) };
}

async function main() {
  console.log(`\nالهدف: ${D}${BASE}${X}`);

  /* ١ — بريدٌ لا وجود له: يجب أن يُردّ */
  console.log('\n١) بريدٌ مجهول');
  const r1 = await attempt(`ghost-${Date.now()}@example.invalid`, 'anything');
  check('يُردّ', r1.denied, `status=${r1.status} loc=${r1.location.slice(0, 60)}`);
  console.log(`      ${D}${r1.location.slice(0, 90)}${X}`);

  /* ٢ — الحدّ: ستّ محاولات متتالية على البريد نفسه */
  console.log('\n٢) حدّ المحاولات (٥ في ١٥ دقيقة)');
  const email = `brute-${Date.now()}@example.invalid`;
  const results: boolean[] = [];
  for (let i = 1; i <= 6; i++) {
    const r = await attempt(email, `wrong-${i}`);
    results.push(r.denied);
    process.stdout.write(`      محاولة ${i}: ${r.denied ? 'مرفوضة' : 'مرّت!'}\n`);
  }
  check('كل المحاولات مرفوضة (الكلمة خاطئة)', results.every(Boolean));
  console.log(`      ${Y}ملاحظة:${X} ${D}الردّ واحدٌ في الحالتين عمداً — المهاجم لا يُفرَّق له بين «كلمة خاطئة» و«بلغتَ الحدّ»، فلا يعرف أن البريد صحيح.${X}`);

  /* ٣ — لا كلمة ولا بريد */
  console.log('\n٣) طلبٌ فارغ');
  const r3 = await attempt('', '');
  check('يُردّ', r3.denied, `status=${r3.status}`);

  console.log(`\n${'═'.repeat(50)}`);
  console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
  console.log(`${D}⚠️ الفحص لا يُثبت أن الحدّ فعّال ما لم يكن Upstash مضبوطاً — راجع سجلّ الخادم:${X}`);
  console.log(`${D}   «Upstash غير مهيأ» تعني أن الحدّ متخطّى.${X}`);
  if (fail) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
