import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/*.spec.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
});
