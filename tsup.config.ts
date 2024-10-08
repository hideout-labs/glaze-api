import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        "client/index": 'src/client/index.ts',
        "server/index": 'src/server/index.ts',
    },
    format: ["cjs", 'esm'],
    dts: true,
    splitting: true,
    sourcemap: true,
});
