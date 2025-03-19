import type { ChangeEvent, FormEventHandler, MouseEventHandler } from "react";
import React from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface ConfirmEmailProps {
  goBack: MouseEventHandler<HTMLButtonElement>;
  email: string;
  confirmationCode: string;
  isSubmitting: boolean;
  setConfirmationCode: (value: string) => void;
  handleConfirmEmail: FormEventHandler<HTMLFormElement>;
}

const ConfirmEmail = ({
  goBack,
  email,
  confirmationCode,
  isSubmitting,
  setConfirmationCode,
  handleConfirmEmail,
}: ConfirmEmailProps) => {
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
        <h2 className="text-2xl font-bold tracking-tight">
          Confirm Your Email
        </h2>
      </div>
      <p className="mb-6 text-muted-foreground">
        We've sent a confirmation code to {email}. Please enter it below to
        verify your email address.
      </p>

      <form onSubmit={handleConfirmEmail} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="confirmationCode">Confirmation Code</Label>
          <Input
            id="confirmationCode"
            placeholder="Enter 6-digit code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
    </div>
  );
};

export default ConfirmEmail;
