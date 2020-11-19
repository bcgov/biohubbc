'use strict';

const config = require('./config.js');
const apiTestTask = require('./lib/api.test.js');

const settings = { ...config, phase: config.options.env };

// Executes the api tests
apiTestTask(settings);
