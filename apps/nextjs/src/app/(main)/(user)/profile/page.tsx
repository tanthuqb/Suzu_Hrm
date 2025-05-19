import { checkAuth } from "~/actions/auth";
import { HydrateClient, trpc } from "~/trpc/server";
import { ssrPrefetch } from "~/trpc/ssrPrefetch";
import { ProfileContent } from "../_components/profile";

export default async function ProfilePage() {
  const auth = await checkAuth();
  const { status, user } = auth;
  if (!status || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-bold">
          Bạn cần đăng nhập để xem trang này
        </h1>
      </div>
    );
  }

  const { state } = await ssrPrefetch(
    trpc.user.byId.queryOptions({ id: user.id }),
  );

  return (
    <HydrateClient state={state}>
      <ProfileContent userId={user.id} />;
    </HydrateClient>
  );
}
