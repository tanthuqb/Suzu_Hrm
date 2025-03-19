"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import { forgotPassword } from "../../actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-4 text-center">
          <Link href="/(user)/login" className="flex items-center text-sm text-purple-600 hover:text-purple-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="space-y-2 py-4 text-center">
              <div className="font-medium text-green-500">
                Password reset email sent!
              </div>
              <p className="text-sm text-muted-foreground">
                Check your inbox for instructions to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
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
              
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
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