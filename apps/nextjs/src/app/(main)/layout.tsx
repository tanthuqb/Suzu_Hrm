import { VALID_ROLES } from "@acme/db";
import { SidebarInset, SidebarProvider } from "@acme/ui/sidebar";
import { ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { checkRole } from "~/actions/auth";
import { AppSidebar } from "~/components/commons/app-sidebar";
import { Header } from "~/components/commons/header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await checkRole(VALID_ROLES);

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <SidebarProvider>
        <AppSidebar role={user?.roleName.toLocaleLowerCase()} />
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
