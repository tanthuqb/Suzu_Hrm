"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="mb-4 text-3xl font-bold">❗ Xác thực thất bại</h1>
        <p className="mb-6">Quá trình xác thực thất bại. Vui lòng thử lại.</p>
        <div className="mb-4 flex w-full flex-col justify-center gap-2 sm:flex-row">
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
    </div>
  );
}
