import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
    plugins: {
      ...tseslint.configs.recommended.plugins,
      js,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  globalIgnores(["dist/*"]),
]);
