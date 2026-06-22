'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTimer = () => {
      const now = new Date();
      // ضبط التحديث القادم ليكون عند منتصف الليل بتوقيت السعودية
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="h-10"></div>; // لمنع أخطاء الـ Hydration

  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2 text-blue-400">
        <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-sm font-bold tracking-wide">تحديث الأسعار القادم:</span>
      </div>
      <div className="flex items-center gap-1 font-mono text-lg font-black text-white" dir="ltr">
        <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/50">{timeLeft.hours}</span>
        <span className="text-slate-500 animate-pulse">:</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/50">{timeLeft.minutes}</span>
        <span className="text-slate-500 animate-pulse">:</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/50 text-emerald-400">{timeLeft.seconds}</span>
      </div>
    </div>
  );
}