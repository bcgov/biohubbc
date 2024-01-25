'use strict';

const { appBuild } = require('../lib/app.build.js');
const config = require('../config.js');

const settings = { ...config, phase: 'build' };

// Builds the app image
appBuild(settings);
