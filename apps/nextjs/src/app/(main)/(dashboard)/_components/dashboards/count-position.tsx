import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export default function CountPositionPage() {
  const trpc = useTRPC();

  const { data: positionCounts, error } = useSuspenseQuery({
    ...trpc.user.getAllUserCountsByPosition.queryOptions(),
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (error) {
    console.error("Error fetching position counts:", error);
    return <div>Error loading position counts.</div>;
  }

  return (
    <div className="space-y-4">
      {positionCounts.map((position) => (
        <div
          key={position.positionId}
          className="flex items-center justify-between"
        >
          <span className="text-sm font-medium">
            {position.positionName || "Total Nhân viên"}
          </span>
          <span className="text-sm text-muted-foreground">
            {position.count} Nhân viên
          </span>
        </div>
      ))}
    </div>
  );
}
