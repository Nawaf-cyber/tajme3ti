'use client';

/* ============ جهازُ المستخدم في المتصفّح — جلبٌ واحد للصفحة ============
 *
 * لوحة «هل يناسب جهازي؟» وشاراتُ «يدخل كيسك» بجانب كلّ متجر تحتاجان
 * الجهاز نفسه في الصفحة نفسها. ⚠️ فالطلبُ واحدٌ مشترك (وعدٌ على مستوى
 * الوحدة) لا طلبٌ لكلّ مكوّن — صفحةُ كرتٍ بأربعة متاجر كانت ستطلب
 * `/api/rig` خمس مرّات.
 *
 * ويُنسى الوعد إن فشل، فيُعاد في الفتحة التالية لا يُحبس خطأً.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { RigPayload } from '../app/api/rig/route';

let pending: Promise<RigPayload> | null = null;

const loadRig = (): Promise<RigPayload> =>
  (pending ??= fetch('/api/rig')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && d.buildId ? (d as RigPayload) : null))
    .catch((e) => { pending = null; throw e; }));

export type RigState =
  | { state: 'loading' }
  | { state: 'guest' }
  | { state: 'none' }
  | { state: 'ready'; rig: NonNullable<RigPayload> };

export function useRig(): RigState {
  const { status } = useSession();
  const [rig, setRig] = useState<RigPayload | undefined>(undefined);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let alive = true;
    loadRig()
      .then((r) => { if (alive) setRig(r); })
      .catch(() => { if (alive) setRig(null); });
    return () => { alive = false; };
  }, [status]);

  if (status === 'loading') return { state: 'loading' };
  if (status !== 'authenticated') return { state: 'guest' };
  if (rig === undefined) return { state: 'loading' };
  return rig ? { state: 'ready', rig } : { state: 'none' };
}
