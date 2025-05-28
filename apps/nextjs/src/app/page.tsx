"use client";

// import { DashboardStats } from "@/components/dashboard-stats";
// import { RecentActivities } from "@/components/recent-activities";
// import { UpcomingEvents } from "@/components/upcoming-events";
import { Bell, Plus, Search } from "lucide-react";

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

import { AppSidebar } from "~/components/commons/app-sidebar";

export default function DashboardPage() {
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Quick Action
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

            {/* Stats Cards */}
            {/* <DashboardStats /> */}

            {/* Charts and Activities Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Chart Placeholder */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Employee Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/50 lg:h-[300px]">
                    <p className="text-muted-foreground">
                      Chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              {/* <RecentActivities /> */}
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upcoming Events */}
              {/* <UpcomingEvents /> */}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Engineering</span>
                      <span className="text-sm text-muted-foreground">
                        245 employees
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sales</span>
                      <span className="text-sm text-muted-foreground">
                        156 employees
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Marketing</span>
                      <span className="text-sm text-muted-foreground">
                        89 employees
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">HR</span>
                      <span className="text-sm text-muted-foreground">
                        23 employees
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Finance</span>
                      <span className="text-sm text-muted-foreground">
                        34 employees
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
