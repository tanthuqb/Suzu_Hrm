import React from "react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";

interface SignUpFormProps {
  handleSignUp: React.FormEventHandler<HTMLFormElement>;
  handleGoogleLogin?: () => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isSubmitting: boolean;
  isGoogleLoading?: boolean;
}

const SignUpForm = ({
  handleSignUp,
  handleGoogleLogin,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isSubmitting,
  isGoogleLoading,
}: SignUpFormProps) => {
  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            type="button"
            className="flex items-center gap-2"
          >
            <TwitterIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:text-xs">Twitter</span>
          </Button>
          <Button
            variant="outline"
            type="button"
            className="flex items-center gap-2"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:text-xs">GitHub</span>
          </Button>
          <Button
            variant="outline"
            type="button"
            className="flex items-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              "Loading..."
            ) : (
              <>
                <img 
                  src="/signin-assets/Web (mobile + desktop)/png@1x/neutral/web_neutral_rd_SU@1x.png"
                  alt="Google"
                  className="h-4 w-4"
                />
                <span className="sr-only sm:not-sr-only sm:text-xs">Google</span>
              </>
            )}
          </Button>
        </div>

        <div className="relative flex items-center">
          <Separator className="flex-1" />
          <span className="mx-2 text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

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
          <p className="mt-1 text-xs text-muted-foreground">
            Must be at least 8 characters with 1 number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
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
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
