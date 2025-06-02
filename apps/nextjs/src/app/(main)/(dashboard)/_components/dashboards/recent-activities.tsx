"use client";

import type { RecentActivity } from "@acme/db";
import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { formatDate } from "~/libs";

interface RecentActivitiesProps {
  recentActivities: RecentActivity[];
}

export function RecentActivities({ recentActivities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((recentActivitie: RecentActivity) => (
            <div
              key={recentActivitie.id}
              className="flex items-center space-x-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {recentActivitie.user?.avatar
                    ? recentActivitie.user.avatar
                    : recentActivitie.user
                      ? `${recentActivitie.user.lastName?.[0] ?? ""}${recentActivitie.user.firstName?.[0] ?? ""}`
                      : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {recentActivitie.user
                      ? recentActivitie.user.lastName +
                        " " +
                        recentActivitie.user.firstName
                      : "Unknown User"}
                  </p>
                  {/* <Badge variant="outline">{recentActivitie.type}</Badge> */}
                </div>
                <p className="text-sm text-muted-foreground">
                  {recentActivitie.action}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(recentActivitie.createdAt?.toISOString() ?? "")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
