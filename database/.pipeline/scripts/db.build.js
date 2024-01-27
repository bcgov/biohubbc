'use strict';

const { dbBuild } = require('../lib/db.build.js');
const config = require('../config.js');

// builds the database image
dbBuild(config);
