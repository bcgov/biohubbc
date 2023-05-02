'use strict';

const process = require('process');
const { apiDeploy } = require('../lib/api.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

process.on('unhandledRejection', (reason, promise) => {
  console.log('api deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log('api deploy - exit:', 'code:', code);
});

// Deploys the api image
apiDeploy(settings).catch((error) => {
  console.log('api deploy - catch - error: ', error);
  throw error;
});
