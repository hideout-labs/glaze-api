import { createActor, toPromise } from 'xstate';
import { z } from 'zod';
import { publicProcedure, router } from '~/server/trpc';
import { registerAccountMachine, } from '~/server/machines/registerAccount.machine';
import { getCircleAccount } from '~/server/utils/crypto';
import { generateKey } from '~/server/utils/crypto';


export const accountsRouter = router({
    register: publicProcedure.meta({
        openapi: {
            method: 'GET', path: '/register', tags: ['accounts'],
            summary: 'Register an account',
        },
        description: 'Register an account',
    }).input(z.object(
        {
            id: z.string(),
            pin: z.string(),
            appId: z.string(),
        }
    )).output(
        z.object({
            success: z.boolean(),
            error: z.string().optional(),
        })
    ).query(async ({ ctx, input }) => {

        const registerAccount = createActor(registerAccountMachine, {
            input: {
                id: input.id,
                appId: input.appId,
                pin: input.pin
            }
        });

        registerAccount.start();

        registerAccount.send({
            type: "register",
            id: input.id,
            appId: input.appId,
            pin: input.pin
        });

        const result = await toPromise(registerAccount);

        return result;
    }),
    login: publicProcedure.meta({
        openapi: {
            method: 'GET', path: '/login', tags: ['accounts'],
            summary: 'Login an account',
        },
        description: 'Login an account',
    }).input(z.object(
        {
            id: z.string(),
            pin: z.string(),
            appId: z.string().optional(),
        }
    )).output(
        z.string().optional()
    ).query(async ({ input }) => {
        try {
            const refId = generateKey(input.id);
            const security = generateKey([input.id, input.pin].join("$"));

            const wallet = await getCircleAccount({ refId, appId: input.appId, security });

            if (!wallet) {
                return undefined;
            }

            return wallet.address;
        } catch (e) {
            return undefined;
        }
    }),
});
