import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

export default [
  // Main bundle configuration (JavaScript output)
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.js", format: "cjs", sourcemap: true },
      { file: "dist/index.esm.js", format: "esm", sourcemap: true },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      postcss({
        extract: "styles.css",
        minimize: true,
      }),
    ],
    external: ["react", "react-dom", "react/jsx-runtime"],
  },
  // Type declaration configuration (.d.ts output)
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
    external: ["react", "react-dom", "react/jsx-runtime", "./styles.css"], // Add this
  },
];
