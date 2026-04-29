import { setLogLevel } from './src/utils/logger';

// See https://mochajs.org/#global-setup-fixtures
export async function mochaGlobalSetup() {
  // Disable winston logging before mocha unit tests run, to prevent winston from cluttering the test log with test
  // error messages.
  setLogLevel('silent');
}
