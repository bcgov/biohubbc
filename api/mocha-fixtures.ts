import { ENVConfig } from './src/utils/env-config';

// See https://mochajs.org/#global-setup-fixtures
exports.mochaGlobalSetup = async function () {
  // Disable winston logging before mocha unit tests run, to prevent winston from cluttering the test log with test
  // error messages.
  ENVConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });
};
