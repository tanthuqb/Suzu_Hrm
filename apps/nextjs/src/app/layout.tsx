import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";

import "./globals.css";

import { SidebarProvider } from "@acme/ui/sidebar";
import { ThemeProvider } from "@acme/ui/theme";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Suzu HRM",
  description: "Hệ thống quản lý nhân sự",
  openGraph: {
    title: "Suzu HRM",
    description: "Hệ thống quản lý nhân sự",
    url: "https://suzu-dashboard.vercel.app",
    siteName: "SUZU HRM",
  },
  twitter: {
    card: "summary_large_image",
    site: "@suzuhrm",
    creator: "@suzuhrm",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <SidebarProvider>
              <div className="flex h-full min-h-screen w-full">{children}</div>
            </SidebarProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
