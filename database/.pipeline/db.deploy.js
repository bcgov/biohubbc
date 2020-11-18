'use strict';
const config = require('./config.js');
const deployDatabaseTask = require('./lib/db.deploy.js');

const settings = { ...config, phase: config.options.env };

// deploying database
deployDatabaseTask(settings);
