'use strict';

const { dbBuild } = require('../lib/db.build.js');
const config = require('../config.js');

if (['pr', 'dev'].includes(config.options.env)) {
  console.debug(JSON.stringify(config.options));
  console.debug(JSON.stringify(config.phases));
}

// builds the database image
dbBuild(config);
