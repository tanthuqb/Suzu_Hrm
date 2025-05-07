"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">404 – Không tìm thấy trang</h1>
      <p>Xin lỗi, trang bạn yêu cầu không tồn tại.</p>
      <Button
        variant="link"
        className="flex items-center space-x-2 text-sm text-muted-foreground"
        onClick={() => router.back()}
      >
        <span>Quay về trang chủ</span>
      </Button>
    </div>
  );
}
