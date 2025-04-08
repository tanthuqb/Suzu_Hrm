import type { FormEventHandler, MouseEventHandler } from "react";
import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface ResetPasswordProps {
  goBack: MouseEventHandler<HTMLButtonElement>;
  email: string;
  setEmail: (value: string) => void;
  isSubmitting: boolean;
  handleRequestPasswordReset: FormEventHandler<HTMLFormElement>;
}

const ResetPassword = ({
  goBack,
  handleRequestPasswordReset,
  email,
  setEmail,
  isSubmitting,
}: ResetPasswordProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 h-8 w-8 p-0"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
      </div>
      <p className="mb-6 text-muted-foreground">
        Enter your email address and we'll send you a code to reset your
        password.
      </p>

      <form onSubmit={handleRequestPasswordReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email </Label>
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
          {isSubmitting ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
