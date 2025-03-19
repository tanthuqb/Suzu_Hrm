"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Users } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { useAuth } from "../_components/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/(user)/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    // We'll redirect in the useEffect above, but return null for SSR
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/(user)/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-50 border-r p-4">
        <div className="flex h-12 items-center">
          <span className="font-bold text-xl text-purple-600">HRM Admin</span>
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
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}