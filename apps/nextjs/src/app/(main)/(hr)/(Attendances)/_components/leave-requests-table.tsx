"use client";

import { useState } from "react";
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

import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { LeaveRequestDialog } from "./leave-request-dialog";

// Mock data based on the schema
const mockLeaveRequests = [
  {
    id: "1",
    name: "John Doe",
    userId: "user1",
    department: "Engineering",
    startDate: new Date("2023-05-10"),
    endDate: new Date("2023-05-15"),
    reason: "Annual leave",
    createdAt: new Date("2023-05-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    userId: "user2",
    department: "Marketing",
    startDate: new Date("2023-06-20"),
    endDate: new Date("2023-06-25"),
    reason: "Family event",
    createdAt: new Date("2023-06-10"),
  },
  {
    id: "3",
    name: "Michael Johnson",
    userId: "user3",
    department: "Finance",
    startDate: new Date("2023-07-05"),
    endDate: new Date("2023-07-10"),
    reason: "Medical leave",
    createdAt: new Date("2023-06-25"),
  },
];

export function LeaveRequestsTable() {
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

  // Filter the leave requests based on search and date filters
  const filteredRequests = mockLeaveRequests.filter((request) => {
    const nameMatch = request.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const startDateMatch =
      !startDateFilter || request.startDate >= startDateFilter;
    const endDateMatch = !endDateFilter || request.endDate <= endDateFilter;
    return nameMatch && startDateMatch && endDateMatch;
  });

  const handleView = (request: any) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (request: any) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    // Here you would call your delete API
    console.log("Deleting request:", selectedRequest.id);
    setIsDeleteDialogOpen(false);
    // After successful deletion, you would refresh the data
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
