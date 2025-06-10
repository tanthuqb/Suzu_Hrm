"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
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

import type { Department } from "~/libs/data/departments";
import { formatDate } from "~/libs/index";
import { useTRPC } from "~/trpc/react";
import { DepartmentForm } from "./department-form";

export default function DepartmentsPage({
  departments,
}: {
  departments: Department[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const trpc = useTRPC();
  const router = useRouter();

  const [searchField, setSearchField] = useState<"all" | "name" | "office">(
    "all",
  );

  const filteredDepartments = useMemo(() => {
    if (searchField === "all" && !searchTerm) return departments;
    return departments.filter((dept) => {
      if (!searchTerm) {
        if (searchField === "name") return dept.name && dept.name.trim() !== "";
        if (searchField === "office")
          return dept.office && dept.office.trim() !== "";
        return true;
      }

      const name = String(dept.name ?? "").toLowerCase();
      const office = String(dept.office ?? "").toLowerCase();
      const term = searchTerm.toLowerCase();

      if (searchField === "all")
        return name.includes(term) || office.includes(term);
      if (searchField === "name") return name.includes(term);
      if (searchField === "office") return office.includes(term);
      return false;
    });
  }, [departments, searchTerm, searchField]);

  const createDepartment = useMutation(
    trpc.department.create.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã thêm phòng ban`);
        setIsCreateOpen(false);
        setSelected(null);
        router.refresh();
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  const updateDepartment = useMutation(
    trpc.department.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã cập nhật phòng ban`);
        setIsEditOpen(false);
        setSelected(null);
        router.refresh();
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  const deleteDepartment = useMutation(
    trpc.department.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Đã xóa phòng ban`);
        setIsViewOpen(false);
        setIsEditOpen(false);
        setSelected(null);
        router.refresh();
      },
      onError(err) {
        toast.error(err.message);
      },
    }),
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDepartment.mutateAsync({ id: deleteId });
      setDeleteId(null);
    }
  };

  const handleCreate = async (vals: Department) => {
    try {
      await createDepartment.mutateAsync({
        ...vals,
        office:
          vals.office === "NTL" || vals.office === "SKY"
            ? vals.office
            : undefined,
        description: vals.description === null ? undefined : vals.description,
      });
    } catch (error) {
      console.error("Không tạo được phòng ban", error);
    }
  };

  const handleEdit = async (vals: Department) => {
    try {
      await updateDepartment.mutateAsync({
        ...vals,
        id: selected!,
        office:
          vals.office === "NTL" || vals.office === "SKY"
            ? vals.office
            : undefined,
        description: vals.description === null ? undefined : vals.description,
      });
    } catch (error) {
      console.error("Không cập nhật được phòng ban", error);
    }
  };

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
            <SelectItem value="office">Office</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info */}
      <div className="mb-2 text-sm text-muted-foreground">
        Showing {filteredDepartments.length} of {departments.length}
      </div>

      {/* Table */}
      <div
        className={
          `overflow-x-auto rounded-md border transition-opacity ` +
          (filteredDepartments.length === 0 ? "opacity-50" : "")
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm
                    ? "No departments match your search"
                    : "No departments"}
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.office}</TableCell>
                  <TableCell>
                    {d?.createdAt
                      ? formatDate(d.createdAt.toString())
                      : "Not assigned"}
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
                        onClick={() => setDeleteId(d.id)}
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
              department={(() => {
                const d = departments.find((d) => d.id === selected);
                if (!d) return undefined;
                const office =
                  d.office === "NTL" || d.office === "SKY" ? d.office : null;
                return { ...d, office };
              })()}
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
              {(() => {
                const d = departments.find((d) => d.id === selected);
                if (!d) return <div>Department not found</div>;
                const office =
                  d.office === "NTL" || d.office === "SKY" ? d.office : null;
                const department: Department = {
                  ...d,
                  office,
                };
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDepartment.isPending || !!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có muốn xóa phòng ban này
              không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteDepartment.isPending}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
