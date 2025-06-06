"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";

import type { FullAttendanceRecord } from "@acme/db";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
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

export function AttendancesTable() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const trpc = useTRPC();

  const { data: attendances, isFetching } = useQuery({
    ...trpc.attendance.getAll.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleDelete = async (id: string) => {};

  const filteredAttendances = useMemo(() => {
    if (!searchTerm) return attendances;
    const term = searchTerm.toLowerCase();
    return attendances?.filter((att) =>
      (att.userName ?? "").toLowerCase().includes(term),
    );
  }, [attendances, searchTerm]);
  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản Lý Chấm Công</h1>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mb-2 text-sm text-muted-foreground">
        Showing {attendances?.length} of {attendances?.length}
      </div>

      {/* Table */}
      <div
        className={`overflow-x-auto rounded-md border transition-opacity ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>ApprovalBy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm
                    ? "Không tìm thấy kết quả nào"
                    : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendances?.map((d: FullAttendanceRecord) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell className="font-medium">{d.userName}</TableCell>
                  <TableCell>{d.userEmail}</TableCell>
                  <TableCell>{d.leaveRequestReason}</TableCell>
                  <TableCell>{d.approvedByName}</TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(d.id);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription id="dialog-desc">
              Quản lý chấm công của công ty
            </DialogDescription>
          </DialogHeader>
          {selected != null &&
            (() => {
              const d = attendances?.find(
                (d: FullAttendanceRecord) => d.id === selected,
              );
              if (!d) return <div>Attendance not found</div>;
              return (
                <div className="space-y-2 py-4">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">User:</div>
                    <div className="col-span-2">{d.userName}</div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">Email:</div>
                    <div className="col-span-2">{d.userEmail}</div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">Office:</div>
                    <div className="col-span-2">{d.office}</div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">Date:</div>
                    <div className="col-span-2">
                      {formatDate(d.date.toISOString())}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">Status:</div>
                    <div className="col-span-2">{d.status}</div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <div className="font-medium">Department:</div>
                    <div className="col-span-2">{d.departmentName}</div>
                  </div>
                  {d.leaveRequestId && (
                    <>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <div className="font-medium">Leave Reason:</div>
                        <div className="col-span-2">{d.leaveRequestReason}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <div className="font-medium">Approved By:</div>
                        <div className="col-span-2">{d.approvedByName}</div>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-2">
                        <div className="font-medium">Leave Status:</div>
                        <div className="col-span-2">{d.leaveRequestStatus}</div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
