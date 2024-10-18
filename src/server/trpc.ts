import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { OpenApiMeta } from "trpc-openapi";
import { TRPCPanelMeta } from "trpc-panel";

// created for each request
export const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => ({
    appId: req.headers["X-Glaze-App-Id"] as string,
    defaultAppId: process.env.CIRCLE_DEFAULT_SET,
}); // no context

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC
    .context<Context>()
    .meta<OpenApiMeta & TRPCPanelMeta>()
    .create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
    const { ctx } = opts;

    if (!ctx.appId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
        });
    }

    return opts.next();
});
