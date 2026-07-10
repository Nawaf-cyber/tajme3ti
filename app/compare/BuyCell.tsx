'use client';

/** خلية "الشراء" — رقائق المتاجر المتوفّرة، الأرخص أولاً */

type Comp = {
  amazonPrice?: number | null;
  amazonInStock?: boolean | null;
  amazonUrl?: string | null;
  cazasouqPrice?: number | null;
  cazasouqInStock?: boolean | null;
  cazasouqUrl?: string | null;
  microlessPrice?: number | null;
  microlessInStock?: boolean | null;
  microlessUrl?: string | null;
};

type Offer = { store: string; price: number; url: string };

const STORE_STYLE: Record<string, string> = {
  'أمازون': 'hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400',
  'كازاسوق': 'hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400',
  'مايكرولس': 'hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400',
};

export function getOffers(c: Comp): Offer[] {
  const raw: (Offer | null)[] = [
    c.amazonInStock && c.amazonPrice && c.amazonUrl
      ? { store: 'أمازون', price: c.amazonPrice, url: c.amazonUrl }
      : null,
    c.cazasouqInStock && c.cazasouqPrice && c.cazasouqUrl
      ? { store: 'كازاسوق', price: c.cazasouqPrice, url: c.cazasouqUrl }
      : null,
    c.microlessInStock && c.microlessPrice && c.microlessUrl
      ? { store: 'مايكرولس', price: c.microlessPrice, url: c.microlessUrl }
      : null,
  ];
  return (raw.filter(Boolean) as Offer[]).sort((a, b) => a.price - b.price);
}

export default function BuyCell({ component }: { component: Comp }) {
  const offers = getOffers(component);

  if (offers.length === 0) {
    return (
      <span className="font-mono text-[10px] font-bold text-slate-300 dark:text-slate-700">
        غير متوفر
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-stretch">
      {offers.map((o, i) => (
        <a
          key={o.store}
          href={o.url}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className={`group/buy flex items-center justify-between gap-2 px-2.5 py-2 border rounded-sm transition-colors ${
            i === 0
              ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
              : `border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 ${STORE_STYLE[o.store] ?? ''}`
          }`}
        >
          <span className="font-mono text-[9px] font-black uppercase tracking-wider shrink-0">
            {o.store}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] font-black">
            {o.price.toLocaleString('en-US')}
            {i === 0 && offers.length > 1 && <span className="text-[8px] opacity-70">أرخص</span>}
            <svg
              className="w-2.5 h-2.5 opacity-0 group-hover/buy:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </a>
      ))}
    </div>
  );
}