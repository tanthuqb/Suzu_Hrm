"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";

import { handleSignInWithGoogle } from "~/actions/auth";
import { env } from "~/env";
import SignInForm from "./sign-in-form";
import Success from "./success";

export type AuthView = "signin" | "reset-password" | "new-password";

export default function Page() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTab] = useState<"signin">("signin");
  const [currentView, setCurrentView] = useState<AuthView>("signin");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const message = searchParams.get("message");
  const nextRaw = searchParams.get("next");

  useEffect(() => {
    if (message) {
      setError(decodeURIComponent(message));
    }

    if (nextRaw) {
      const innerParams = new URLSearchParams(nextRaw.split("?")[1]);
      const viewParam = innerParams.get("view");

      if (viewParam === "new-password") {
        setCurrentView("new-password");
      }
    } else if (view === "new-password") {
      setCurrentView("new-password");
    }
  }, [view, message, nextRaw]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await handleSignInWithGoogle();
    } catch (err) {
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as any).message === "string"
      ) {
        errorMessage = (err as any).message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
    setCurrentView(currentTab);
  };

  const renderCurrentView = () => {
    if (isSuccess) {
      return <Success currentTab={currentTab} resetForm={resetForm} />;
    }

    switch (currentView) {
      case "signin":
        return (
          <SignInForm
            handleSignIn={handleSignIn}
            isSubmitting={isSubmitting}
            setCurrentView={setCurrentView}
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
