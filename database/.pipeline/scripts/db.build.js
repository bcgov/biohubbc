'use strict';

const { dbBuild } = require('../lib/db.build.js');
const config = require('../config.js');

const settings = { ...config, phase: 'build' };

// builds the database image
dbBuild(settings);
