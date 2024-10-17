import { router } from "~/server/trpc";
import { userRouter } from "~/server/routers/user";
import { accountsRouter } from "~/server/routers/accounts";
import { collectiblesRouter } from "~/server/routers/collectibles";

export const appRouter = router({
    user: userRouter,
    accounts: accountsRouter,
    collectibles: collectiblesRouter,
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;
