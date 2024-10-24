import { task } from "@trigger.dev/sdk/v3";
import { getUmi } from "~/server/utils/umi";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { TRPCError } from "@trpc/server";
import { uploadImage } from "~/server/trigger/tasks/upload-image";
import { create, fetchCollection } from "@metaplex-foundation/mpl-core";

const umi = getUmi();

type CreateCollectibleParams = {
    imageUrl: string;
    name: string;
    description: string;
    owner: string;
};

type CreateCollectibleResult = {
    signature: string;
    collectibleAddress: string;
};

export const createCollectible = task<
    "create-collectible",
    CreateCollectibleParams,
    CreateCollectibleResult
>({
    id: "create-collectible",
    run: async ({
        imageUrl,
        name,
        description,
        owner,
    }: CreateCollectibleParams) => {
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

            const collection = await fetchCollection(
                umi,
                process.env.GLAZE_COLLECTION_ADDRESS || "",
            );

            const assetMetadata = await umi.uploader.uploadJson({
                name,
                description,
                image: `${process.env.IRYS_ADDRESS}/${imageHash}`,
            });

            const assetMetadataHash = assetMetadata.split("/").pop();

            const assetAddress = generateSigner(umi);

            const tx = create(umi, {
                asset: assetAddress,
                collection: collection,
                name,
                uri: `${process.env.IRYS_ADDRESS}/${assetMetadataHash}`,
                owner: publicKey(owner || ""),
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
                collectibleAddress: assetAddress.publicKey,
            };
        } catch (e) {
            throw new Error("Error creating collectible");
        }
    },
});
