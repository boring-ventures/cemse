"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { UnifiedAuthProvider } from "@/providers/jwt-auth-provider";
import { ThemeProvider } from "@/context/theme-context";

const APP_NAME = "POSITIVE-NEXT";
const APP_DESCRIPTION = "Your Mind's Best Friend";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="app-theme">
          <QueryProvider>
            <UnifiedAuthProvider>{children}</UnifiedAuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
