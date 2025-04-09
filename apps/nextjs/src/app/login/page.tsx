import { Suspense } from "react";

import Page from "./_components/page-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center">Đang tải trang đăng nhập...</div>
      }
    >
      <Page />
    </Suspense>
  );
}
