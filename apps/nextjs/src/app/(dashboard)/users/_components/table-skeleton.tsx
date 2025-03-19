"use client";

import { Skeleton } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@acme/ui/table";

export function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton width={80} /></TableCell>
            <TableCell><Skeleton width={120} /></TableCell>
            <TableCell><Skeleton width={180} /></TableCell>
            <TableCell><Skeleton width={80} /></TableCell>
            <TableCell><Skeleton width={60} height={32} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}