'use strict';
const config = require('./config.js');
const cleanTask = require('./lib/clean.js');

const settings = { ...config, phase: config.options.env };

cleanTask(settings);
