/* ============ حارس وجهة العودة بعد الدخول ============
 *
 * `callbackUrl` يصل من عنوان الصفحة، فيكتبه من شاء بما شاء. وهذا الفحص
 * يجرّب عليه ما يُجرَّب في إعادة التوجيه المفتوحة فعلاً.
 *
 *   npx tsx scripts/login-callback-check.ts
 */
import { safeCallback } from '../lib/login-href';
const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', X = '\x1b[0m';
let pass = 0, fail = 0;
const t = (raw: string | null, want: string, why: string) => {
  const got = safeCallback(raw);
  if (got === want) { pass++; console.log(`  ${G}✔${X} ${why}  ${D}${JSON.stringify(raw)} → ${got}${X}`); }
  else { fail++; console.log(`  ${R}✘ ${why}${X}  ${JSON.stringify(raw)} → ${got}  (المتوقّع ${want})`); }
};

console.log('\nيُقبل — مسارات داخلية');
t('/components', '/components', 'مسار عاديّ');
t('/builder?cpu=abc&gpu=def', '/builder?cpu=abc&gpu=def', 'مسار بمعاملاته');
t('/my-builds#part-requests', '/my-builds#part-requests', 'مسار بمرساة');
t('/', '/', 'الجذر');

console.log('\nيُردّ — كل ما يخرج بالمستخدم عن الموقع');
t('//evil.example', '/', 'عنوان مطلق بلا بروتوكول');
t('//evil.example/login', '/', 'وشبيهه بمسار');
t('/\\evil.example', '/', 'شرطة عكسية — تتساهل بعض المتصفّحات فتقرأها كالسابقة');
t('https://evil.example', '/', 'عنوان كامل');
t('http://localhost:3000/x', '/', 'حتى لو بدا محلّياً');
t('javascript:alert(1)', '/', 'مخطّط جافاسكربت');
t('evil.example', '/', 'بلا شرطة أصلاً');
t('', '/', 'فارغ');
t(null, '/', 'غائب');

console.log(`\n${'═'.repeat(40)}`);
console.log(fail === 0 ? `${G}نجحت (${pass})${X}` : `${R}فشل ${fail} من ${pass + fail}${X}`);
if (fail) process.exit(1);
