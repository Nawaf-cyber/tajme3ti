"use client";
import { useState, useEffect } from 'react';

export default function ImageZoom({ src, alt }: { src: string, alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // إغلاق بمفتاح Escape + منع تمرير الصفحة خلف المودال
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* الصورة المصغرة القابلة للضغط */}
      <img 
        src={src} 
        alt={alt} 
        onClick={() => setIsOpen(true)}
        className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-zoom-in relative z-10"
      />
      
      {/* نافذة العرض المكبرة */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-6 cursor-zoom-out transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق"
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white bg-slate-800/90 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-400 w-11 h-11 flex items-center justify-center rounded-sm transition-colors z-50 font-bold text-lg"
          >
            ✕
          </button>

          {/* إطار الصورة — أبيض بحواف حادّة، يستغل الشاشة */}
          <div
            className="relative bg-white rounded-sm p-3 md:p-4 shadow-[0_0_60px_rgba(34,211,238,0.15)] border-t-2 border-t-cyan-500 max-w-[96vw] max-h-[94vh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={src} 
              alt={alt} 
              className="max-w-[92vw] max-h-[88vh] w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}