"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";

import type { PositionRecord } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
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
import { AddPositionDialog } from "./add-position-dialog";
import { DeletePositionDialog } from "./delete-position-dialog";
import { EditPositionDialog } from "./edit-position-dialog";

export function PositionsTable() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<PositionRecord | null>(null);
  const trpc = useTRPC();

  const { data: positions } = useSuspenseQuery(
    trpc.position.getAll.queryOptions(),
  );
  const { data: departments, isLoading } = useSuspenseQuery(
    trpc.department.getAll.queryOptions(),
  );

  const handleEdit = (position: PositionRecord) => {
    setSelectedPosition(position);
    setShowEditDialog(true);
  };

  const handleDelete = (position: PositionRecord) => {
    setSelectedPosition(position);
    setShowDeleteDialog(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            console.log("Clicked Add Position");
            setShowAddDialog(true);
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
              <TableHead>Updated At</TableHead>
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
              positions.map((position: PositionRecord) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.name}</TableCell>
                  <TableCell>{position.departmentId}</TableCell>
                  <TableCell>
                    {formatDate(position.createdAt?.toISOString()!)}
                  </TableCell>
                  <TableCell>
                    {formatDate(position.updatedAt?.toISOString()!)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(position)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(position)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddPositionDialog
        key={showAddDialog ? "open" : "closed"}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        departments={departments ?? []}
        isLoading={isLoading}
      />

      {selectedPosition && (
        <>
          <EditPositionDialog
            open={showEditDialog}
            onOpenChange={(open) => {
              setShowDeleteDialog(open);
              if (!open) setSelectedPosition(null);
            }}
            position={selectedPosition}
            departments={departments}
            isLoading={isLoading}
          />
          <DeletePositionDialog
            open={showDeleteDialog}
            onOpenChange={(open) => {
              setShowDeleteDialog(open);
              if (!open) setSelectedPosition(null);
            }}
            position={selectedPosition}
          />
        </>
      )}
    </div>
  );
}
