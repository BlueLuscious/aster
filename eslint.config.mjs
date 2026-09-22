import tseslint from "typescript-eslint";

const sourceRules = {
  curly: ["error", "all"],
  eqeqeq: ["error", "always"],
  "no-debugger": "error",
  "no-eval": "error",
  "no-unsafe-finally": "error",
  quotes: [
    "error",
    "double",
    { avoidEscape: true, allowTemplateLiterals: true },
  ],
  semi: ["error", "always"],
};

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/fixtures/**",
      "packages/icons/src/generated/**",
    ],
  },
  {
    files: ["**/*.{ts,mjs}"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: sourceRules,
  },
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser },
  },
];
