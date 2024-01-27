'use strict';

const process = require('process');
const { dbSetupDeploy } = require('../lib/db.setup.deploy.js');
const config = require('../config.js');

process.on('unhandledRejection', (reason, promise) => {
  console.debug('database setup deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.debug('database setup deploy - exit:', 'code:', code);
});

// deploy database setup (migrations, seeding, etc)
dbSetupDeploy(config).catch((error) => {
  console.debug('database setup deploy - catch - error: ', error);
  throw error;
});
