import {
    createSignerFromKeypair,
    signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { mplCore } from "@metaplex-foundation/mpl-core";

const WALLET_KEYPAIR = process.env.WALLET_KEYPAIR;

export function getUmi() {
    const umi = createUmi(
        process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com",
    );

    // Usually Keypairs are saved as Uint8Array, so you
    // need to transform it into a usable keypair.
    let keypair = umi.eddsa.createKeypairFromSecretKey(
        Uint8Array.from(JSON.parse(WALLET_KEYPAIR ?? "[]")),
    );

    // Before Umi can use this Keypair you need to generate
    // a Signer type with it.
    const signer = createSignerFromKeypair(umi, keypair);

    // Tell Umi to use the new signer.
    umi.use(signerIdentity(signer));

    umi.use(
        irysUploader({
            address: process.env.IRYS_ADDRESS,
        }),
    );
    umi.use(mplCore());

    return umi;
}
