"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Theme Provider
 *
 * Wraps the app with next-themes for dark/light mode support.
 * Supports system preference detection and theme persistence.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
