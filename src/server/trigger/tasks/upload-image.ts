import { task } from "@trigger.dev/sdk/v3";
import { getUmi } from "~/server/utils/umi";

const umi = getUmi();

export const uploadImage = task({
    id: "upload-image",
    run: async ({ imageUrl }: { imageUrl: string }) => {
        if (!imageUrl) {
            throw new Error("No image URL provided");
        }

        try {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageFile = {
                buffer: Buffer.from(imageBuffer),
                fileName: imageResponse.url.split("/").pop() || "image.png",
                displayName: imageResponse.url.split("/").pop() || "image.png",
                uniqueName: imageResponse.url.split("/").pop() || "image.png",
                contentType:
                    imageResponse.headers.get("content-type") || "image/png",
                extension: imageResponse.url.split(".").pop() || "png",
                tags: [],
            };

            const [imageAddress] = await umi.uploader.upload([imageFile]);
            return imageAddress;
        } catch (e) {
            throw new Error("Error uploading image");
        }
    },
});
