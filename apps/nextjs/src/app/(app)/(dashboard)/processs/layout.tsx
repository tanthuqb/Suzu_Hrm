import { SidebarProvider } from "@acme/ui/sidebar";

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
