'use strict';

const { appBuild } = require('../lib/app.build.js');
const config = require('../config.js');

// Builds the app image
appBuild(config);
