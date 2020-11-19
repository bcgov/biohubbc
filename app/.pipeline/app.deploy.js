'use strict';
const config = require('./config.js');
const deployAppTask = require('./lib/app.deploy.js');

const settings = { ...config, phase: config.options.env };

deployAppTask(settings);
