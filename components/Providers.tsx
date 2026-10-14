"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* بلا disableTransitionOnChange: lib/theme-switch.ts يتولّى التبديل بحركته،
          وإطفاءُ next-themes للانتقالات كان سيقطع تلاشي المتصفّحات القديمة. */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}