'use strict';
const databaseBuildTask = require('./lib/db.build.js');
const config = require('./config.js');

const settings = { ...config, phase: 'build' };

// builds the database image
databaseBuildTask(settings);
