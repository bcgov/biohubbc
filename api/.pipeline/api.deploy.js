'use strict';

const config = require('./config.js');
const {apiDeploy} = require('./lib/api.deploy.js');

const settings = { ...config, phase: config.options.env };

// Deploys the api image
apiDeploy(settings);
