/* ESLint para NestJS + TS (monorepo apps/ y libs/) */
const path = require('path');

module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,

  env: { es2023: true, node: true, jest: true },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    // 👉 Asegúrate de incluir TODOS los tsconfig de apps y libs
    project: [
      './tsconfig.eslint.json',
      './tsconfig.json',
      './apps/*/tsconfig.json',
      './libs/*/tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },

  plugins: ['@typescript-eslint', 'import', 'unused-imports', 'sonarjs'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Reglas type-aware (necesitan project configurado arriba)
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'prettier',
  ],

  settings: {
    // 👉 Resolver de imports debe apuntar a los mismos tsconfig
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: [
          './tsconfig.eslint.json',
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './libs/*/tsconfig.json',
        ],
      },
    },
  },

  ignorePatterns: [
    '.eslintrc.js',
    '.eslintrc.cjs',
    'node_modules/',
    'dist/',
    'coverage/',
    'apps/**/dist/',
    'libs/**/dist/',
    'logs/',
    // si generas d.ts, puedes ignorarlos; si no, puedes quitar esta línea
    '*.d.ts',
    // ❗ importante: evita ignorar archivos que quieras lintar
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

    // En monorepo suele dar falsos positivos por paths configurados
    'import/no-unresolved': 'off',
  },

  overrides: [
    // Archivos JS/CJS de config
    {
      files: ['*.cjs', '*.js'],
      env: { node: true },
      parser: null,
      plugins: ['import'],
      extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
      rules: {
        // Evita que el resolver TS se aplique a JS de config
        'import/no-unresolved': 'off',
      },
    },
    // Tests
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      env: { jest: true, node: true },
      plugins: ['jest', '@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:jest/recommended', 'prettier'],
      parserOptions: {
        project: ['./tsconfig.eslint.json', './apps/*/tsconfig.json', './libs/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
      },
    },
    // Si tienes archivos de setup que no necesitan type-checking
    {
      files: ['test/jest.setup.js'],
      parserOptions: { project: null },
    },
  ],
};
