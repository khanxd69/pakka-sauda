// Pakka Sauda: unit tests for pure logic only (no DOM, no database). Owner: Workstream A.
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: { include: ['lib/**/*.test.ts'], environment: 'node' },
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
});
