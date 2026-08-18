/* ============ مسح القطع المكرّرة ============
 *
 * ⚠️ كان هذا الملفّ كلُّه في معالج `GET`: طلبُ قراءةٍ ينادي `deleteMany`.
 * محميٌّ بالوسيط، نعم — لكن الحماية تمنع **الغريب** لا الحادث: المتصفّح
 * يسبق المستخدم إلى الروابط (prefetch)، والمسجّل دخوله إن مرّ الرابط أمامه
 * فُقدت قطعٌ بلا نقرة. فالفعل المدمّر لا يُعلَّق على فعلٍ آمن.
 *
 * فصار:
 *   GET  → معاينة. يعدّ ويسمّي ولا يحذف شيئاً. آمنٌ للتكرار.
 *   POST → التنفيذ. هو وحده يحذف.
 *
 * ⚠️ وخطرٌ ثانٍ لم يكن ظاهراً: الحذف يشمل **كل** قطعتين تتفقان في
 * `brand + name`، ويُبقي الأقدم. فقطعتان مختلفتان بالاسم نفسه تُحذف
 * إحداهما. والأسوأ أن `SavedBuild` يحفظ المعرّفات نصّاً بلا مفتاحٍ أجنبيّ،
 * فتجميعة المستخدم تشير إلى قطعةٍ لم تعد موجودة **بصمت**. لذلك تعدّ
 * المعاينة التجميعات المتأثّرة قبل أن يُقرّر أحد.
 */

import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

type Candidate = {
  id: string;
  label: string;
  keptId: string;
  savedBuildRefs: number;
};

/** مرشّحو الحذف: كل قطعةٍ يتكرّر مفتاحُها بعد أقدم واحدة تحمله */
async function findDuplicates(): Promise<Candidate[]> {
  const components = await prisma.component.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, brand: true, name: true },
  });

  const firstSeen = new Map<string, string>();
  const out: Candidate[] = [];

  for (const comp of components) {
    const key = `${comp.brand}-${comp.name}`.toLowerCase().trim();
    const kept = firstSeen.get(key);
    if (kept === undefined) {
      firstSeen.set(key, comp.id);
      continue;
    }
    out.push({ id: comp.id, label: `${comp.brand} ${comp.name}`, keptId: kept, savedBuildRefs: 0 });
  }

  /* كم تجميعةً محفوظة تشير إلى كلٍّ منها. الأعمدة ثابتة في المخطّط، فتُعدّ
     صراحةً — لا مفتاح أجنبيّ يمنع اليُتم ولا يكشفه. */
  for (const c of out) {
    c.savedBuildRefs = await prisma.savedBuild.count({
      where: {
        OR: [
          { cpuId: c.id }, { gpuId: c.id }, { ramId: c.id }, { motherboardId: c.id },
          { caseId: c.id }, { psuId: c.id }, { storageId: c.id },
        ],
      },
    });
  }

  return out;
}

/** معاينة — لا تحذف */
export async function GET() {
  try {
    const dups = await findDuplicates();
    const orphaning = dups.filter((d) => d.savedBuildRefs > 0);

    return NextResponse.json({
      preview: true,
      message:
        dups.length === 0
          ? 'لا مكرّرات.'
          : `${dups.length} مرشّحة للحذف. أرسل POST للتنفيذ.`,
      count: dups.length,
      warning:
        orphaning.length > 0
          ? `⚠️ ${orphaning.length} منها مستعملةٌ في تجميعاتٍ محفوظة — حذفُها يترك التجميعة تشير إلى قطعةٍ غير موجودة.`
          : undefined,
      duplicates: dups.map((d) => ({
        id: d.id,
        name: d.label,
        keptId: d.keptId,
        savedBuildRefs: d.savedBuildRefs,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشلت معاينة المكرّرات.' }, { status: 500 });
  }
}

/** التنفيذ — هو وحده يحذف */
export async function POST() {
  try {
    const dups = await findDuplicates();
    if (dups.length === 0) {
      return NextResponse.json({ success: true, message: 'لا مكرّرات.', deletedCount: 0 });
    }

    await prisma.component.deleteMany({ where: { id: { in: dups.map((d) => d.id) } } });

    const orphaned = dups.reduce((n, d) => n + d.savedBuildRefs, 0);
    return NextResponse.json({
      success: true,
      message: `حُذفت ${dups.length} قطعة مكرّرة.`,
      deletedCount: dups.length,
      deleted: dups.map((d) => d.label),
      orphanedBuildRefs: orphaned > 0 ? orphaned : undefined,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشلت عملية مسح المكرّرات.' }, { status: 500 });
  }
}
