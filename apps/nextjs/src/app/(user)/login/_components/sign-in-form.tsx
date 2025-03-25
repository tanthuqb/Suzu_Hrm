import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";

import type { AuthView } from "../page";

interface SignInFormProps {
  handleSignIn: React.FormEventHandler<HTMLFormElement>;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  setCurrentView: Dispatch<SetStateAction<AuthView>>;
}

const SignInForm = ({
  handleSignIn,
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  setCurrentView,
}: SignInFormProps) => {
  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="relative flex items-center"></div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <div className="text-center">
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
        </div>
      </div>
    </form>
  );
};

export default SignInForm;
