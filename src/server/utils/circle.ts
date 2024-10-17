import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import "dotenv/config";

const secret = process.env.CIRCLE_CYPHER;
const apiKey = process.env.CIRCLE_API_KEY;
const defaultAppId = process.env.CIRCLE_DEFAULT_SET || "";

export async function generateCircleAccount({
    key,
    appId,
    security,
}: {
    key: string;
    appId?: string;
    security: string;
}) {
    if (apiKey && secret && appId) {
        try {
            const circleDeveloperSdk = initiateDeveloperControlledWalletsClient(
                {
                    apiKey,
                    entitySecret: secret,
                },
            );

            const response = await circleDeveloperSdk.createWallets({
                accountType: "EOA",
                blockchains: ["SOL-DEVNET"],
                count: 1,
                walletSetId: appId,
                metadata: [
                    {
                        refId: key,
                        name: security,
                    },
                ],
            });

            const wallet = response.data?.wallets[0];

            return wallet?.address;
        } catch (e) {
            throw new Error(e as string);
        }
    }

    throw new Error("Invalid credentials");
}

export async function checkCircleAccount({
    refId,
    appId,
}: {
    refId: string;
    appId?: string | null;
}) {
    if (apiKey && secret && appId) {
        const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
            apiKey,
            entitySecret: secret,
        });

        try {
            const listWalletsResponse = await circleDeveloperSdk.listWallets({
                walletSetId: appId,
                refId,
            });

            const userWallet = listWalletsResponse.data?.wallets[0];

            if (userWallet && userWallet.address != null) {
                return true;
            }
        } catch (e) {
            return false;
        }

        return false;
    }

    throw new Error("Invalid credentials");
}

export async function getCircleAccount({
    refId,
    appId,
    security,
}: {
    refId: string;
    appId?: string | null;
    security: string;
}) {
    if (apiKey && secret) {
        const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
            apiKey,
            entitySecret: secret,
        });

        try {
            const listWalletsResponse = await circleDeveloperSdk.listWallets({
                walletSetId: appId || defaultAppId,
                refId,
            });

            const userWallet = listWalletsResponse.data?.wallets[0];

            if (userWallet && userWallet.name === security) {
                return userWallet;
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    return null;
}
