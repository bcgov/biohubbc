'use strict';

const { dbSetupDeploy } = require('../lib/db.setup.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

// deploy database setup (migrations, seeding, etc)
dbSetupDeploy(settings);
