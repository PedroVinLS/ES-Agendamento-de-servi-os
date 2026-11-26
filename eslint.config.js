const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
    {
        ignores: ["node_modules/**", "coverage/**", "dist/**", "build/**"],
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
        },
    },
    js.configs.recommended,
    {
        files: [
            "app.js",
            "server.js",
            "eslint.config.js",
            "config/**/*.js",
            "controllers/**/*.js",
            "middlewares/**/*.js",
            "models/**/*.js",
            "routes/**/*.js",
            "validators/**/*.js",
            "tests/**/*.js",
            "migrations/**/*.js",
            "src/backend/**/*.js",
        ],
        languageOptions: { globals: globals.node },
    },
    {
        files: ["src/frontend/js/**/*.js"],
        languageOptions: {
            sourceType: "script",
            globals: globals.browser,
        },
    },
    prettier,
];
