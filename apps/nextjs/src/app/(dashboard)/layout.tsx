"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Users } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { checkAuth, signOut } from "../actions/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const authUser = await checkAuth();
        if (!authUser) {
          router.push("/login");
        } else {
          setUser(authUser);
        }
        setLoading(false);
      } catch (error) {
        console.log("Error", error.messge);
      }
    }
    fetchUser();
  }, [router]);

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
            <Link href="/(user)/profile">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/(dashboard)/users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
          </Button>
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
