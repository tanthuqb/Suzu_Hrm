"use client";

import type React from "react";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, GithubIcon, TwitterIcon } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { toast } from "@acme/ui/toast";

import {
  handleSignInWithGoogle,
  registerUser,
  signInEmail,
} from "../../actions/auth";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState("signup");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password strength validation (min 8 chars, at least 1 number)
  const isStrongPassword = (password: string) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and contain at least 1 number",
      );
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(email, password, confirmPassword);
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("SignUp in failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password presence
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signInEmail(email, password);
      console.log("Sign in successful:", result);

      // Set success state
      setIsSubmitting(false);
      setIsSuccess(true);

      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to home page after short delay to allow cookies to be set
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      await handleSignInWithGoogle();
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white">
            NL
          </div>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-2 py-4 text-center">
              <div className="font-medium text-green-500">
                {currentTab === "signup"
                  ? "Account created successfully!"
                  : "Signed in successfully!"}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTab === "signup"
                  ? "We've sent a confirmation to your email."
                  : "Welcome back!"}
              </p>
              <Button variant="ghost" className="mt-2" onClick={resetForm}>
                Return to form
              </Button>
            </div>
          ) : (
            <>
              <Tabs
                defaultValue="signup"
                className="w-full"
                onValueChange={(value) => {
                  setCurrentTab(value);
                  resetForm();
                }}
              >
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-2">
                  <h2 className="text-center text-2xl font-bold tracking-tight">
                    Create an Account
                  </h2>
                  <p className="mb-6 text-center text-muted-foreground">
                    Sign up to get started with our service
                  </p>
                </TabsContent>

                <TabsContent value="signin" className="space-y-2">
                  <h2 className="text-center text-2xl font-bold tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="mb-6 text-center text-muted-foreground">
                    Sign in to access your account
                  </p>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={currentTab === "signup" ? handleSignUp : handleSignIn}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      className="flex items-center gap-2"
                    >
                      <TwitterIcon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">
                        Twitter
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="flex items-center gap-2"
                    >
                      <GithubIcon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">
                        GitHub
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="relative flex h-full w-full items-center gap-2"
                      disabled={isPending}
                      onClick={handleGoogleLogin}
                    >
                      <div className="relative h-full w-full">
                        {isPending ? (
                          "Redirecting..."
                        ) : (
                          <Image
                            src="/signin-assets/Web (mobile + desktop)/png@1x/neutral/web_neutral_rd_SU@1x.png"
                            layout="fill"
                            objectFit="contain"
                            alt="Google"
                          />
                        )}
                      </div>
                    </Button>
                  </div>

                  <div className="relative flex items-center">
                    <Separator className="flex-1" />
                    <span className="mx-2 text-xs text-muted-foreground">
                      OR
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {currentTab === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? currentTab === "signup"
                        ? "Creating Account..."
                        : "Signing In..."
                      : currentTab === "signup"
                        ? "Create Account"
                        : "Sign In"}
                  </Button>

                  {currentTab === "signin" && (
                    <div className="text-center">
                      <Button variant="link" className="h-auto p-0 text-sm" asChild>
                        <Link href="/(user)/forgot-password">Forgot password?</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Help
            </a>
          </div>
          <p className="text-xs">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}