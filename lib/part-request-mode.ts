import { prisma } from './prisma';
import {
  PART_REQUEST_MODE_KEY,
  DEFAULT_PART_REQUEST_MODE,
  isValidPartRequestMode,
  type PartRequestMode,
} from './part-request';

/**
 * وضع اقتراح القطع الحاليّ (خادميّ — يقرأ القاعدة).
 * مصدرٌ واحد يقرؤه مسار الإرسال ومسار الوضع ولوحة الطلبات، فلا يتباعد
 * الحارس عمّا تعرضه الواجهة. وأيّ قيمةٍ غير معروفة تسقط إلى الافتراضيّ
 * (المسجّلون فقط) — الخطأ في هذا الاتّجاه أسلم من فتحه للجميع.
 */
export async function getPartRequestMode(): Promise<PartRequestMode> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: PART_REQUEST_MODE_KEY } });
    return isValidPartRequestMode(row?.value) ? row!.value as PartRequestMode : DEFAULT_PART_REQUEST_MODE;
  } catch {
    return DEFAULT_PART_REQUEST_MODE;
  }
}
