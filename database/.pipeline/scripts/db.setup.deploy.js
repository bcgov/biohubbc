'use strict';

const process = require('process');
const { dbSetupDeploy } = require('../lib/db.setup.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

process.on('unhandledRejection', (reason, promise) => {
  console.log('database setup deploy - unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log('database setup deploy - exit:', 'code:', code);
});

// deploy database setup (migrations, seeding, etc)
dbSetupDeploy(settings).catch((error) => {
  console.log('database setup deploy - catch - error: ', error);
  throw error;
});
