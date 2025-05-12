"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  error: Error & { data?: { code?: string } };
  reset: () => void;
}

export default function UsersError({ error, reset }: Props) {
  const router = useRouter();
  // log để debug
  useEffect(() => {
    console.error("UsersPage crashed:", error);
  }, [error]);

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
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() => reset()} // reset sẽ render lại page.tsx
        >
          Thử lại
        </button>
        <button
          className="rounded bg-gray-200 px-4 py-2"
          onClick={() => router.push(isForbidden ? "/users" : "/")}
        >
          {isForbidden ? "Về Dashboard" : "Về Trang Chủ"}
        </button>
      </div>
    </div>
  );
}
