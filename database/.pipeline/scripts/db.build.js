'use strict';

const { dbBuild } = require('../lib/db.build.js');
const config = require('../config.js');

if (config.options.phase === 'pr') {
  console.log(JSON.stringify(options));
  console.log(JSON.stringify(phases));
}

// builds the database image
dbBuild(config);
