import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {},
		rules: {},
	},
);

// import { defineConfig } from "eslint/config";
// import globals from "globals";
// import tseslint from "typescript-eslint";

// export default defineConfig([
// 	{ files: ["**/*.{js,mjs,cjs,ts}"] },
// 	{ files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
// 	tseslint.configs.recommended,
// ]);
