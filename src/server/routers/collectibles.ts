import { publicProcedure, router } from "~/server/trpc";
import { z } from "zod";
import { createCollection } from "~/server/trigger/tasks/create-collection";
import { TRPCError } from "@trpc/server";
import { createCollectible } from "~/server/trigger/tasks/create-collectible";

export const collectiblesRouter = router({
    createCollection: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/collections",
                tags: ["collections"],
                summary: "Create new collection",
            },
            description: "Create new collection",
        })
        .input(
            z.object({
                imageUrl: z.string(),
                name: z.string(),
                description: z.string(),
            }),
        )
        .output(z.object({ collectionAddress: z.string() }))
        .mutation(async ({ input }) => {
            const collectionResult = await createCollection.trigger({
                imageUrl: input.imageUrl,
                name: input.name,
                description: input.description,
            });

            if (collectionResult.id.length === 0) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error creating collection",
                });
            }

            return {
                collectionAddress: collectionResult.id,
            };
        }),
    createCollectible: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/collectibles",
                tags: ["collectibles"],
                summary: "Create new collection asset",
            },
            description: "Create new collection asset",
        })
        .input(
            z.object({
                imageUrl: z.string(),
                name: z.string(),
                description: z.string(),
                owner: z.string(),
            }),
        )
        .output(z.object({ collectibleAddress: z.string() }))
        .mutation(async ({ input }) => {
            const collectibleResult = await createCollectible.trigger({
                imageUrl: input.imageUrl,
                name: input.name,
                description: input.description,
                owner: input.owner,
            });

            if (collectibleResult.id.length === 0) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error creating collection",
                });
            }

            return {
                collectibleAddress: collectibleResult.id,
            };
        }),
    getWalletCollectibles: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/collectibles/wallet",
                tags: ["collectibles"],
                summary: "Search wallet for collectibles",
            },
            description:
                "Search a wallet for collectibles using SimpleHash API",
        })
        .input(
            z.object({
                walletAddress: z.string(),
            }),
        )
        .output(
            z.object({
                success: z.boolean(),
                data: z.array(z.any()).optional(),
                error: z.string().optional(),
            }),
        )
        .query(async ({ input }) => {
            const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY;
            const SIMPLEHASH_API_URL =
                "https://api.simplehash.com/api/v0/nfts/owners_v2";

            if (!SIMPLEHASH_API_KEY) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "SimpleHash API key is not configured",
                });
            }

            try {
                const response = await fetch(
                    `${SIMPLEHASH_API_URL}?chains=solana-devnet&wallet_addresses=${input.walletAddress}&collection_ids=${process.env.GLAZE_COLLECTION_ADDRESS}`,
                    {
                        headers: {
                            "X-API-KEY": SIMPLEHASH_API_KEY,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `SimpleHash API responded with status ${response.status}`,
                    );
                }

                const data = await response.json();

                return { success: true, data: data.nfts };
            } catch (error) {
                console.error("Error fetching wallet collectibles:", error);
                return {
                    success: false,
                    error: "Failed to fetch wallet collectibles",
                };
            }
        }),
});
