'use strict';

const { apiBuild } = require('../lib/api.build.js');
const config = require('../config.js');

// Builds the api image
apiBuild(config);
