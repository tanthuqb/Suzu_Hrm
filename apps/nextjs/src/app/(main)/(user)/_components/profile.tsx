"use client";

import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Building,
  Calendar,
  IdCard,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
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

import { formatDate } from "~/libs/index";
import { useTRPC } from "~/trpc/react";

export const ProfileContent = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();

  const {
    data: user,
    isLoading,
    error,
  } = useSuspenseQuery(
    trpc.user.byId.queryOptions({
      id: userId,
    }),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Error: {error.message}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Profile</CardTitle>
          <CardDescription>
            View your profile information and manage account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Employee Code:</span>
                    <span className="text-sm">{user?.employeeCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Full Name:</span>
                    <span className="text-sm">{user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">First Name:</span>
                    <span className="text-sm">{user?.firstName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Name:</span>
                    <span className="text-sm">{user?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant={
                        user?.status === "active" ? "default" : "destructive"
                      }
                    >
                      {user?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Employment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-sm">
                      {user?.departments?.name ?? "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Position:</span>
                    <span className="text-sm">
                      {user?.positionId ?? "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm">
                      {user?.roleName ?? "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created At:</span>
                    <span className="text-sm">
                      {user?.createdAt
                        ? formatDate(user.createdAt.toString())
                        : "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Updated At:</span>
                    <span className="text-sm">
                      {user?.updatedAt
                        ? formatDate(user.updatedAt.toString())
                        : "Not assigned"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Information</CardTitle>
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
                        ? formatDate(user.updatedAt.toString())
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
        </CardContent>
        <Separator className="my-4" />
      </Card>
    </div>
  );
};
