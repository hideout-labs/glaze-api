import { createGlazeClient } from "~/client";

const GLAZE_APP_ID = process.env.GLAZE_APP_ID || "";

const registerOrLogin = async (user: { id: string }, pin: string) => {
    const client = createGlazeClient({ appId: GLAZE_APP_ID });

    try {
        const glazeUser = await client.accounts.check.query({
            id: user.id,
        });

        if (glazeUser.isRegisteredInApp) {
            const logInResponse = await client.accounts.login.mutate({
                id: user.id,
                pin,
            });

            // handle response
        } else {
            const registerResponse = await client.accounts.register.mutate({
                id: user.id,
                pin,
            });

            // handle response
        }
    } catch (error) {
        console.error("Error creating account", error);
    }
};
