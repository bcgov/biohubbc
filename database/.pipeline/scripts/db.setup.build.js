'use strict';

const { dbSetupBuild } = require('../lib/db.setup.build.js');
const config = require('../config.js');

// build database Setup (migrations, seeding, etc) image
dbSetupBuild(config);
