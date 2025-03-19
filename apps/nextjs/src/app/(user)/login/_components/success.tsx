import type { MouseEventHandler } from "react";
import React from "react";
import { CheckCircle } from "lucide-react";

import { Button } from "@acme/ui/button";

interface SuccessProps {
  currentTab: "signup" | "signin";
  resetForm: MouseEventHandler<HTMLButtonElement>;
}

const Success = ({ currentTab, resetForm }: SuccessProps) => {
  return (
    <div className="space-y-4 py-4 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <div className="text-xl font-medium text-green-500">
        {currentTab === "signup"
          ? "Account created successfully!"
          : "Signed in successfully!"}
      </div>
      <p className="text-sm text-muted-foreground">
        {currentTab === "signup"
          ? "We've sent a confirmation to your email."
          : "Welcome back!"}
      </p>
      <Button variant="outline" className="mt-2" onClick={resetForm}>
        Return to form
      </Button>
    </div>
  );
};

export default Success;
