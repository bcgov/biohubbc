'use strict';

const apiBuildTask = require('./lib/api.build.js');
const config = require('./config.js');

const settings = { ...config, phase: 'build' };

// Builds the api image
apiBuildTask(settings);
