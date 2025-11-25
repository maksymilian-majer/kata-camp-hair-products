module.exports = {
  '*.{ts,tsx,js,jsx}': () => 'pnpm lint',
  '*.{json,md,html,css,scss}': ['prettier --write'],
};
