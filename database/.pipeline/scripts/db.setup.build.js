'use strict';

const { dbSetupBuild } = require('../lib/db.setup.build.js');
const config = require('../config.js');

if (['pr', 'dev'].includes(config.options.env)) {
  console.debug(JSON.stringify(config.options));
  console.debug(JSON.stringify(config.phases));
}

// build database Setup (migrations, seeding, etc) image
dbSetupBuild(config);
