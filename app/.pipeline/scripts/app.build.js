'use strict';

const config = require('../config.js');
const { appBuild } = require('../lib/app.build.js');

const settings = { ...config, phase: 'build' };

appBuild(settings);
