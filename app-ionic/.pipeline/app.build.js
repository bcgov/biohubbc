'use strict';
const buildTask = require('./lib/app.build.js');
const config = require('./config.js');

const settings = { ...config, phase: 'build' };

buildTask(settings);
