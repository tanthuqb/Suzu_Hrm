"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Users } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { signOut } from "~/app/actions/auth";
import { useAuth } from "~/app/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const { user, isAdmin } = useAuth();

  if (!user) {
    // We'll redirect in the useEffect above, but return null for SSR
    return null;
  }

  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut();
      router.push("/login");
    });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-r bg-gray-50 p-4 md:w-64">
        <div className="flex h-12 items-center">
          <span className="text-xl font-bold text-purple-600">HRM Admin</span>
        </div>

        <Separator className="my-4" />

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </Button>
          {isAdmin ? (
            <Button
              variant={isActive("/profile") ? "primary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </Button>
          ) : null}
          {isAdmin ? (
            <Button
              variant={isActive("/imports") ? "primary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/imports">
                <Users className="mr-2 h-4 w-4" />
                Import Suzu
              </Link>
            </Button>
          ) : null}
        </nav>

        <div className="absolute bottom-4 left-4 md:bottom-8">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">{children}</main>
    </div>
  );
}
