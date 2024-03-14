'use strict';

const { appBuild } = require('../lib/app.build.js');
const config = require('../config.js');

if (config.options.phase === 'pr') {
  console.log(JSON.stringify(options));
  console.log(JSON.stringify(phases));
}

// Builds the app image
appBuild(config);
