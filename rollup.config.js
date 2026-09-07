import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "src/index.ts",

    output: {
        file: "dist/index.js",
        format: "es",
        sourcemap: true
    },

    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        typescript({
            tsconfig: "./tsconfig.build.json"
        })
    ]
};
