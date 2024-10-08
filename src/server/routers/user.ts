import { z } from 'zod';
import { publicProcedure, router } from '~/server/trpc';

export const userRouter = router({
    list: publicProcedure.meta({
        openapi: {
            method: 'GET', path: '/users', tags: ['users'],
            summary: 'Read all users',
        },
        description: 'Read all users',
    }).input(z.void()).output(
        z.array(z.string())
    ).query(async ({ ctx }) => {

        return ["asd"];
    }),
    get: publicProcedure.meta({
        openapi: {
            method: 'GET', path: '/users/{id}', tags: ['users'],
            summary: 'Read users by id',
        },
        description: 'Read users by id',
    }).input(z.object({ id: z.string() })).output(
        z.array(z.string())
    ).query(async ({ ctx, input }) => {

        return [input.id];
    }),
});
