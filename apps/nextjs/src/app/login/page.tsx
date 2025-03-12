import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { AuthShowcase } from "../_components/auth-showcase";

const LoginPage = () => {
  return (
    <main className="container flex h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-3xl font-bold">Login</h1>

        <form className="flex flex-col gap-3">
          <Input type="email" placeholder="Email" className="w-full" />
          <Input type="password" placeholder="Password" className="w-full" />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <AuthShowcase />
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
