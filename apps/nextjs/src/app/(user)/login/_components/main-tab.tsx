import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { Tabs, TabsContent } from "@acme/ui/tabs";

import type { AuthView } from "../page";

interface MainTabsProps {
  setCurrentTab: Dispatch<SetStateAction<"signin">>;
  setCurrentView: Dispatch<SetStateAction<AuthView>>;
  AuthView: AuthView;
  resetForm: () => void;
}

const MainTabs = ({
  setCurrentTab,
  setCurrentView,
  resetForm,
  AuthView,
}: MainTabsProps) => {
  return (
    <Tabs
      defaultValue={AuthView}
      value={AuthView}
      className="w-full"
      onValueChange={(value) => {
        setCurrentTab(value as "signin");
        setCurrentView(value as AuthView);
        resetForm();
      }}
    >
      <TabsContent value="signup" className="space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Create an Account
        </h2>
        <p className="mb-6 text-center text-muted-foreground">
          Sign up to get started with our service
        </p>
      </TabsContent>

      <TabsContent value="signin" className="space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Welcome Back
        </h2>
        <p className="mb-6 text-center text-muted-foreground">
          Sign in to access your account
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;
