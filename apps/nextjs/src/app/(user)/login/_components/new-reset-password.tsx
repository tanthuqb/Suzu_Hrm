import type { FormEventHandler, MouseEventHandler } from "react";
import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface NewResetPasswordProps {
  goBack: MouseEventHandler<HTMLButtonElement>;
  email: string;
  isSubmitting: boolean;
  confirmationCode: string;
  password: string;
  confirmPassword: string;
  setConfirmPassword: (vale: string) => void;
  setPassword: (value: string) => void;
  setConfirmationCode: (value: string) => void;
  handlePasswordReset: FormEventHandler<HTMLFormElement>;
}

const NewResetPassword = ({
  goBack,
  email,
  isSubmitting,
  confirmationCode,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordReset,
  setConfirmationCode,
}: NewResetPasswordProps) => {
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
        <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
      </div>
      <p className="mb-6 text-muted-foreground">
        Enter the code we sent to {email} and create a new password.
      </p>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetCode">Reset Code</Label>
          <Input
            id="resetCode"
            placeholder="Enter 6-digit code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Must be at least 8 characters with 1 number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input
            id="confirmNewPassword"
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
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default NewResetPassword;
