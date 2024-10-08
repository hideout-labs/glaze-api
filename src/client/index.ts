import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '~/server/routers/app';
import 'dotenv/config';

const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: process.env.NODE_ENV === 'development' ? 'http://localhost:4001/trpc' : 'https://api.getglazed.xyz/trpc',
        }),
    ],
});

export default client;
