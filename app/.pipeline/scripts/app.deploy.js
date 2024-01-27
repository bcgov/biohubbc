'use strict';

const process = require('process');
const { appDeploy } = require('../lib/app.deploy.js');
const config = require('../config.js');

process.on('unhandledRejection', (reason, promise) => {
  console.debug('app deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.debug('app deploy - exit:', 'code:', code);
});

// Deploys the app image
appDeploy(config).catch((error) => {
  console.debug('app deploy - catch - error: ', error);
  throw error;
});
