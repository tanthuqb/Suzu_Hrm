"use client";

import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Search, Trash2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import { DatePicker } from "@acme/ui/date-picker";
import { Input } from "@acme/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import { useTRPC } from "~/trpc/react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { LeaveRequestDialog } from "./leave-request-dialog";

export function LeaveRequestsTable({ userId }: { userId: string }) {
  const [searchName, setSearchName] = useState("");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: leavesRequests } = useSuspenseQuery(
    trpc.leaveRequest.getAll.queryOptions(),
  );

  const filteredRequests = leavesRequests.filter((request) => {
    const nameMatch = request.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const startDateMatch =
      !startDateFilter || request.startDate >= startDateFilter;
    const endDateMatch = !endDateFilter || request.endDate <= endDateFilter;
    return nameMatch && startDateMatch && endDateMatch;
  });

  const deleteMutation = useMutation(
    trpc.leaveRequest.delete.mutationOptions({
      onSuccess: () => {
        console.log("Leave request deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        console.error("Error deleting leave request:", error);
      },
    }),
  );

  const handleView = (request: any) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (request: any) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    console.log("Deleting request:", selectedRequest.id);
    await deleteMutation.mutateAsync({
      id: selectedRequest.id,
    });
    queryClient.invalidateQueries({
      queryKey: trpc.leaveRequest.getAll.queryKey(),
    });
    setIsDeleteDialogOpen(false);
  };

  const resetFilters = () => {
    setSearchName("");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DatePicker
            placeholder="Start date"
            date={startDateFilter}
            onDateChange={setStartDateFilter}
            className="w-[150px]"
          />
          <DatePicker
            placeholder="End date"
            date={endDateFilter}
            onDateChange={setEndDateFilter}
            className="w-[150px]"
          />
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{format(request.startDate, "PPP")}</TableCell>
                  <TableCell>{format(request.endDate, "PPP")}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(request)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(request)}
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

      {selectedRequest && (
        <>
          <LeaveRequestDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            leaveRequest={selectedRequest}
            setIsViewDialogOpen={setIsViewDialogOpen}
            userId={userId}
          />
          <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Leave Request"
            description={`Are you sure you want to delete the leave request for ${selectedRequest.name}? This action cannot be undone.`}
          />
        </>
      )}
    </div>
  );
}
