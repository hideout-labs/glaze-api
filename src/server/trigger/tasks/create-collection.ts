import { task } from "@trigger.dev/sdk/v3";
import { getUmi } from "~/server/utils/umi";
import { generateSigner } from "@metaplex-foundation/umi";
import { createCollection as createCollectionMpl } from "@metaplex-foundation/mpl-core";
import { Task } from "@trigger.dev/sdk";

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
        if (!imageUrl) {
            throw new Error("No image URL provided");
        }

        try {
            // Upload metadata
            const collectionMetadata = await umi.uploader.uploadJson({
                name,
                description,
                image: imageUrl,
            });

            // Generate a new address for the collection
            const collectionSigner = generateSigner(umi);

            // Create the collection transaction
            const tx = createCollectionMpl(umi, {
                collection: collectionSigner,
                name,
                uri: collectionMetadata,
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
                signature: txResult.signature.toString(),
                collectionAddress: collectionSigner.publicKey,
            };
        } catch (e) {
            throw new Error("Error creating collection");
        }
    },
});
