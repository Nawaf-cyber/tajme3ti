import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import { compare } from "bcryptjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* حدُّ محاولات الدخول — نفس نمط بقيّة المسارات.
   ⚠️ ويُبنى مرّةً على مستوى الوحدة لا داخل `authorize`: بناؤه في كل
   محاولة يفتح اتصالاً جديداً بـRedis لكل تخمين. */
let loginLimiter: Ratelimit | null = null;
try {
  loginLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  });
} catch {
  console.warn('Upstash غير مهيأ — لا حدَّ لمحاولات الدخول.');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  /* ============ صفحاتنا لا صفحات NextAuth ============
   *
   * ⚠️ بلا هذا يقع المستخدم على `/api/auth/signin` — صفحةُ NextAuth
   * الافتراضية: إنجليزية، بلا هويّة الموقع، ولا يعرف كيف وصلها. وكان
   * ذلك يحدث في حالتين شائعتين: كلمةُ مرورٍ خاطئة، وزيارةُ صفحةٍ محمية
   * قبل الدخول.
   *
   * والخطأ يُوجَّه إلى `/login` أيضاً كي يُقرأ من `?error=` ويُقال
   * بالعربية في مكانه، بدل صفحة خطأٍ منفصلة تقول «Sign in».
   */
  pages: { signIn: '/login', error: '/login' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      /* ============ الدخول بكلمة مرور — للإدارة وحدها، ومحدود ============
       *
       * قِيست الحسابات: ٩٧ من ١٠٠ يدخلون بـGoogle، ولا يبقى لكلمة المرور
       * إلا حسابا الإدارة. وهذا المسار كان مفتوحاً بلا **أيّ** حدٍّ
       * للمحاولات منذ أُنشئ الموقع — أي أن تخمين آلاف الكلمات في الدقيقة
       * كان ممكناً بلا مانع.
       *
       * ⚠️ وإخفاءُ النموذج من الصفحة لا يحمي شيئاً: هذا المسار يُنادى
       * بأمر `curl` واحد سواء ظهر النموذج أو لا. فالحماية هنا لا هناك.
       *
       * طبقتان:
       *   ١) خمس محاولات لكل (بريد + IP) في ربع ساعة.
       *   ٢) الدور: من ليس ADMIN يُرفض ولو كانت كلمته صحيحة — فلا يبقى
       *      لهذا الباب إلا حسابان بدل مئة.
       */
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const ip =
          (req?.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
          'unknown';

        if (loginLimiter) {
          const { success } = await loginLimiter.limit(`login:${email}:${ip}`);
          /* ⚠️ يُردّ `null` لا استثناء: NextAuth يترجمه إلى
             `CredentialsSignin` نفسه، فلا يُفرّق المهاجم بين «كلمة خاطئة»
             و«بلغتَ الحدّ» — والتفريق يُخبره أن البريد صحيح. */
          if (!success) return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        /* المقارنة تُجرى ولو كان الدور غير إداريّ — ثم يُرفض. فحصُ الدور
           قبلها يجعل زمن الردّ يكشف أيّ البريدين إداريّ. */
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        if (user.role !== 'ADMIN') return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };