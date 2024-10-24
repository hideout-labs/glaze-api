import {
    defineConfig,
    ResolveEnvironmentVariablesFunction,
} from "@trigger.dev/sdk/v3";
import "dotenv/config";

// export const resolveEnvVars: ResolveEnvironmentVariablesFunction = () => {
//     return {
//         variables: {
//             CIRCLE_CYPHER: process.env.CIRCLE_CYPHER || "",
//             CIRCLE_API_KEY: process.env.CIRCLE_API_KEY || "",
//             CIRCLE_DEFAULT_SET: process.env.CIRCLE_DEFAULT_SET || "",
//             WALLET_KEYPAIR: process.env.WALLET_KEYPAIR || "",
//             WALLET_ADDRESS: process.env.WALLET_ADDRESS || "",
//             RPC_URL: process.env.RPC_URL || "",
//             IRYS_ADDRESS: process.env.IRYS_ADDRESS || "",
//             GLAZE_COLLECTION_ADDRESS:
//                 process.env.GLAZE_COLLECTION_ADDRESS || "",
//             SIMPLEHASH_API_KEY: process.env.SIMPLEHASH_API_KEY || "",
//         },
//     };
// };

export default defineConfig({
    project: "proj_dgkfubjeakhipkjujbtm",
    runtime: "node",
    logLevel: "log",
    // Set the maxDuration to 300 seconds for all tasks. See https://trigger.dev/docs/runs/max-duration
    // maxDuration: 300,
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    dirs: ["./src/server/trigger/tasks"],
});
