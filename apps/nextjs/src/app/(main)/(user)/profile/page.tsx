"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { checkAuth, updateEmail, updatePassword } from "~/actions/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("account");
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    async function fetchUser() {
      try {
        const authUser = await checkAuth();
        if (!authUser) {
          router.push("/login");
        } else {
          setUser(authUser);
        }
      } catch (error: any) {
        console.log("Error", error.messge);
      }
    }
    fetchUser();
  }, [router]);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Email update state
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validate password match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      await updatePassword(newPassword, confirmPassword);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);

    // Validate email
    if (!isValidEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check if new email is the same as current
    if (user?.email === newEmail) {
      setEmailError("New email must be different from current email");
      return;
    }

    setIsEmailSubmitting(true);

    try {
      await updateEmail(newEmail);
      setEmailSuccess(true);
      setNewEmail("");
    } catch (error: any) {
      setEmailError(error.message);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p>Please sign in to view your profile.</p>
            <Button className="mt-4" asChild>
              <a href="/(user)/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="account"
            className="w-full"
            onValueChange={(value) => setCurrentTab(value)}
          >
            <TabsList className="mb-6 grid w-full grid-cols-2 md:w-auto">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  View and update your account details.
                </p>
              </div>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input id="current-email" value={user.email ?? ""} disabled />
                </div>
              </div>

              <Separator className="my-6" />

              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Change Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your email address. A verification email will be
                    sent.
                  </p>
                </div>

                {emailError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{emailError}</AlertDescription>
                  </Alert>
                )}

                {emailSuccess && (
                  <Alert
                    variant="default"
                    className="border-green-200 bg-green-50 text-green-800"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Verification email sent to your new address. Please check
                      your inbox.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="new-email">New Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isEmailSubmitting}
                >
                  {isEmailSubmitting ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Update Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password to keep your account secure.
                </p>
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert
                  variant="default"
                  className="border-green-200 bg-green-50 text-green-800"
                >
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your password has been updated successfully.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters and contain at
                      least 1 number
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isPasswordSubmitting}
                >
                  {isPasswordSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
