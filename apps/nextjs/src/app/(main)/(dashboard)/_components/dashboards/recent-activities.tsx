"use client";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "submitted leave request",
    time: "2 hours ago",
    type: "leave",
  },
  {
    id: 2,
    user: "Sarah Wilson",
    action: "completed onboarding",
    time: "4 hours ago",
    type: "onboarding",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "updated profile",
    time: "6 hours ago",
    type: "profile",
  },
  {
    id: 4,
    user: "Emily Brown",
    action: "submitted timesheet",
    time: "8 hours ago",
    type: "timesheet",
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
