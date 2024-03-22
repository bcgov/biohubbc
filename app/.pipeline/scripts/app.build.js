'use strict';

const { appBuild } = require('../lib/app.build.js');
const config = require('../config.js');

if (['pr', 'dev'].includes(config.options.env)) {
  console.debug(JSON.stringify(config.options));
  console.debug(JSON.stringify(config.phases));
}

// Builds the app image
appBuild(config);
