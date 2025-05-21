"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import type { AttendanceInput, AttendanceStatus } from "@acme/db";
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

import { useTRPC } from "~/trpc/react";

export default function ImportPage() {
  const [fileData, setFileData] = useState<AttendanceInput[]>([]);
  const [textPreview, setTextPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      onSuccess: (data: any) => {
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
          if (!rawData) {
            setError("❌ Không thể đọc file JSON.");
            return;
          }
          rawJson = JSON.parse(rawData as string);
        } else if (ext === "xlsx" || ext === "xls") {
          if (!rawData) {
            setError("❌ Không thể đọc file Excel.");
            return;
          }

          const workbook = XLSX.read(rawData, { type: "binary" });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            setError("❌ File Excel không chứa sheet nào.");
            return;
          }

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            setError("❌ Sheet đầu tiên không hợp lệ.");
            return;
          }

          const sheet = workbook.Sheets[firstSheetName];
          if (!sheet) {
            setError("❌ Sheet đầu tiên không hợp lệ.");
            return;
          }

          rawJson = XLSX.utils.sheet_to_json(sheet);
        } else {
          setError("❌ Chỉ hỗ trợ file .json, .xlsx hoặc .xls");
          return;
        }

        // Hiển thị dữ liệu gốc để debug
        setTextPreview(JSON.stringify(rawJson, null, 2));

        // Gửi dữ liệu thô lên server để chuẩn hóa preview
        previewMutation.mutate(rawJson);
      } catch (err) {
        console.error(err);

        // Handle error safely
        if (err instanceof Error) {
          setError(`❌ Không thể đọc file: ${err.message}`);
        } else {
          setError(
            "❌ Không thể đọc file. Vui lòng kiểm tra định dạng và nội dung.",
          );
        }
      }
    };

    if (ext === "json") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = () => {
    setIsLoading(true);
    if (!fileData.length) {
      setError("Chưa có dữ liệu!");
      return;
    }
    importMutation.mutate(
      fileData.map((d) => ({
        ...d,
        status: d.status as AttendanceStatus,
      })),
    );
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
