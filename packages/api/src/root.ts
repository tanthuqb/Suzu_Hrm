import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { userRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter: ReturnType<typeof createTRPCRouter> = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
