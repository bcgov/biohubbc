'use strict';

const { dbSetupBuild } = require('../lib/db.setup.build.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

// build database Setup (migrations, seeding, etc) image
dbSetupBuild(settings);
