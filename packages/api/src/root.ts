import { authRouter } from "./router/auth";
import { hrRouter } from "./router/hr";
import { salaryRouter } from "./router/salary";
import { userRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  salary: salaryRouter,
  auth: authRouter,
  user: userRouter,
  hr: hrRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
