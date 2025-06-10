"use client";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import type { AuditLog } from "~/libs/data/auditlog";
import { formatDate } from "~/libs";

interface RecentActivitiesProps {
  recentActivities: AuditLog[];
}

export function RecentActivities({ recentActivities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((recentActivitie: AuditLog) => (
            <div
              key={recentActivitie.id}
              className="flex items-center space-x-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {recentActivitie.users?.avatar_url
                    ? recentActivitie.users.avatar_url
                    : recentActivitie.users
                      ? `${recentActivitie.users.lastName[0] ?? ""}${recentActivitie.users.firstName[0] ?? ""}`
                      : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {recentActivitie.users
                      ? recentActivitie.users.lastName +
                        " " +
                        recentActivitie.users.firstName
                      : "Unknown User"}
                  </p>
                  {/* <Badge variant="outline">{recentActivitie.type}</Badge> */}
                </div>
                <p className="text-sm text-muted-foreground">
                  {recentActivitie.action}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(recentActivitie.created_at ?? "")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
