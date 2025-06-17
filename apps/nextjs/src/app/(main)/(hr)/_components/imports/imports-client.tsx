"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import type { AttendanceStatus } from "@acme/db";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

export default function ImportPage() {
  const [fileData, setFileData] = useState<any>([]);
  const [textPreview, setTextPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const trpc = useTRPC();

  const importMutation = useMutation(
    trpc.hr.importAttendances.mutationOptions({
      onSuccess: (data) => {
        toast.success(`✅ Đã import ${data.insertedCount} dòng`);
        setFileData([]);
        setTextPreview("");
      },
      onError: (err) => {
        toast.error(err.message || "❌ Lỗi import");
      },
      onSettled: () => {
        setIsLoading(false);
      },
    }),
  );

  const previewMutation = useMutation(
    trpc.hr.previewAttendances.mutationOptions({
      onMutate() {
        setIsLoading(true);
      },
      onSuccess: (data: any[]) => {
        setFileData(data);
        setTextPreview(JSON.stringify(data, null, 2));
      },
      onError: (err: any) => {
        toast.error(err.message || "Không thể preview dữ liệu.");
        setError(err.message || "Không thể preview dữ liệu.");
      },
      onSettled: () => {
        setIsLoading(false);
      },
    }),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = () => {
      const rawData = reader.result;

      try {
        let rawJson: any[] = [];

        if (ext === "json") {
          if (!rawData) throw new Error("Không thể đọc file JSON.");
          rawJson = JSON.parse(rawData as string);
        } else if (ext === "xlsx" || ext === "xls") {
          if (!rawData) throw new Error("Không thể đọc file Excel.");

          const workbook = XLSX.read(rawData, { type: "binary" });
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("File Excel không chứa sheet nào.");
          }

          // Chuyển selectedMonth (vd: "2025-06") => "tháng 6"
          let monthNum = 0;
          if (selectedMonth) {
            const [, monthPart] = selectedMonth.split("-");
            monthNum = Number(monthPart);
          }
          const normalizedSheetName = `tháng ${monthNum}`;
          const targetSheet = workbook.Sheets[normalizedSheetName];
          if (!targetSheet) {
            console.error(`❌ Không tìm thấy sheet với tên "${selectedMonth}"`);
            return;
          }

          const sheetData = XLSX.utils.sheet_to_json(targetSheet, {
            defval: "",
            raw: true,
          });

          sheetData.forEach((row: any) => {
            let email = row.Email || row.email;

            if (!email) {
              for (const key of Object.keys(row)) {
                const value = row[key];
                if (typeof value === "string" && value.includes("@")) {
                  email = value;
                  break;
                }
              }
            }

            if (!email) return;

            rawJson.push({
              ...row,
              Email: email.trim(),
              sheetName: selectedMonth,
            });
          });
        } else {
          throw new Error("Chỉ hỗ trợ file .json, .xlsx hoặc .xls");
        }

        setTextPreview(JSON.stringify(rawJson, null, 2));
        previewMutation.mutate(rawJson);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Không thể đọc file.";
        setError(`❌ ${message}`);
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
    setIsLoading(true);
    importMutation.mutate({
      month: selectedMonth!,
      items: fileData.map((d: any) => ({
        ...d,
        status: d.status as AttendanceStatus,
      })),
    });
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
            <Label htmlFor="month">Chọn tháng</Label>
            <Select
              value={selectedMonth?.slice(5) ?? ""}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger id="month" className="w-full">
                <SelectValue
                  placeholder="Chọn tháng (tuỳ chọn)"
                  defaultValue=""
                >
                  {selectedMonth ? `Tháng ${selectedMonth.slice(5)}` : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => {
                  const month = (i + 1).toString().padStart(2, "0");
                  const year = new Date().getFullYear();
                  const value = `${year}-${month}`;
                  return (
                    <SelectItem key={value} value={value}>
                      Tháng {month}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file">Chọn file</Label>
            <Input
              id="file"
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
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
            <Label htmlFor="preview">Nội dung file</Label>
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
