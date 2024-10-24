import { task } from "@trigger.dev/sdk/v3";
import { getUmi } from "~/server/utils/umi";
import { generateSigner } from "@metaplex-foundation/umi";
import { createCollection as createCollectionMpl } from "@metaplex-foundation/mpl-core";
import { Task } from "@trigger.dev/sdk";
import { TRPCError } from "@trpc/server";
import { uploadImage } from "~/server/trigger/tasks/upload-image";

const umi = getUmi();

type CreateCollectionParams = {
    imageUrl: string;
    name: string;
    description: string;
};

type CreateCollectionResult = {
    signature: string;
    collectionAddress: string;
};

export const createCollection = task<
    "create-collection",
    CreateCollectionParams,
    CreateCollectionResult
>({
    id: "create-collection",
    run: async ({
        imageUrl,
        name,
        description,
    }: {
        imageUrl: string;
        name: string;
        description: string;
    }) => {
        try {
            // Upload metadata
            const imageUri = await uploadImage.triggerAndWait({
                imageUrl: imageUrl,
            });

            if (!imageUri.ok) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error uploading image",
                });
            }

            const imageHash = imageUri.output.split("/").pop();
            const collectionMetadata = await umi.uploader.uploadJson({
                name,
                description,
                image: `${process.env.IRYS_ADDRESS}/${imageHash}`,
            });

            if (collectionMetadata.length === 0) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error uploading image",
                });
            }

            const collectionMetadataHash = collectionMetadata.split("/").pop();

            // Generate a new address for the collection
            const collectionSigner = generateSigner(umi);

            // Create the collection transaction
            const tx = createCollectionMpl(umi, {
                collection: collectionSigner,
                name,
                uri: `${process.env.IRYS_ADDRESS}/${collectionMetadataHash}`,
            });

            // Send and confirm the transaction
            const txResult = await tx.sendAndConfirm(umi, {
                send: {
                    skipPreflight: true,
                    maxRetries: 0,
                    preflightCommitment: "confirmed",
                },
            });

            if (txResult.result.value.err) {
                throw new Error("Error creating collection");
            }

            return {
                signature: Buffer.from(txResult.signature).toString("base64"),
                collectionAddress: collectionSigner.publicKey,
            };
        } catch (e) {
            throw new Error("Error creating collection");
        }
    },
});
