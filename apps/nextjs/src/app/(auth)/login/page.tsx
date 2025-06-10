import { Suspense } from "react";

import Page from "./_components/page-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Page />
    </Suspense>
  );
}
