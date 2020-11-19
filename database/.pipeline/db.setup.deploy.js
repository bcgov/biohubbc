'use strict';
const config = require('./config.js');
const deployDatabaseSetupTask = require('./lib/db.setup.deploy.js');

const settings = { ...config, phase: config.options.env };

// deploy database setup (migrations, seeding, etc)
deployDatabaseSetupTask(settings);
