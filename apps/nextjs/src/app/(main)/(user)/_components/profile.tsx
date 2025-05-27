"use client";

import React, { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Briefcase,
  Building,
  Calendar,
  IdCard,
  Mail,
  Phone,
  Upload,
  UserCircle,
} from "lucide-react";
import { useFormState } from "react-dom";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Separator } from "@acme/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { toast } from "@acme/ui/toast";

import { uploadFile } from "~/actions/upload";
import { formatDate, getRelativePath } from "~/libs/index";
import { useTRPC } from "~/trpc/react";

export const ProfileContent = ({ userId }: { userId: string }) => {
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

  const queryClient = useQueryClient();

  const { data: user, error } = useSuspenseQuery(
    trpc.user.byId.queryOptions({
      id: userId,
    }),
  );

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
        queryClient.invalidateQueries({
          queryKey: trpc.user.byId.queryKey(),
        });
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
  }, [state.url]);

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

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Error: {error.message}</h1>
      </div>
    );
  }

  const avatarToShow =
    previewUrl || user?.avatar || "/uploads/default-avatar.png";

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Thông tin nhân sự
        </h1>
        <p className="text-muted-foreground">
          Xem và cập nhật thông tin nhân sự của bạn
        </p>
      </div>

      {/* Profile Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            <form
              action={formAction}
              encType="multipart/form-data"
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-blue-100 ring-4 ring-blue-200">
                  <Image
                    src={getRelativePath(avatarToShow)}
                    alt="User avatar"
                    sizes="(max-width: 128px) 100vw, 128px"
                    fill
                    className="h-full w-full object-cover"
                    priority
                  />
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
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {user?.name}
              </h2>
              <p className="text-lg text-muted-foreground">
                {user?.positionId || "Employee"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.departments?.name}
              </p>
              <div className="mt-2">
                <Badge
                  variant={
                    user?.status === "active" ? "default" : "destructive"
                  }
                  className="bg-green-600"
                >
                  ACTIVE
                </Badge>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user?.phone}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <IdCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium">{user?.employeeCode}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Full Name</span>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  First Name
                </span>
                <span className="text-sm font-medium">{user?.firstName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Name</span>
                <span className="text-sm font-medium">{user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">{user?.phone}</span>
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
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Department
                </span>
                <span className="text-sm font-medium">
                  {user?.departments?.name ?? "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Position</span>
                <span className="text-sm font-medium">
                  {user?.positionId ?? "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium">
                  {user?.roleName ?? "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Created At
                </span>
                <span className="text-sm font-medium">
                  {user?.createdAt
                    ? formatDate(user.createdAt.toString())
                    : "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Updated At
                </span>
                <span className="text-sm font-medium">
                  {user?.updatedAt
                    ? formatDate(user.updatedAt.toString())
                    : "Not assigned"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Information Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ID</TableCell>
                <TableCell>{user?.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee Code</TableCell>
                <TableCell>{user?.employeeCode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell>{user?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">First Name</TableCell>
                <TableCell>{user?.firstName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Last Name</TableCell>
                <TableCell>{user?.lastName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{user?.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Phone</TableCell>
                <TableCell>{user?.phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user?.status === "active" ? "default" : "destructive"
                    }
                  >
                    {user?.status}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department</TableCell>
                <TableCell>
                  {user?.departments?.name ?? "Not assigned"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Position</TableCell>
                <TableCell>{user?.positionId ?? "Not assigned"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Role ID</TableCell>
                <TableCell>{user?.roleName ?? "Not assigned"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created At</TableCell>
                <TableCell>
                  {user?.createdAt
                    ? formatDate(user.createdAt.toString())
                    : "Not assigned"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Updated At</TableCell>
                <TableCell>
                  {user?.updatedAt
                    ? formatDate(user.updatedAt.toString())
                    : "Not assigned"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
