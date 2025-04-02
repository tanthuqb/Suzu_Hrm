"use client";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SidebarProvider>
    //   <div className="flex h-[100dvh] w-full overflow-hidden">
    //     <AppSidebar />
    //     <div className="flex flex-1 flex-col overflow-hidden">
    //       <Header />
    //       <main className="flex-1 overflow-y-auto p-6">
    //         {children}
    //         </main>
    //     </div>
    //   </div>
    // </SidebarProvider>
    <main>{children}</main>
  );
}
