'use strict';
const config = require('./config.js');
const buildDatabaseSetupTask = require('./lib/db.setup.build.js');

const settings = { ...config, phase: config.options.env };

// build database Setup (migrations, seeding, etc) image
buildDatabaseSetupTask(settings);
