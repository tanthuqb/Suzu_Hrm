import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "./server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ssrPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    await queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    await queryClient.prefetchQuery(queryOptions);
  }

  return {
    state: dehydrate(queryClient),
  };
}
