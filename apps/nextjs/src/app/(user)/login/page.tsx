"use client";

import type React from "react";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  GithubIcon,
  TwitterIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import {
  handleSignInWithGoogle,
  registerUser,
  signInEmail,
} from "../../actions/auth";
import ConfirmEmail from "./_components/confirm-email";
import MainTabs from "./_components/main-tab";
import NewResetPassword from "./_components/new-reset-password";
import ResetPassword from "./_components/reset-password";
import SignInForm from "./_components/sign-in-form";
import SignUpForm from "./_components/sign-up-form";
import Success from "./_components/success";

export type AuthView =
  | "signup"
  | "signin"
  | "confirm-email"
  | "reset-password"
  | "new-password";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Use 'signin' as the default tab for a better first-time user experience
  const [currentTab, setCurrentTab] = useState<"signup" | "signin">("signin");
  const [currentView, setCurrentView] = useState<AuthView>("signin");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password strength validation (min 8 chars, at least 1 number)
  const isStrongPassword = (password: string) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      await handleSignInWithGoogle();
    });
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

  const handleConfirmEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!confirmationCode || confirmationCode.length < 6) {
      setError("Please enter a valid confirmation code");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call for email confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSuccessMessage("Email confirmed successfully! You can now sign in.");
      // Clear form fields
      setConfirmationCode("");
    }, 1500);
  };

  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call for password reset request
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentView("new-password");
      setSuccessMessage("Reset code sent to your email");
    }, 1500);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate confirmation code
    if (!confirmationCode || confirmationCode.length < 6) {
      setError("Please enter a valid reset code");
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

    // Simulate API call for password reset
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSuccessMessage(
        "Password reset successfully! You can now sign in with your new password.",
      );
      // Clear form fields
      setConfirmationCode("");
      setPassword("");
      setConfirmPassword("");
    }, 1500);
  };
  const resetForm = () => {
    setIsSuccess(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setConfirmationCode("");
    setError(null);
    setSuccessMessage(null);
    setCurrentView(currentTab);
  };

  const goBack = () => {
    setError(null);
    setSuccessMessage(null);
    if (currentView === "confirm-email") {
      setCurrentView("signup");
    } else if (
      currentView === "reset-password" ||
      currentView === "new-password"
    ) {
      setCurrentView("signin");
    }
  };

  const renderCurrentView = () => {
    if (isSuccess) {
      return <Success currentTab={currentTab} resetForm={resetForm} />;
    }

    switch (currentView) {
      case "signup":
        return (
          <>
            <MainTabs
              setCurrentTab={setCurrentTab}
              setCurrentView={setCurrentView}
              resetForm={resetForm}
              AuthView={"signup"}
            />
            <SignUpForm
              handleSignUp={handleSignUp}
              handleGoogleLogin={handleGoogleLogin}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isSubmitting={isSubmitting}
              isGoogleLoading={isPending}
            />
          </>
        );
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
              handleGoogleLogin={handleGoogleLogin}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSubmitting={isSubmitting}
              isGoogleLoading={isPending}
              setCurrentView={setCurrentView}
            />
          </>
        );
      case "confirm-email":
        return (
          <ConfirmEmail
            goBack={goBack}
            email={email}
            confirmationCode={confirmationCode}
            isSubmitting={isSubmitting}
            setConfirmationCode={setConfirmationCode}
            handleConfirmEmail={handleConfirmEmail}
          />
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
            email={email}
            isSubmitting={isSubmitting}
            confirmationCode={confirmationCode}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handlePasswordReset={handlePasswordReset}
            setConfirmationCode={setConfirmationCode}
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
