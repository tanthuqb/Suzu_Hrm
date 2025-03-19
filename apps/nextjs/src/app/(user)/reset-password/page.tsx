"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import { resetPassword } from "../../actions/auth";
import { createClient } from "@acme/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHashPresent, setIsHashPresent] = useState(false);

  useEffect(() => {
    // Check if hash fragment is present (Supabase adds it for password reset)
    const hasHashFragment = window.location.hash && window.location.hash.includes("type=recovery");
    setIsHashPresent(hasHashFragment);

    if (hasHashFragment) {
      // Handle the recovery hash
      const supabase = createClient();
      // This will handle the password recovery token
      supabase.auth.onAuthStateChange(async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery mode detected");
        }
      });
    }
  }, []);

  // Password strength validation
  const isStrongPassword = (password: string) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password strength
    if (!isStrongPassword(password)) {
      setError("Password must be at least 8 characters and contain at least 1 number");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(password, confirmPassword);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/(user)/login");
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHashPresent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid password reset link. Please request a new password reset link from the forgot password page.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild variant="ghost">
                <Link href="/(user)/forgot-password">Go to Forgot Password</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-4 text-center">
          <Link href="/(user)/login" className="flex items-center text-sm text-purple-600 hover:text-purple-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="space-y-2 py-4 text-center">
              <div className="font-medium text-green-500">
                Password updated successfully!
              </div>
              <p className="text-sm text-muted-foreground">
                You can now use your new password to log in. Redirecting to login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and contain at least 1 number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center text-center text-sm text-muted-foreground">
          <div className="flex items-center">
            Remember your password?{" "}
            <Button variant="link" className="h-auto p-0 pl-1">
              <Link href="/(user)/login">Sign in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}