export default [
  {
    ignores: ['**/dist', '**/node_modules', '**/.wrangler', '**/bolt/build', '**/.history'],
  },
  {
    rules: {
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-newline': ['error', { consistent: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'consistent-return': 'error',
      semi: ['error', 'always'],
      curly: ['error'],
      'no-eval': ['error'],
      'arrow-spacing': ['error', { before: true, after: true }],
    },
  },
];
