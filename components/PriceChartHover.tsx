'use client';

/* ============ تلميح رسم تاريخ السعر — يُرسم لليوم المُشار إليه وحده ============
 *
 * ⚠️ كان الرسم (components/PriceHistoryChart) يرسم في الخادم تلميحاً كاملاً لكلّ
 * يوم × كلّ متجر، مخفيّاً بـ CSS حتى الإشارة، و<title> لكلّ يوم — فصفحة القطعة
 * فيها ٤٨٩ عنصراً نصّياً لا يراها أحد، يقرؤها الزاحف محتوى (مراجعة أدسنس
 * 2026-10-15). فالبيانات تصل هنا أرقاماً، والنصّ لا يُرسم إلّا لليوم المُشار إليه.
 *
 * والهندسة (أماكن التلميح وأبعاده) كما كانت في الخادم — نُقلت لا أُعيد تصميمها.
 */

import { useState } from 'react';

export type HoverColumn = {
  key: string;
  cx: number;
  dateLabel: string;
  entries: { name: string; color: string; price: number }[];
};

export default function PriceChartHover({
  columns, colW, padTop, plotH, W, H,
}: {
  columns: HoverColumn[];
  colW: number;
  padTop: number;
  plotH: number;
  W: number;
  H: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const col = columns.find((c) => c.key === active);

  return (
    <g onMouseLeave={() => setActive(null)}>
      {/* مناطق الالتقاط بعرض المسافة بين يومين — بلا نصّ */}
      {columns.map((c) => (
        <rect
          key={c.key}
          x={c.cx - colW / 2}
          y={padTop}
          width={colW}
          height={plotH}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseEnter={() => setActive(c.key)}
          onTouchStart={() => setActive(c.key)}
        />
      ))}

      {col && (() => {
        /* مقاسات التلميح: العربية دون ١١ بكسل تُقرأ بمشقّة، ورفعُ الخطّ يوجب رفع الصندوق */
        const rowH = 16;
        const tipH = 24 + col.entries.length * rowH;
        const tipW = Math.max(134, ...col.entries.map((e) => 42 + e.name.length * 7.2 + String(Math.round(e.price)).length * 7));
        // ينقلب إلى اليسار قرب الحافّة اليمنى كي لا يخرج عن الإطار
        const flip = col.cx + 10 + tipW > W - 4;
        const tx = flip ? col.cx - 10 - tipW : col.cx + 10;
        const ty = Math.min(padTop + 4, H - tipH - 4);
        return (
          <g pointerEvents="none">
            <line className="stroke-slate-400 dark:stroke-slate-500" x1={col.cx} y1={padTop} x2={col.cx} y2={padTop + plotH} strokeWidth="1" strokeDasharray="3 3" />
            <g transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)})`}>
              <rect width={tipW} height={tipH} rx="8" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-600" strokeWidth="1" />
              {/* الترتيب عربي بالإحداثيات: التاريخ والمتجر يميناً والسعر يساراً */}
              <text x={tipW - 10} y="16" textAnchor="end" fontSize="11" fontWeight="800" className="fill-slate-500 dark:fill-slate-400">
                {col.dateLabel}
              </text>
              {col.entries.map((e, i) => {
                const ry = 24 + i * rowH + 10;
                return (
                  <g key={e.name}>
                    <circle cx={tipW - 14} cy={ry - 3.5} r="3.5" fill={e.color} />
                    <text x={tipW - 24} y={ry} textAnchor="end" fontSize="11.5" fontWeight="700" className="fill-slate-600 dark:fill-slate-300">{e.name}</text>
                    <text x="10" y={ry} textAnchor="start" fontSize="11.5" fontWeight="900" className="fill-slate-900 dark:fill-white">{Math.round(e.price).toLocaleString('en-US')}</text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      })()}
    </g>
  );
}
