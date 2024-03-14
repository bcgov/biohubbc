'use strict';

const { dbSetupBuild } = require('../lib/db.setup.build.js');
const config = require('../config.js');

// if (config.options.phase === 'pr') {
console.log(JSON.stringify(options));
console.log(JSON.stringify(phases));
// }

// build database Setup (migrations, seeding, etc) image
dbSetupBuild(config);
