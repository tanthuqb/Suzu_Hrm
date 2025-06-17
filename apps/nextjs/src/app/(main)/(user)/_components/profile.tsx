"use client";

import React, { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  BarChart3,
  Building,
  Calendar,
  Clock,
  IdCard,
  Mail,
  Phone,
  TrendingUp,
  Upload,
  UserCircle,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { toast } from "@acme/ui/toast";

import type { AttendanceStatusCount } from "~/libs/data/attendances";
import type { UserByIdResult } from "~/libs/data/users";
import { uploadFile } from "~/actions/upload";
import { AttendanceStatsDialog } from "~/app/(main)/(hr)/_components/attendances/attendance-statistics-dialog";
import { formatDate, getRelativePath } from "~/libs/index";
import { useTRPC } from "~/trpc/react";

export const ProfileContent = ({
  userData,
  userLeaveBalance,
  month,
}: {
  userData: UserByIdResult;
  userLeaveBalance: AttendanceStatusCount[];
  month?: number;
}) => {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction] = useActionState(uploadFile, {
    message: null,
    url: null,
  });
  const [uploading, setUploading] = useState(false);
  const [totalWorkingDays, setTotalWorkingDays] = useState(22);
  const userId = userData.id;

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      toast("Error", { description: decodeURIComponent(message) });
      const params = new URLSearchParams(searchParams);
      params.delete("message");
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const updateImageAvatar = useMutation(
    trpc.user.updateAvatar.mutationOptions({
      onSuccess: () => {
        toast("Success", {
          description: "Cập nhật ảnh đại diện thành công",
        });
        router.refresh();
      },
      onError: (error) => {
        toast("Error", {
          description: error.message,
        });
      },
    }),
  );

  useEffect(() => {
    if (state.url) {
      updateImageAvatar.mutate({ id: userId, avatar: state.url });
    }
  }, [state.url, userId, updateImageAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected ?? null);

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploading(false);

    const fileInput = document.getElementById(
      "avatar-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const avatarToShow =
    previewUrl || userData.avatar || "/uploads/default-avatar.png";

  return (
    <div className="container mx-auto space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Thông tin nhân sự
        </h1>
        <p className="text-muted-foreground">
          Xem và cập nhật thông tin nhân sự của bạn
        </p>
      </div>

      {/* Profile Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <form
                action={formAction}
                encType="multipart/form-data"
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-blue-100 ring-4 ring-blue-200 lg:h-32 lg:w-32">
                    {previewUrl ? (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full rounded-full object-cover"
                        style={{ width: 128, height: 128 }}
                      />
                    ) : (
                      <Image
                        src={
                          getRelativePath(avatarToShow) || "/placeholder.svg"
                        }
                        alt="User avatar"
                        sizes="(max-width: 128px) 100vw, 128px"
                        fill
                        className="h-full w-full object-cover"
                        priority
                      />
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mb-4"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>

                <input
                  id="avatar-upload"
                  type="file"
                  name="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {file && (
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearPreview}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>

              {/* Upload Requirements */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>Max: 5 MB</p>
                <p>Types: JPG, PNG, WebP</p>
                <p>Min: 100x100px</p>
              </div>

              {state.message &&
                state.message !== "File uploaded successfully!" && (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {state.message}
                  </div>
                )}
            </div>

            {/* User Info Section */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                  {userData.name}
                </h2>
                <p className="text-base text-muted-foreground lg:text-lg">
                  {userData.positions?.name || "Employee"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData.departments?.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      userData.status === "active" ? "default" : "destructive"
                    }
                    className="bg-green-600"
                  >
                    ACTIVE
                  </Badge>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate text-sm font-medium">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{userData.phone}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <IdCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        Employee ID
                      </p>
                      <p className="text-sm font-medium">
                        {userData.employeeCode}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tổng quan chấm công
            </CardTitle>
            <AttendanceStatsDialog
              attendanceData={userLeaveBalance}
              userName={userData.lastName + " " + userData.firstName}
              period={"Tháng" + month}
              totalWorkingDays={totalWorkingDays}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Chi tiết
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng ngày</p>
                <p className="text-xl font-bold lg:text-2xl">
                  {totalWorkingDays}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="rounded-full bg-blue-100 p-2">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày làm việc</p>
                <p className="text-xl font-bold text-green-600 lg:text-2xl">
                  {userLeaveBalance[0]
                    ? Object.values(userLeaveBalance[0].counts).reduce(
                        (sum, val) => Number(sum) + Number(val),
                        0,
                      )
                    : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="rounded-full bg-orange-100 p-2">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nghỉ </p>
                <p className="text-xl font-bold text-orange-600 lg:text-2xl">
                  {(userLeaveBalance[0]?.counts.P1 ?? 0) +
                    (userLeaveBalance[0]?.counts.P ?? 0) +
                    (userLeaveBalance[0]?.counts.Pk ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="rounded-full bg-orange-100 p-2">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Ngày nghỉ có lương
                </p>
                <p className="text-xl font-bold text-orange-600 lg:text-2xl">
                  {(userLeaveBalance[0]?.counts.L ?? 0) +
                    (userLeaveBalance[0]?.counts.Nb ?? 0) +
                    (userLeaveBalance[0]?.counts.W ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Full Name</span>
                <span className="text-right text-sm font-medium">
                  {userData.name}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">
                  First Name
                </span>
                <span className="text-right text-sm font-medium">
                  {userData.firstName}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Last Name</span>
                <span className="text-right text-sm font-medium">
                  {userData.lastName}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="break-all text-right text-sm font-medium">
                  {userData.email}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-right text-sm font-medium">
                  {userData.phone}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">
                  Department
                </span>
                <span className="text-right text-sm font-medium">
                  {userData.departments?.name ?? "Not assigned"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Position</span>
                <span className="text-right text-sm font-medium">
                  {userData.positions?.name ?? "Not assigned"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-right text-sm font-medium">
                  {userData.role?.name ?? "Not assigned"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">
                  Created At
                </span>
                <span className="text-right text-sm font-medium">
                  {userData.createdAt
                    ? formatDate(userData.createdAt.toString())
                    : "null"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">
                  Updated At
                </span>
                <span className="text-right text-sm font-medium">
                  {userData.updatedAt
                    ? formatDate(userData.updatedAt.toString())
                    : "null"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Information Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ID</TableCell>
                  <TableCell className="break-all">{userData.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Employee Code</TableCell>
                  <TableCell>{userData.employeeCode ?? "null"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>{userData.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">First Name</TableCell>
                  <TableCell>{userData.firstName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Last Name</TableCell>
                  <TableCell>{userData.lastName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell className="break-all">{userData.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Phone</TableCell>
                  <TableCell>{userData.phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        userData.status === "active" ? "default" : "destructive"
                      }
                    >
                      {userData.status}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Department</TableCell>
                  <TableCell>
                    {userData.departments?.name ?? "Not assigned"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Position</TableCell>
                  <TableCell>
                    {userData.positions?.name ?? "Not assigned"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Role ID</TableCell>
                  <TableCell>{userData.role?.name ?? "Not assigned"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Created At</TableCell>
                  <TableCell>
                    {userData.createdAt
                      ? formatDate(userData.createdAt.toString())
                      : "null"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Updated At</TableCell>
                  <TableCell>
                    {userData.updatedAt
                      ? formatDate(userData.updatedAt.toString())
                      : "null"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
