/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "simple-import-sort", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  settings: {
    react: { version: "detect" }
  },
  env: {
    es2022: true,
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  rules: {
    "react-refresh/only-export-components": "off",
    "react/prop-types": "off",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "import/order": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
  },
  ignorePatterns: ["dist", "node_modules", "e2e/*.spec.ts"]
}
