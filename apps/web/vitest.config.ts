/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  plugins: [react(), nxViteTsPaths()],
  test: {
    name: 'web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/web',
      provider: 'v8' as const,
    },
  },
}));
