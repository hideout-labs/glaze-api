import { initTRPC } from "@trpc/server";
import * as trpcExpress from '@trpc/server/adapters/express';
import { OpenApiMeta } from "trpc-openapi";
import { TRPCPanelMeta } from "trpc-panel";


// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
}); // no context
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().meta<OpenApiMeta & TRPCPanelMeta>().create();

export const router = t.router;
export const publicProcedure = t.procedure;