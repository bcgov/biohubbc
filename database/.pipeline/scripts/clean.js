'use strict';

const { clean } = require('../lib/clean.js');
const config = require('../config.js');

// Cleans all build and deployment artifacts (pods, etc)
clean(config).catch((error) => {
  console.log('database clean - catch - error: ', error);
  throw error;
});
