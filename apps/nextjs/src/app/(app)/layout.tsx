import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { Suspense } from "react";

import { SidebarProvider } from "@acme/ui/sidebar";

import { AppSidebar } from "~/app/(app)/(dashboard)/users/_components/app-sidebar";
import { Header } from "~/app/(app)/(dashboard)/users/_components/header";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
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
  );
}
