"use client";

import { AuthProvider } from "./auth/auth-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
