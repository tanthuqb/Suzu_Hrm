"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
import type { Position } from "~/libs/data/positions";
import { formatDate } from "~/libs/index";
import { useTRPC } from "~/trpc/react";
import { PositionForm } from "./position-form";

export function PositionsTable({
  positions,
  departments,
}: {
  positions: Position[];
  departments: Department[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const trpc = useTRPC();
  const router = useRouter();
  const createPositionMuation = useMutation(
    trpc.position.create.mutationOptions({
      onSuccess: () => {
        toast("Tạo vị trí thành công", {
          description: "Vị trí mới đã được thêm vào.",
        });
        setIsCreateOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast("Error", {
          description: error.message,
        });
        setIsCreateOpen(false);
      },
    }),
  );

  const updatePositionMuation = useMutation(
    trpc.position.update.mutationOptions({
      onSuccess: () => {
        toast("Cập nhật vị trí thành công", {
          description: "Vị trí đã được cập nhật.",
        });
        setIsEditOpen(false);
        setSelectedPosition(null);
        router.refresh();
      },
      onError: (error) => {
        toast("Error", {
          description: error.message,
        });
        setIsEditOpen(false);
      },
    }),
  );

  const deletePositionMuation = useMutation(
    trpc.position.delete.mutationOptions({
      onSuccess: () => {
        toast("Xóa vị trí thành công", {
          description: "Vị trí đã được xóa.",
        });
        setIsViewOpen(false);
        setSelectedPosition(null);
        router.refresh();
      },
      onError: (error) => {
        toast("Error", {
          description: error.message,
        });
        setIsViewOpen(false);
      },
    }),
  );

  const handleEdit = async (position: Position) => {
    try {
      await updatePositionMuation.mutateAsync({
        id: selectedPositionId,
        name: position.name,
        departmentId: position.department_id,
      });
    } catch (error) {
      console.error("Không cập nhật được vị trí", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePositionMuation.mutateAsync({
        id: selectedPositionId,
      });
    } catch (error) {
      console.error("Error deleting position:", error);
    }
  };

  const handleCreate = async (data: Position) => {
    try {
      await createPositionMuation.mutateAsync({
        name: data.name,
        departmentId: data.department_id,
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const openDeleteDialog = (position: Position) => {
    setSelectedPositionId(position.id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No positions found
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position: Position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.name}</TableCell>
                  <TableCell>{position.department_id.toString()}</TableCell>
                  <TableCell>
                    {position.created_at &&
                      formatDate(
                        typeof position.created_at === "string"
                          ? position.created_at
                          : position.created_at.toISOString(),
                      )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPosition(position);
                          setSelectedPositionId(position.id);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPosition(position);
                          setSelectedPositionId(position.id);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(position)}
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
            <DialogTitle>Thêm vị trí</DialogTitle>
            <DialogDescription>Thêm vị trí mới</DialogDescription>
          </DialogHeader>
          <PositionForm
            departments={departments}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật vị trí</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho vị trí này
            </DialogDescription>
          </DialogHeader>
          {selectedPosition != null && (
            <PositionForm
              departments={departments}
              position={selectedPosition}
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
            <DialogTitle>Cập nhật vị trí</DialogTitle>
          </DialogHeader>
          {selectedPosition != null && (
            <div className="space-y-4">
              <div className="mb-2">
                <span className="font-semibold">Tên vị trí: </span>
                {selectedPosition.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Phòng ban: </span>
                {selectedPosition.department?.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Ngày tạo: </span>
                {selectedPosition.created_at &&
                  formatDate(
                    typeof selectedPosition.created_at === "string"
                      ? selectedPosition.created_at
                      : selectedPosition.created_at.toISOString(),
                  )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động không thể quay lại. Bạn có muốn xóa vĩnh viễn vị trí
              {selectedPosition && (
                <strong>{` "${selectedPosition.name}"`}</strong>
              )}
              không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
