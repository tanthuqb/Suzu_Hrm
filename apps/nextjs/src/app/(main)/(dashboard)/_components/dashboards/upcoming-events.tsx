"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

const events = [
  {
    id: 1,
    title: "Team Building Event",
    date: "2024-01-15",
    time: "10:00 AM",
    location: "Conference Room A",
    type: "event",
  },
  {
    id: 2,
    title: "Performance Review Meeting",
    date: "2024-01-16",
    time: "2:00 PM",
    location: "HR Office",
    type: "meeting",
  },
  {
    id: 3,
    title: "New Employee Orientation",
    date: "2024-01-18",
    time: "9:00 AM",
    location: "Training Room",
    type: "training",
  },
];

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border-l-4 border-primary pl-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
