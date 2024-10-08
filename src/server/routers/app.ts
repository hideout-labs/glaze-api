
import { router } from '~/server/trpc';
import { userRouter } from '~/server/routers/user';
import { accountsRouter } from '~/server/routers/accounts';

export const appRouter = router({
    user: userRouter,
    accounts: accountsRouter,
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;