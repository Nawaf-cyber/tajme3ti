/* ============ حذف حساب الاختبار ============
 *
 * `user@test.com` هو الحساب الوحيد غير الإداريّ الذي يملك كلمة مرور:
 * ٩٧ من مستخدمي الموقع يدخلون بـGoogle، وثلاثةٌ لهم كلمة مرور — اثنان
 * منهم أدمن، وهذا الثالث. فحذفُه يُخرج الحسابات غير الإدارية من دائرة
 * تخمين كلمات المرور نهائياً.
 *
 * ⚠️ ويملك **تجميعةً محفوظة**، و`SavedBuild.userId` عليها
 * `onDelete: Cascade` — فحذف الحساب يحذفها معه بلا سؤال. ولذلك تُطبع
 * التجميعة كاملةً بمعرّفات قطعها قبل الحذف، وتُحفظ في ملفٍ نصّيّ:
 * الحذف لا يُستردّ، والطباعة تكلّف سطراً.
 *
 *   npx tsx scripts/delete-test-user.ts          (عرض ونسخ احتياطي)
 *   npx tsx scripts/delete-test-user.ts --apply  (حذف)
 */

import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const APPLY = process.argv.includes('--apply');
const EMAIL = 'user@test.com';
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { builds: true, accounts: { select: { provider: true } } },
  });

  if (!user) { console.log(`${G}✔${X} «${EMAIL}» غير موجود — حُذف سابقاً`); await prisma.$disconnect(); return; }

  console.log(`\n${user.email} · ${user.name} · ${user.role} · أُنشئ ${user.createdAt.toISOString().slice(0, 10)}`);
  console.log(`  ${D}OAuth: ${user.accounts.map((a) => a.provider).join('، ') || 'لا شيء'}${X}`);
  console.log(`  ${Y}تجميعات محفوظة ستُحذف معه (Cascade): ${user.builds.length}${X}`);
  for (const b of user.builds) console.log(`     ${D}«${b.name}»${X}`);

  /* نسخةٌ احتياطية قبل أي حذف — تُكتب حتى في وضع العرض */
  const backup = {
    نُسخ: new Date().toISOString(),
    المستخدم: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
    التجميعات: user.builds,
  };
  const path = `backup-${EMAIL.replace(/[^a-z0-9]/gi, '-')}.json`;
  writeFileSync(path, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\n${G}✔${X} نسخة احتياطية: ${path}`);

  if (!APPLY) { console.log(`\n${D}عرض فقط — أضف --apply للحذف.${X}`); await prisma.$disconnect(); return; }

  await prisma.user.delete({ where: { id: user.id } });

  const gone = await prisma.user.findUnique({ where: { email: EMAIL } });
  const left = await prisma.user.count({ where: { password: { not: null } } });
  const nonAdmin = await prisma.user.count({ where: { password: { not: null }, role: { not: 'ADMIN' } } });

  console.log(`\n${G}✔ حُذف${X} (تأكيد: ${gone ? R + 'ما زال موجوداً!' + X : 'لم يعد موجوداً'})`);
  console.log(`حسابات لها كلمة مرور: ${left} · منها غير إدارية: ${nonAdmin}`);

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
