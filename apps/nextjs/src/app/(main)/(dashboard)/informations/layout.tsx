import { SidebarProvider } from "@acme/ui/sidebar";

export default function InformationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
