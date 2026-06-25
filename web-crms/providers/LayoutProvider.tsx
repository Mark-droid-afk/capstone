"use client";

import { SidebarProvider, ThemeProvider, useSharedTheme } from "@r3b2p/uilib";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  useSharedTheme();
  return (
    <ThemeProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
    </ThemeProvider>
  );
}