"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

interface Props {
  error: Error & { data?: { code?: string } };
  reset: () => void;
}

export default function UsersError({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (error.data?.code === "FORBIDDEN") {
      {
        router.replace("/profile?message=." + error.message);
      }
    }
  }, [error, router]);

  const isForbidden = error.data?.code === "FORBIDDEN";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-3xl font-bold">
        {isForbidden ? "🚫 Không có quyền" : "❗ Đã xảy ra lỗi"}
      </h1>
      <p className="mb-6 text-lg">{error.message}</p>
      {isForbidden && (
        <p className="mb-4">Vui lòng liên hệ quản trị viên nếu cần trợ giúp.</p>
      )}
      <div className="space-x-2">
        <Button onClick={reset} variant="default">
          Thử lại
        </Button>
        <Button
          onClick={() => router.push(isForbidden ? "/users" : "/")}
          variant="secondary"
        >
          {isForbidden ? "Về Dashboard" : "Về Trang Chủ"}
        </Button>
      </div>
    </div>
  );
}
