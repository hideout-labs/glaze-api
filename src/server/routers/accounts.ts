import { createActor, toPromise } from "xstate";
import { z } from "zod";
import { protectedProcedure, router } from "~/server/trpc";
import { registerAccountMachine } from "~/server/machines/registerAccount.machine";
import { checkCircleAccount, getCircleAccount } from "~/server/utils/circle";
import { generateKey } from "~/server/utils/crypto";
import { TRPCError } from "@trpc/server";

export const accountsRouter = router({
    check: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/check",
                tags: ["accounts"],
                summary: "Check if an account is registered",
            },
            description: "Check if an account is registered",
        })
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .output(
            z.object({
                isRegisteredInApp: z.boolean(),
                isRegistered: z.boolean(),
            }),
        )
        .query(async ({ input, ctx }) => {
            try {
                // Check if ID is registered in App
                const refId = generateKey(input.id);
                const isRegisteredInApp = await checkCircleAccount({
                    refId,
                    appId: ctx.appId,
                });

                // Check if ID is registered in Glaze
                const isRegistered = await checkCircleAccount({ refId });

                return {
                    isRegisteredInApp,
                    isRegistered,
                };
            } catch (e) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "An unexpected error occurred, please try again later.",
                    cause: e,
                });
            }
        }),
    register: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/register",
                tags: ["accounts"],
                summary: "Register an account",
            },
            description: "Register an account",
        })
        .input(
            z.object({
                id: z.string(),
                pin: z.string(),
            }),
        )
        .output(
            z.object({
                success: z.boolean(),
                error: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const registerAccount = createActor(registerAccountMachine, {
                    input: {
                        id: input.id,
                        appId: ctx.appId,
                        pin: input.pin,
                    },
                });

                registerAccount.start();

                registerAccount.send({
                    type: "register",
                    id: input.id,
                    appId: ctx.appId,
                    pin: input.pin,
                });

                const result = await toPromise(registerAccount);

                return result;
            } catch (e) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "An unexpected error occurred, please try again later.",
                    cause: e,
                });
            }
        }),
    login: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/login",
                tags: ["accounts"],
                summary: "Login an account",
            },
            description: "Login an account",
        })
        .input(
            z.object({
                id: z.string(),
                pin: z.string(),
            }),
        )
        .output(z.string().optional())
        .mutation(async ({ input, ctx }) => {
            try {
                const refId = generateKey(input.id);
                const security = generateKey([input.id, input.pin].join("$"));

                const wallet = await getCircleAccount({
                    refId,
                    appId: ctx.appId,
                    security,
                });

                if (!wallet) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Account not found",
                    });
                }

                return wallet.address;
            } catch (e) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "An unexpected error occurred, please try again later.",
                    cause: e,
                });
            }
        }),
});
