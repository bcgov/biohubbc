'use strict';
const config = require('./config.js');
const {appDeploy} = require('./lib/app.deploy.js');

const settings = { ...config, phase: config.options.env };

appDeploy(settings);
