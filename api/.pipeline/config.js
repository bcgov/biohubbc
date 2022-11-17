'use strict';

let process = require('process');

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const appName = config.module.app;
const name = config.module.api;
const dbName = config.module.db;

const changeId = options.pr || `${Math.floor(Date.now() * 1000) / 60.0}`; // aka pull-request or branch
const version = config.version || '1.0.0';

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticUrlsAPI = config.staticUrlsAPI;
const staticUrls = config.staticUrls;

const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

options = processOptions(options);

const phases = {
  build: {
    namespace: 'af2668-tools',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    elasticsearchURL: 'https://elasticsearch-af2668-dev.apps.silver.devops.gov.bc.ca',
    tz: config.timezone.api,
    branch: branch,
    logLevel: (isStaticDeployment && 'info') || 'debug'
  },
  dev: {
    namespace: 'af2668-dev',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host: (isStaticDeployment && staticUrlsAPI.dev) || `${name}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    appHost: (isStaticDeployment && staticUrls.dev) || `${appName}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    backboneApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/intake',
    backboneIntakeEnabled: true,
    env: 'dev',
    elasticsearchURL: 'https://elasticsearch-af2668-dev.apps.silver.devops.gov.bc.ca',
    tz: config.timezone.api,
    sso: config.sso.dev,
    replicas: 1,
    maxReplicas: 1,
    logLevel: (isStaticDeployment && 'info') || 'debug'
  },
  test: {
    namespace: 'af2668-test',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrlsAPI.test,
    appHost: staticUrls.test,
    backboneApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/intake',
    backboneIntakeEnabled: false,
    env: 'test',
    elasticsearchURL: 'http://es01:9200',
    tz: config.timezone.api,
    sso: config.sso.test,
    replicas: 3,
    maxReplicas: 5,
    logLevel: 'info'
  },
  prod: {
    namespace: 'af2668-prod',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrlsAPI.prod,
    appHost: staticUrls.prod,
    backboneApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/intake',
    backboneIntakeEnabled: false,
    env: 'prod',
    elasticsearchURL: 'http://es01:9200',
    tz: config.timezone.api,
    sso: config.sso.prod,
    replicas: 3,
    maxReplicas: 6,
    logLevel: 'info'
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = exports = { phases, options };
