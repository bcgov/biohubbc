'use strict';

const { clean } = require('../lib/clean.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

// Cleans all build and deployment artifacts (pods, etc)
clean(settings);
