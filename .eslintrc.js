module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:prettier/recommended', // Integrate Prettier with ESLint
    ],
    rules: {
      'indent': ['error', 2], // Ensure consistent 2-space indentation
      'no-console': 'warn',
      'no-unused-vars': 'warn',
    },
  };
  