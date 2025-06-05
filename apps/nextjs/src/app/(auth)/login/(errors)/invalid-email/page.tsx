"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

export default function InvalidEmailPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-center text-3xl font-bold">
        ❗ Xác thực thất bại
      </h1>
      <p className="mb-6 text-center">
        Quá trình xác thực thất bại. Vui lòng thử lại.
      </p>
      <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Quay lại
        </Button>
        <Button
          variant="default"
          onClick={() => router.push("/login?undo=1")}
          className="w-full sm:w-auto"
        >
          Đăng nhập lại
        </Button>
      </div>
    </div>
  );
}
