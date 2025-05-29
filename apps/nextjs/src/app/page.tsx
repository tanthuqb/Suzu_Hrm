"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bell, LogOut, Search } from "lucide-react";

import { UserStatusEnum } from "@acme/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@acme/ui/breadcrumb";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Separator } from "@acme/ui/separator";
import { SidebarInset, SidebarTrigger } from "@acme/ui/sidebar";

import { signOut } from "~/actions/auth";
import { AppSidebar } from "~/components/commons/app-sidebar";
import { useTRPC } from "~/trpc/react";
import UserChartSimleBar from "./(main)/(dashboard)/_components/charts/user-charts";
import CountPositionPage from "./(main)/(dashboard)/_components/dashboards/count-position";
import { RecentActivities } from "./(main)/(dashboard)/_components/dashboards/recent-activities";
import { UpcomingEvents } from "./(main)/(dashboard)/_components/dashboards/upcoming-events";

const transformData = (
  apiData: { month: number | string; count: number | string }[],
): number[] => {
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  return months.map((month) => {
    const monthData = apiData.find((item) => Number(item.month) === month);
    return monthData ? Number(monthData.count) : 0;
  });
};
export default function DashboardPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const currentYear = new Date().getFullYear();

  const handleLogout = async () => {
    startTransition(async () => {
      await signOut();
      router.push("/login");
    });
  };

  const { data: countByStatusActiveRespone, error: activeError } =
    useSuspenseQuery({
      ...trpc.user.getCountUserByStatus.queryOptions({
        status: UserStatusEnum.ACTIVE,
        year: currentYear,
      }),
      staleTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

  const { data: countByStatusSuspendRespone, error: suspendError } =
    useSuspenseQuery({
      ...trpc.user.getCountUserByStatus.queryOptions({
        status: UserStatusEnum.SUSPENDED,
        year: currentYear,
      }),
      staleTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

  if (activeError || suspendError) {
    console.error("Error fetching data:", activeError || suspendError);
  }

  const countByStatusActive = transformData(countByStatusActiveRespone);
  const countByStatusSuspend = transformData(countByStatusSuspendRespone);

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Actions */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="w-48 pl-8 lg:w-64" />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            <Button onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening in your organization.
                </p>
              </div>
            </div>

            {/* Charts and Activities Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Nhân viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/50 lg:h-[300px]">
                    <UserChartSimleBar
                      countByStatusActive={countByStatusActive}
                      countByStatusSuspend={countByStatusSuspend}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <RecentActivities />
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upcoming Events */}
              <UpcomingEvents />

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Position Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <CountPositionPage />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
