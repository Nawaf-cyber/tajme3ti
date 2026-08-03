-- ============================================================
-- إنشاء جداول "طلبات القطع" يدوياً — مولّد من Prisma (دقيق ١٠٠٪)
--
-- متى تستخدمه: إذا تعذّر `npx prisma db push` من جهازك (منفذ 5432 محجوب
-- أو Neon لا يُوصَل). الصق هذا كاملاً في:
--   Neon Console → مشروعك → SQL Editor → Run
-- (يعمل عبر HTTPS، فلا يتأثّر بحجب المنفذ 5432)
--
-- تراكمي بحت: يُنشئ نوعاً وجدولين جديدين فقط، بلا مساس بأي بيانات قائمة.
-- بعد تشغيله، شغّل `npx prisma db push` مرّة (لو رجع الاتصال) — سيقول
-- "already in sync" تأكيداً أنه مطابق للمخطط.
-- ============================================================

CREATE TYPE "PartRequestStatus" AS ENUM ('REVIEWING', 'ADDING', 'ADDED');

CREATE TABLE "RequestedPart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "status" "PartRequestStatus" NOT NULL DEFAULT 'REVIEWING',
    "componentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestedPart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartVote" (
    "id" TEXT NOT NULL,
    "requestedPartId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RequestedPart_normalized_key" ON "RequestedPart"("normalized");
CREATE INDEX "RequestedPart_status_idx" ON "RequestedPart"("status");
CREATE INDEX "PartVote_userId_idx" ON "PartVote"("userId");
CREATE UNIQUE INDEX "PartVote_requestedPartId_userId_key" ON "PartVote"("requestedPartId", "userId");

ALTER TABLE "RequestedPart" ADD CONSTRAINT "RequestedPart_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PartVote" ADD CONSTRAINT "PartVote_requestedPartId_fkey" FOREIGN KEY ("requestedPartId") REFERENCES "RequestedPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartVote" ADD CONSTRAINT "PartVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
