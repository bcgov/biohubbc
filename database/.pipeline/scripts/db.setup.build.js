'use strict';

const { dbSetupBuild } = require('../lib/db.setup.build.js');
const config = require('../config.js');

// if (config.options.phase === 'pr') {
console.log(JSON.stringify(config.options));
console.log(JSON.stringify(config.phases));
// }

// build database Setup (migrations, seeding, etc) image
dbSetupBuild(config);
