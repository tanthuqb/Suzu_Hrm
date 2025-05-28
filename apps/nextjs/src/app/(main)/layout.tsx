import { SidebarInset, SidebarProvider } from "@acme/ui/sidebar";
import { ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { AppSidebar } from "~/components/commons/app-sidebar";
import { Header } from "~/components/commons/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen w-full flex-col lg:flex-row">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header />
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
        </SidebarInset>
        <div className="absolute bottom-4 right-4">
          <ThemeToggle />
        </div>
        <Toaster />
      </SidebarProvider>
    </div>
  );
}
