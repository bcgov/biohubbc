'use strict';

const { apiBuild } = require('../lib/api.build.js');
const config = require('../config.js');

const settings = { ...config, phase: 'build' };

// Builds the api image
apiBuild(settings);
