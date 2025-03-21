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
        We've sent a confirmation link to <strong>{email}</strong>. 
        Please click the link in the email to verify your account.
      </p>

      <div className="space-y-6">
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No need to enter a code here. Just click the link we sent to your email.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={goBack}
        >
          Back to Sign Up
        </Button>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{" "}
          <Button 
            variant="link" 
            className="h-auto p-0" 
            onClick={handleConfirmEmail}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "request a new link"}
          </Button>
        </p>
      </div>
    </div>
  );
};

export default ConfirmEmail;
