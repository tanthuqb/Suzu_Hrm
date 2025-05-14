"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { SidebarTrigger } from "@acme/ui/sidebar";

import type { Notification } from "~/types";
import { signOut } from "~/actions/auth";
import { ModeToggle } from "~/components/commons/mode-toggle";

export function Header() {
  const router = useRouter();

  const [notifications] = useState<Notification[]>([
    {
      id: "sfd96f6de-f447-4562-8d0e-cfcc6e205b292",
      userId: "sfd96f6de-f447-4562-8d0e-cfcc6e205b29",
      title: "New User Registered",
      message: "SuZu Xom Xine has registered",
      time: "5 minutes ago",
      read: false,
      type: "Sms",
    },
    {
      id: "sfd96f6de-f447-4562-8d0e-cfcc6e205b293",
      userId: "sfd96f6de-f447-4562-8d0e-cfcc6e205b29",
      title: "New User Registered",
      message: "SuZu Xom Xine has registered",
      time: "5 minutes ago",
      read: false,
      type: "Sms",
    },
    {
      id: "sfd96f6de-f447-4562-8d0e-cfcc6e205b294",
      userId: "sfd96f6de-f447-4562-8d0e-cfcc6e205b29",
      title: "New User Registered",
      message: "SuZu Xom Xine has registered",
      time: "5 minutes ago",
      read: false,
      type: "Sms",
    },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/login");
    });
  };
  return (
    <header className="border-b border-border">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={markAllAsRead}
                      className="h-7 px-2 text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex cursor-default flex-col items-start p-3"
                      // onSelect={() => markAsRead(notification.id)}
                    >
                      <div className="flex w-full items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm font-medium">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={"profile"}>
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link href={"settings"}>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href={""} onClick={() => handleSignOut()}>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
