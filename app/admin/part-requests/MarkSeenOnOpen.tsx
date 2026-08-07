'use client';

/**
 * فتح صفحة الطلبات = قراءتها.
 *
 * نُعلّمها مقروءة بعد الرسم لا قبله، كي ترى شارات «جديد» في هذه الزيارة
 * ثم تختفي النقطة في التالية — لو علّمناها عند الخادم لاختفت الشارات
 * قبل أن تراها.
 */

import { useEffect, useRef } from 'react';
import { markPartRequestsSeen, markPartMessagesSeen } from '../actions';

export default function MarkSeenOnOpen({ hasNew }: { hasNew: boolean }) {
  const done = useRef(false);

  useEffect(() => {
    if (!hasNew || done.current) return;
    done.current = true;
    markPartRequestsSeen().catch(() => {});
    markPartMessagesSeen().catch(() => {});
  }, [hasNew]);

  return null;
}
