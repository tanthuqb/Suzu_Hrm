import { Suspense } from "react";

import { SidebarProvider } from "@acme/ui/sidebar";
import { Toaster } from "@acme/ui/toast";

import { AppSidebar } from "./_components/app-sidebar";
import { Header } from "./_components/header";

export default function AppLayout(props: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
        </div>
      </div>

      <Toaster />
    </SidebarProvider>
  );
}
