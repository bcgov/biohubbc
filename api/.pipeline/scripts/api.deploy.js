'use strict';

const process = require('process');
const { apiDeploy } = require('../lib/api.deploy.js');
const config = require('../config.js');

process.on('unhandledRejection', (reason, promise) => {
  console.debug('api deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.debug('api deploy - exit:', 'code:', code);
});

// Deploys the api image
apiDeploy(config).catch((error) => {
  console.debug('api deploy - catch - error: ', error);
  throw error;
});
