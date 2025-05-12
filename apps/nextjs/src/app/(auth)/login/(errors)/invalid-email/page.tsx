"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

export default function InvalidEmailPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-3xl font-bold">❗ Email không hợp lệ</h1>
      <p className="mb-6">
        Vui lòng kiểm tra lại địa chỉ email của bạn và đăng nhập lại.
      </p>
      <div className="space-x-2">
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
        <Button variant="default" onClick={() => router.push("/login?undo=1")}>
          Đăng nhập lại
        </Button>
      </div>
    </div>
  );
}
