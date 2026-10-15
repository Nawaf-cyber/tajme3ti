'use client';

/* زرّ الاقتراح وحده في المتصفّح — الصفحة نفسها مكوّن خادم (نصّها كلّه في HTML الخادم) */

import { useState } from 'react';
import SuggestionModal from '../../components/SuggestionModal';

export default function SuggestButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-sm transition-colors"
      >
        إرسال اقتراح
      </button>
      <SuggestionModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
