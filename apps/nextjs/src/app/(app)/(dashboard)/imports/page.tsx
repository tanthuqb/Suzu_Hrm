"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import type { HRMUserInput } from "@acme/db";
import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { useAuth } from "~/app/hooks/useAuth";
import { useTRPC } from "~/trpc/react";

interface UserRow {
  "Email Address [Required]": string;
  "First Name [Required]": string;
  "Last Name [Required]": string;
  "Mã NV"?: string;
  "Work Phone"?: string;
  Role?: string;
  "Status [READ ONLY]"?: string;
}

export default function ImportPage() {
  const trpc = useTRPC();

  const [fileData, setFileData] = useState<HRMUserInput[]>([]);
  const [textPreview, setTextPreview] = useState("");
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (!isAdmin) {
      toast.error("Bạn không có quyền vào phần này");
      router.replace("/users");
    }
  }, [user, isAdmin, router]);

  const importUsers = useMutation(
    trpc.user.imports.mutationOptions({
      onSuccess: ({ insertedCount, ignoredCount }) => {
        toast.success(
          `✅ Đã import ${insertedCount} va ${ignoredCount} người dùng`,
        );
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  function formatPhone(raw: unknown): string {
    if (!raw || (typeof raw !== "string" && typeof raw !== "number")) return "";

    const str = String(raw).trim();
    if (str.toLowerCase() === "undefined") return "";

    return str.length === 9 ? "0" + str : str;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();

    const reader = new FileReader();

    reader.onload = () => {
      const rawData = reader.result;

      try {
        let rawJson: UserRow[] = [];

        if (ext === "json") {
          rawJson = JSON.parse(rawData as string) as UserRow[];
        } else if (ext === "xlsx" || ext === "xls") {
          const workbook = XLSX.read(rawData, { type: "binary" });

          if (workbook.SheetNames.length === 0) {
            setError("❌ Không tìm thấy sheet trong file Excel");
            return;
          }

          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            setError("❌ Không thể tìm thấy sheet đầu tiên trong file Excel");
            return;
          }

          const sheet = workbook.Sheets[sheetName];
          if (!sheet) {
            setError("❌ Không thể tìm thấy sheet đầu tiên trong file Excel");
            return;
          }

          rawJson = XLSX.utils.sheet_to_json(sheet);
        } else {
          setError("❌ Chỉ hỗ trợ file .json, .xlsx hoặc .xls");
          return;
        }

        const allowedDomains = ["@suzu.group", "@suzu.edu.vn"];

        const formatted = rawJson
          .map((row) => {
            const email = row["Email Address [Required]"].trim();
            if (!email || !allowedDomains.some((d) => email.endsWith(d)))
              return null;

            return {
              firstName: row["First Name [Required]"]
                ? row["First Name [Required]"].trim()
                : "",
              lastName: row["Last Name [Required]"]
                ? row["Last Name [Required]"].trim()
                : "",
              email,
              employeeCode: row["Mã NV"]?.trim() ?? "",
              phone: formatPhone(row["Work Phone"]),
              role: row.Role?.trim() ?? "user",
              status:
                row["Status [READ ONLY]"]?.trim().toLowerCase() == "active"
                  ? "Active"
                  : "Suspended",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          })
          .filter((item): item is HRMUserInput => !!item);

        if (formatted.length === 0) {
          setError(
            "❌ Không có email hợp lệ để import (chỉ chấp nhận @suzu.group hoặc @suzu.edu.vn)",
          );
          return;
        }

        setFileData(formatted);
        setTextPreview(JSON.stringify(formatted, null, 2));
      } catch (err) {
        console.error(err);
        setError(
          "❌ Không thể đọc file. Vui lòng kiểm tra định dạng và nội dung.",
        );
      }
    };

    if (ext === "json") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = () => {
    if (!fileData.length) {
      setError("Chưa có dữ liệu!");
      return;
    }

    setError(null);
    importUsers.mutate(fileData);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Dữ Liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file" className="mb-1">
              Chọn file
            </Label>
            <Input
              id="file"
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Hỗ trợ định dạng: .json, .xlsx, .xls
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="preview" className="mb-1">
              Nội dung file
            </Label>
            <Textarea
              id="preview"
              rows={12}
              value={textPreview}
              readOnly
              className="font-mono text-sm"
              placeholder="Dữ liệu sẽ hiển thị ở đây sau khi chọn file"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={isLoading || fileData.length === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              "Đang xử lý..."
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import vào Supabase
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
