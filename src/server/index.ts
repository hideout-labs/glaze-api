import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "~/server/routers/app";
import { createContext } from "~/server/trpc";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.use(
    "/trpc/*",
    cors(),
    trpcServer({
        router: appRouter,
        createContext: (_opts, c) => ({
            appId: c.req.header("X-Glaze-App-Id"),
        }),
    }),
);

app.get("/docs", (c) => {
    const html = renderTrpcPanel(appRouter, {
        url: `/trpc`,
    });

    return c.html(html);
});

const port = 4001;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
