'use strict';

const { appDeploy } = require('../lib/app.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

process.on('unhandledRejection', (reason, promise) => {
  console.log('app deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log('app deploy - exit:', 'code:', code);
  process.exit(1);
});

// Deploys the app image
appDeploy(settings).catch((error) => {
  console.log('app deploy - catch - error: ', error);
  throw error;
});
