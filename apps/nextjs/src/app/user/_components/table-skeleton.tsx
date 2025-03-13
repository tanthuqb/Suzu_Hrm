import { Table, TableBody, TableFooter, TableHeader } from "@acme/ui/table";

export function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <tr>
            <th className="w-[100px] px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="w-[100px] px-4 py-3">Actions</th>
          </tr>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </td>
              <td className="px-4 py-3">
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </td>
            </tr>
          ))}
        </TableBody>
        <TableFooter>
          <tr>
            <td colSpan={5} className="px-4 py-3 text-right">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </td>
          </tr>
        </TableFooter>
      </Table>
    </div>
  );
}
