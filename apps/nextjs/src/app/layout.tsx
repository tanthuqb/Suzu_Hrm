import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { Suspense } from "react";

import { SidebarProvider } from "@acme/ui/sidebar";

import { env } from "~/env";
import { AppSidebar } from "./(dashboard)/users/_components/app-sidebar";
import { Header } from "./(dashboard)/users/_components/header";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Suzu Admin Dashboard",
  description: "Suzu Human Resource Management Admin Dashboard",
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <TRPCReactProvider>
                <div className="flex h-[100dvh] w-full overflow-hidden">
                  <AppSidebar />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                      {props.children}
                    </main>
                  </div>
                </div>
              </TRPCReactProvider>
              <div className="absolute bottom-4 right-4">
                <ThemeToggle />
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
