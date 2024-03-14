'use strict';

const { apiBuild } = require('../lib/api.build.js');
const config = require('../config.js');

// if (config.options.phase === 'pr') {
console.log(JSON.stringify(config.options));
console.log(JSON.stringify(config.phases));
// }

// Builds the api image
apiBuild(config);
