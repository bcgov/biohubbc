'use strict';

const { apiDeploy } = require('../lib/api.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

// Deploys the api image
apiDeploy(settings);
