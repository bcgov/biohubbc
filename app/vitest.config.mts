import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    css: true,
    reporters: ['verbose', ['vitest-sonar-reporter', { outputFile: 'coverage/sonar-report.xml' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}']
    }
  }
});
