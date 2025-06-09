import { TRPCReactProvider } from "~/trpc/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
