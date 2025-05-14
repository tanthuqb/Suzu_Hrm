import { SidebarProvider } from "@acme/ui/sidebar";
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
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <ThemeToggle />
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
