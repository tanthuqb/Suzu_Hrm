"use client";

import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";

import { signInEmail } from "~/app/actions/auth";
import { isStrongPassword, isValidEmail } from "~/app/libs";
import MainTabs from "./main-tab";
import NewResetPassword from "./new-reset-password";
import ResetPassword from "./reset-password";
import SignInForm from "./sign-in-form";
import Success from "./success";

export type AuthView = "signin" | "reset-password" | "new-password";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState<"signin">("signin");
  const [currentView, setCurrentView] = useState<AuthView>("signin");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const message = searchParams.get("message");

  useEffect(() => {
    if (message) {
      setError(message);
    }
    if (view === "new-password") {
      setCurrentView("new-password");
    }
  }, [view]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      await signInEmail(email, password);
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      setPassword("");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const redirectUrl = `${window.location.origin}/callback?next=/login?view=new-password&type=recovery`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage("Check your email for a password reset link.");
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and contain at least 1 number",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
      }

      setIsSuccess(true);
      setSuccessMessage(
        "Password reset successfully! You can now sign in with your new password.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
    setCurrentView(currentTab);
  };

  const goBack = () => {
    setError(null);
    setSuccessMessage(null);
    if (currentView === "reset-password" || currentView === "new-password") {
      setCurrentView("signin");
    }
  };

  const renderCurrentView = () => {
    if (isSuccess) {
      return <Success currentTab={currentTab} resetForm={resetForm} />;
    }

    switch (currentView) {
      case "signin":
        return (
          <>
            <MainTabs
              setCurrentTab={setCurrentTab}
              setCurrentView={setCurrentView}
              resetForm={resetForm}
              AuthView={"signin"}
            />
            <SignInForm
              handleSignIn={handleSignIn}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSubmitting={isSubmitting}
              setCurrentView={setCurrentView}
            />
          </>
        );

      case "reset-password":
        return (
          <ResetPassword
            goBack={goBack}
            email={email}
            isSubmitting={isSubmitting}
            handleRequestPasswordReset={handleRequestPasswordReset}
            setEmail={setEmail}
          />
        );
      case "new-password":
        return (
          <NewResetPassword
            goBack={goBack}
            isSubmitting={isSubmitting}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handlePasswordReset={handlePasswordReset}
          />
        );
      default:
        return null;
    }
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && !isSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {renderCurrentView()}
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
            We respect your privacy and keep your data secure.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
