import { authRouter } from "./router/auth";
import { hrRouter } from "./router/hr";
import { userRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter: ReturnType<typeof createTRPCRouter> = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  hr: createTRPCRouter(hrRouter),
});

// export type definition of API
export type AppRouter = typeof appRouter;
