/* ESLint para NestJS + TS (monorepo apps/ y libs/) */
module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,

  env: { es2023: true, node: true, jest: true },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },

  plugins: ['@typescript-eslint', 'import', 'unused-imports', 'sonarjs'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended', // <- detección de duplicaciones y code smells
    'prettier',
  ],

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
    },
  },

  ignorePatterns: [
    '.eslintrc.js',
    'node_modules/',
    'dist/',
    'coverage/',
    'apps/**/dist/',
    'libs/**/dist/',
    'logs/',
    '*.d.ts',
  ],

  rules: {
    // ——— Estilo / calidad
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'warn',

    // ——— TypeScript (type-aware)
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',

    // Evitar números mágicos
    '@typescript-eslint/no-magic-numbers': [
      'warn',
      {
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignore: [0, 1, -1],
        enforceConst: true,
        detectObjects: true,
      },
    ],

    // Evitar cadenas mágicas específicas o patrones
    'no-restricted-syntax': [
      'warn',
      {
        selector: "Literal[value='foo']",
        message: "Evita usar la cadena mágica 'foo'. Declárala como constante.",
      },
      {
        selector: "Literal[value='bar']",
        message: "Evita usar la cadena mágica 'bar'. Declárala como constante.",
      },
    ],

    // Conflicto con unused-imports → lo desactivamos aquí
    '@typescript-eslint/no-unused-vars': 'off',

    // ——— Limpiar imports/vars sin usar
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],

    // ——— Orden de imports
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          { pattern: '@common/**', group: 'internal', position: 'before' },
          { pattern: '@apps/**', group: 'internal', position: 'before' },
          { pattern: '@libs/**', group: 'internal', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/no-unresolved': 'off',
  },

  overrides: [
    {
      files: ['*.cjs', '*.js'],
      env: { node: true },
      parser: null,
      plugins: ['import'],
      extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      env: { jest: true, node: true },
      plugins: ['jest', '@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:jest/recommended', 'prettier'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
      },
    },
    {
      files: ['test/jest.setup.js'],
      parserOptions: { project: null },
    },
  ],
};
