"use client";
import { useState } from 'react';

export default function ImageZoom({ src, alt }: { src: string, alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* الصورة المصغرة القابلة للضغط */}
      <img 
        src={src} 
        alt={alt} 
        onClick={() => setIsOpen(true)}
        className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-zoom-in relative z-10"
      />
      
      {/* نافذة العرض المكبرة (تظهر فقط عند الضغط) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white bg-slate-800 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-50 font-bold"
          >
            ✕
          </button>
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} // لمنع الإغلاق عند الضغط على الصورة نفسها
          />
        </div>
      )}
    </>
  );
}