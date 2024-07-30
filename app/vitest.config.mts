import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'lcov', ['vitest-sonar-reporter', { outputFile: 'coverage/sonar-report.xml' }]],
      include: ['src/**/*'],
      exclude: []
    }
  }
});
