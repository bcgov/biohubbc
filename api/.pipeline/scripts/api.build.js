'use strict';

const { apiBuild } = require('../lib/api.build.js');
const config = require('../config.js');

// if (config.options.phase === 'pr') {
console.log(JSON.stringify(options));
console.log(JSON.stringify(phases));
// }

// Builds the api image
apiBuild(config);
