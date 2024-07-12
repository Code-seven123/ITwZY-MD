import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'double'],
      'semi': ['error', 'never'],
      'no-unused-vars': 'off',      
    },
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: 'module',
    },
  },
  pluginJs.configs.recommended,
];
