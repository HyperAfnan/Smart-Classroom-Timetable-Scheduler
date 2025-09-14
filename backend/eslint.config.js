import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.es2024,
			},
		},
		rules: {
			quotes: ["error", "double"],
			indent: ["error", "tab"],
			"no-tabs": "off",
			"prettier/prettier": [
				"error",
				{
					useTabs: true,
					singleQuote: false,
					quoteProps: "as-needed",
					trailingComma: "es5",
					semi: true,
					printWidth: 80,
					tabWidth: 4,
				},
			],
		},
		plugins: {
			prettier: prettierPlugin,
		},
	},
	prettier,
	{
		ignores: ["node_modules/**", "logs/**", "*.log"],
	},
];
