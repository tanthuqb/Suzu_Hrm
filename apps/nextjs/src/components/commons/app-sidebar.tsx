"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivitySquare,
  BookOpen,
  Building,
  ChevronDown,
  Send,
  Settings,
  UserPen,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@acme/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@acme/ui/sidebar";

const navigationItems = [
  { type: "header", title: "HRM Admin Menu", path: "/" },
  { title: "Users", icon: Users, path: "/users" },
  {
    title: "Nhân Sự",
    icon: Users,
    children: [
      { title: "Imports Attendances", path: "/import-attendance" },
      { title: "Chấm Công", path: "/attendances" },
      { title: "Nghỉ Phép", path: "/leave-requests" },
    ],
  },
  {
    title: "Kiến Thức",
    icon: BookOpen,
    children: [{ title: "Tài nguyên nhân viên", path: "/resources" }],
  },
  {
    title: "Thông Tin Cá Nhân",
    icon: UserPen,
    children: [
      { title: "Phiếu Lương", path: "/informations/salary-slip" },
      { title: "Công Việc", path: "/informations/works" },
      { title: "Thăng Tiến", path: "/informations/career" },
    ],
  },
  {
    title: "Form",
    icon: Send,
    children: [
      { title: "Chấm Công", path: "/eForms/time-tracking" },
      { title: "Nghỉ Phép", path: "/eForms/on-leave" },
      { title: "Làm Việc Ở Nhà", path: "/eForms/work-from-home" },
    ],
  },
  {
    title: "Quy Trình",
    icon: ActivitySquare,
    children: [
      { title: "Nhân Viên & Công Ty", path: "/processs/employees-company" },
      {
        title: "Nhân Viên & Cấp Trên",
        path: "/processs/employees-supervisors",
      },
      { title: "Đội & Công Ty", path: "/processs/team-company" },
      { title: "Đội & Đội Khác", path: "/processs/team-to-team" },
    ],
  },
  {
    title: "Phòng Ban",
    icon: Send,
    children: [{ title: "Quản Lý Phòng Ban", path: "/department" }],
  },
  {
    title: "Vị Trí",
    icon: Send,
    children: [{ title: "Quản lý Vị Trí", path: "/positions" }],
  },
  {
    title: "Settings",
    icon: UserPen,
    children: [
      { title: "Role Manager", path: "/settings/roles" },
      { title: "Role & Permission", path: "/settings/role-permissions" },
      { title: "Import Suzu", path: "/imports" },
    ],
  },
  { type: "footer", title: "Admin User", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path?: string) =>
    !!path && (pathname === path || pathname.startsWith(path + "/"));

  const hasActiveChild = (item: (typeof navigationItems)[number]) =>
    !!item.children?.some((ch) => isActive(ch.path));

  return (
    <Sidebar className="border-r">
      {/* HEADER */}
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Suzu HRM</h2>
            <p className="text-xs text-muted-foreground">HR Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter((item) => item.type !== "footer")
                .map((item) => {
                  if (!item.children) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                        >
                          <Link
                            href={item.path!}
                            className="flex items-center gap-3"
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={hasActiveChild(item)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="flex items-center gap-3"
                            isActive={hasActiveChild(item)}
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </SidebarMenuItem>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(sub.path)}
                              >
                                <Link href={sub.path}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t p-4">
        {navigationItems
          .filter((item) => item.type === "footer")
          .map((item) => (
            <div key="footer" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white">
                {item.icon && <item.icon className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">{item.title}</span>
            </div>
          ))}

        <SidebarMenu className="mt-4">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted p-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/uploads/default-avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@suzu.com</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
