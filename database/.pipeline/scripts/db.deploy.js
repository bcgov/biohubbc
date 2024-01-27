'use strict';

const process = require('process');
const { dbDeploy } = require('../lib/db.deploy.js');
const config = require('../config.js');

process.on('unhandledRejection', (reason, promise) => {
  console.debug('database deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.debug('database deploy - exit:', 'code:', code);
});

// Deploys the database image
dbDeploy(config).catch((error) => {
  console.debug('database deploy - catch - error: ', error);
  throw error;
});
