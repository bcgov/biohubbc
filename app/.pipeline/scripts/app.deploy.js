'use strict';

const { appDeploy } = require('../lib/app.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

appDeploy(settings);
