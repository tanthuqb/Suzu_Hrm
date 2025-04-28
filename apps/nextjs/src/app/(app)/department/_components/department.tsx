"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

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

// import type { UserAllOutput } from "~/app/types";
import { useTRPC } from "~/trpc/react";
import { DepartmentForm } from "./_forms/department-form";

interface Department {
  id: number;
  userId: string;
  name: string;
  code: string;
  managerId: string | null;
  position: string;
  description: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [searchField, setSearchField] = useState<
    "all" | "name" | "code" | "position"
  >("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  // const [sortBy, setSortBy] = useState<SortField>("email");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const trpc = useTRPC();

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 1,
      userId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Engineering",
      code: "ENG",
      managerId: "550e8400-e29b-41d4-a716-446655440001",
      position: "Technical",
      description: "Software development department",
      createdById: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      userId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Marketing",
      code: "MKT",
      managerId: "550e8400-e29b-41d4-a716-446655440003",
      position: "Business",
      description: "Marketing and sales department",
      createdById: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const debouncedSearch = useDebounce(search, 300);
  const queryOptions = trpc.department.getAll.queryOptions();

  const { data, refetch, isFetching } = useSuspenseQuery(
    queryOptions.queryKey.length > 0 ? queryOptions : ({} as any),
  ) as {
    data: any;
    refetch: () => void;
    isFetching: boolean;
  };

  useEffect(() => {
    void refetch();
  }, [page, pageSize, debouncedSearch, order, refetch]);

  const filteredDepartments = departments.filter((department) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();

    switch (searchField) {
      case "name":
        return department.name.toLowerCase().includes(term);
      case "code":
        return department.code.toLowerCase().includes(term);
      case "position":
        return department.position.toLowerCase().includes(term);
      case "all":
      default:
        return (
          department.name.toLowerCase().includes(term) ||
          department.code.toLowerCase().includes(term) ||
          department.position.toLowerCase().includes(term) ||
          (department.description &&
            department.description.toLowerCase().includes(term))
        );
    }
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        // await deleteDepartment(id)
        setDepartments(departments.filter((dept) => dept.id !== id));
        toast.message("The department has been successfully deleted.");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete department.");
      }
    }
  };

  const handleCreateSubmit = (
    data: Omit<Department, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newDepartment: Department = {
      ...data,
      id: departments.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDepartments([...departments, newDepartment]);
    setIsCreateOpen(false);
    toast.message("The department has been successfully created.");
    router.refresh();
  };

  const handleEditSubmit = (data: Department) => {
    // In a real app, this would call a server action to update the department
    setDepartments(
      departments.map((dept) =>
        dept.id === data.id ? { ...data, updatedAt: new Date() } : dept,
      ),
    );
    setIsEditOpen(false);
    toast.message("The department has been successfully updated.");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Departments</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search departments..."
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
        <div className="flex items-center gap-2">
          <Select
            defaultValue="all"
            onValueChange={(value: "name" | "code" | "all" | "position") =>
              setSearchField(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search in..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-2 text-sm text-muted-foreground">
        {filteredDepartments.length === 0
          ? "No departments found"
          : `Showing ${filteredDepartments.length} of ${departments.length} departments`}
      </div>

      <div className="rounded-md border">
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
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.id}</TableCell>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>{department.code}</TableCell>
                  <TableCell>{department.position}</TableCell>
                  <TableCell>
                    {department.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedDepartment(department);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedDepartment(department);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(department.id)}
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

      {/* Create Department Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Add a new department to the system.
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information.
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentForm
              department={selectedDepartment}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Department Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">ID:</div>
                <div className="col-span-3">{selectedDepartment.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Name:</div>
                <div className="col-span-3">{selectedDepartment.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Code:</div>
                <div className="col-span-3">{selectedDepartment.code}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Position:</div>
                <div className="col-span-3">{selectedDepartment.position}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Description:</div>
                <div className="col-span-3">
                  {selectedDepartment.description || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Manager ID:</div>
                <div className="col-span-3">
                  {selectedDepartment.managerId || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Created At:</div>
                <div className="col-span-3">
                  {selectedDepartment.createdAt.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Updated At:</div>
                <div className="col-span-3">
                  {selectedDepartment.updatedAt.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
