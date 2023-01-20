'use strict';

const { dbDeploy } = require('../lib/db.deploy.js');
const config = require('../config.js');

const settings = { ...config, phase: config.options.env };

// deploying database
dbDeploy(settings);
