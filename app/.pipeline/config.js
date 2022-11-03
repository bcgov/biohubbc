'use strict';

let process = require('process');

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const appName = config.module.app;
const apiName = config.module.api;
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
const maxUploadNumFiles = 10;
const maxUploadFileSize = 52428800; // (bytes)

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
    name: `${apiName}`,
    dbName: `${dbName}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${apiName}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
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
    instance: `${apiName}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host: (isStaticDeployment && staticUrlsAPI.dev) || `${apiName}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    appHost: (isStaticDeployment && staticUrls.dev) || `${appName}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    n8nHost: '', // staticUrlsN8N.dev, // Disable until nginx is setup: https://quartech.atlassian.net/browse/BHBC-1435
    env: 'dev',
    sso: config.sso.dev,
    replicas: 1,
    maxReplicas: 2,
    logLevel: (isStaticDeployment && 'info') || 'debug'
  },
  test: {
    namespace: 'af2668-test',
    name: `${name}`,
    dbName: `${dbName}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${apiName}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrlsAPI.test,
    appHost: staticUrls.test,
    n8nHost: '', // staticUrlsN8N.test, // Disable until nginx is setup: https://quartech.atlassian.net/browse/BHBC-1435
    siteminderLogoutURL: config.siteminderLogoutURL.test,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'test',
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
    instance: `${apiName}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrlsAPI.prod,
    appHost: staticUrls.prod,
    env: 'prod',
    sso: sso.prod,
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
