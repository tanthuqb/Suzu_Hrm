import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { Button } from "@acme/ui/button";

import type { AuthView } from "./page-client";

interface SignInFormProps {
  handleSignIn: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  setCurrentView?: Dispatch<SetStateAction<AuthView>>;
}

const SignInForm = ({ handleSignIn, isSubmitting }: SignInFormProps) => {
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
      </div>
    </form>
  );
};

export default SignInForm;
