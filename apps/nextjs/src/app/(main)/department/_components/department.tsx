"use client";

import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import type { DepartmentRecord } from "@acme/db/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";
import { DepartmentForm } from "./_forms/department-form";

export default function DepartmentsPage() {
  const trpc = useTRPC();

  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const { data: users, isFetching: isFetchingUsers } = useSuspenseQuery(
    trpc.user.getAllUserSimple.queryOptions(),
  );

  const { data: departments, isFetching: isFetchingDepts } = useSuspenseQuery(
    trpc.department.getAll.queryOptions(),
  );

  const createDept = useMutation(
    trpc.role.create.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã thêm phòng ban`);
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );
  const updateDept = useMutation(
    trpc.role.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã cập nhật phòng ban`);
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  const deleteDept = useMutation(
    trpc.role.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã xóa phòng ban`);
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  const handleDelete = (id: number) => {
    if (confirm("Delete this department?")) {
      // deleteDept.mutate({ id });
    }
  };

  const handleCreate = (
    vals: Omit<(typeof departments)[0], "id" | "createdAt" | "updatedAt">,
  ) => {
    //createDept.mutate(vals);
  };

  const handleEdit = (vals: (typeof departments)[0]) => {
    //updateDept.mutate(vals);
  };

  const [searchField, setSearchField] = useState<"all" | "name" | "code">(
    "all",
  );

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Departments</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
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
        <Select
          defaultValue="all"
          onValueChange={(v) => setSearchField(v as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search in..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="position">Position</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info */}
      <div className="mb-2 text-sm text-muted-foreground">
        Showing {departments.length}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No departments.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.code}</TableCell>
                  <TableCell>{d.position}</TableCell>
                  <TableCell>
                    {new Date(d.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(d.id);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>Add a new one</DialogDescription>
          </DialogHeader>
          <DepartmentForm
            users={users}
            isLoading={isFetchingUsers}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Change its data</DialogDescription>
          </DialogHeader>
          {selected != null && (
            <DepartmentForm
              department={departments.find((d) => d.id === "selected")}
              onSubmit={handleEdit}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          {selected != null && (
            <div className="space-y-2 py-4">
              {selected != null &&
                (() => {
                  const department = departments.find(
                    (d: DepartmentRecord) => d.id === "selected",
                  );
                  if (!department) return <div>Department not found</div>;
                  return (
                    <div className="space-y-2 py-4">
                      {Object.entries(department).map(([key, val]) => (
                        <div
                          key={key}
                          className="grid grid-cols-3 items-center gap-2"
                        >
                          <div className="font-medium">{key}:</div>
                          <div className="col-span-2">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              <div className="flex justify-end">
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
