'use strict';

const config = require('./config.js');
const apiDeployTask = require('./lib/api.deploy.js');

const settings = { ...config, phase: config.options.env };

// Deploys the api image
apiDeployTask(settings);
