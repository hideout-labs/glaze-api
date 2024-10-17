import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "~/server/routers/app";
import "dotenv/config";

let instance: ReturnType<typeof createTRPCProxyClient<AppRouter>> | null = null;

export function createGlazeClient({
    appId,
    url = "https://api.getglazed.xyz/trpc",
}: {
    appId: string;
    url?: string;
}) {
    if (!instance) {
        instance = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url,
                    headers: {
                        "X-Glaze-App-Id": appId,
                    },
                }),
            ],
        });
    }

    return instance;
}
