import { publicProcedure, router } from "~/server/trpc";
import { z } from "zod";
import { uploadImage } from "~/server/trigger/tasks/upload-image";
import { createCollection } from "~/server/trigger/tasks/create-collection";
import { TRPCError } from "@trpc/server";

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
            const imageUri = await uploadImage.triggerAndWait({
                imageUrl: input.imageUrl,
            });

            if (!imageUri.ok) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error uploading image",
                });
            }

            const collectionResult = await createCollection.triggerAndWait({
                imageUrl: imageUri.output,
                name: input.name,
                description: input.description,
            });

            if (!collectionResult.ok) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error creating collection",
                });
            }

            return {
                collectionAddress: collectionResult.output.collectionAddress,
            };
        }),
});
