import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "~/server/routers/app";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.use(
    "/trpc/*",
    cors({
        origin: "*", // Allow all origins
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "X-Glaze-App-Id"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
    trpcServer({
        router: appRouter,
        createContext: (_opts, c) => ({
            appId: c.req.header("X-Glaze-App-Id"),
            defaultAppId: process.env.CIRCLE_DEFAULT_SET,
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
