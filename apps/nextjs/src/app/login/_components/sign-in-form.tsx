import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { Button } from "@acme/ui/button";

import type { AuthView } from "~/app/login/_components/page-client";

interface SignInFormProps {
  handleSignIn: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  setCurrentView?: Dispatch<SetStateAction<AuthView>>;
}

const SignInForm = ({
  handleSignIn,
  isSubmitting,
  // setCurrentView,
}: SignInFormProps) => {
  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="relative flex items-center"></div>
      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In Google"}
        </Button>

        {/* <div className="text-center">
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView("reset-password");
            }}
          >
            Forgot password?
          </Button>
        </div> */}
      </div>
    </form>
  );
};

export default SignInForm;
