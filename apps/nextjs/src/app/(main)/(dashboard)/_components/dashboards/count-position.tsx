type PositionCountsResponse = {
  positionId: string | null;
  positionName: string | null;
  count: number;
}[];

interface CountPositionPageProps {
  positionCounts: PositionCountsResponse;
  error?: Error;
}

export default function CountPositionPage({
  positionCounts,
  error,
}: CountPositionPageProps) {
  if (error) {
    console.error("Error fetching position counts:", error);
    return <div>Error loading position counts.</div>;
  }

  return (
    <div className="space-y-4">
      {positionCounts &&
        positionCounts.map((position) => (
          <div
            key={position.positionId}
            className="flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {position.positionName ?? "Total Nhân viên"}
            </span>
            <span className="text-sm text-muted-foreground">
              {position.count} Nhân viên
            </span>
          </div>
        ))}
    </div>
  );
}
