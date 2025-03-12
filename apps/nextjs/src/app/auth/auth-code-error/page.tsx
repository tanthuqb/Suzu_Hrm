import Link from "next/link";

import { Button } from "@acme/ui/button";

export default function AuthErrorPage() {
  return (
    <main className="container flex h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Authentication Error
        </h1>
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow">
          <div className="flex flex-col gap-4">
            <p className="text-center">
              There was an error during authentication.
              <br />
              Please try again.
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
