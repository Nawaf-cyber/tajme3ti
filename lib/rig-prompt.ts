/* ============ متى تُعرض نافذةُ التعريف؟ ============
 *
 * ⚠️ ودالّةٌ نقيّةٌ لا شرطٌ داخل المسار: «مرّةً واحدة» هو **كلُّ** المطلوب
 * منها، وعطبُها الوحيد الممكن أن تُعرض مرّتين — وهو ما لا يُكتشف إلّا
 * بعد أن يراها المستخدم مرّتين. فتُفحص هنا قبل أن تصل إليه.
 */

export type PromptInput = {
  /** متى رآها — null = لم يرها قطّ */
  seenAt: Date | string | null | undefined;
  /** كم جهازاً حاليّاً عيّن (صفر أو واحد) */
  currentRigs: number;
  /** هل عنده تجميعاتٌ محفوظة؟ يغيّر الدعوة لا العرض */
  savedBuilds: number;
};

export type PromptVerdict = { show: boolean; hasBuilds: boolean };

/**
 * ⚠️ وشرطان لا شرط: «لم يرها» **و**«لم يعيّن جهازاً». والثاني ليس زيادة:
 * من عيّن جهازه من الزرّ مباشرةً بلا أن يرى النافذة لا يُعرَّف بميزةٍ
 * يستعملها — وذلك يقع فعلاً، فالزرّ ظاهرٌ على كلّ بطاقة.
 */
export const shouldPromptRig = (i: PromptInput): PromptVerdict => ({
  show: !i.seenAt && i.currentRigs === 0,
  hasBuilds: i.savedBuilds > 0,
});
