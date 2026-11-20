import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'w8oxci',
  chromeWebSecurity: false,
  taskTimeout: 10000,
  viewportHeight: 900,
  viewportWidth: 1440,
  // Both differ from the Cypress defaults; the specs were written against these values.
  video: true,
  keystrokeDelay: 10,
  e2e: {
    baseUrl: 'http://localhost:7100'
  }
});
