module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['only-warn', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
