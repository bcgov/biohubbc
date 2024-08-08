import dotenv from 'dotenv';
import { setLogLevel } from './src/utils/logger';

// Relative path to the .env file
const ENV_PATH = '../.env';

// See https://mochajs.org/#global-setup-fixtures
exports.mochaGlobalSetup = async function () {
  // Disable winston logging before mocha unit tests run, to prevent winston from cluttering the test log with test
  // error messages.
  setLogLevel('silent');

  // Load environment variables from .env file
  dotenv.config({ path: ENV_PATH });
};
