'use strict';

const process = require('process');
const { dbDeploy } = require('../lib/db.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

process.on('unhandledRejection', (reason, promise) => {
  console.log('database deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log('database deploy - exit:', 'code:', code);
});

// Deploys the database image
dbDeploy(settings).catch((error) => {
  console.log('database deploy - catch - error: ', error);
  throw error;
});
