'use strict';
let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const defaultHost = 'biohubbc-af2668-dev.apps.silver.devops.gov.bc.ca';
const defaultHostAPI = 'biohubbc-af2668-api-dev.apps.silver.devops.gov.bc.ca';

const name = (config.module && config.module['app']) || 'biohubbc-app';
const apiName = (config.module && config.module['api']) || 'biohubbc-api';

const changeId = options.pr || `${Math.floor(Date.now() * 1000) / 60.0}`; // aka pull-request or branch
const version = config.version || '1.0.0';

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

const staticBranches = config.staticBranches || [];
const staticUrls = config.staticUrls || {};
const staticUrlsAPI = config.staticUrlsAPI || {};


const maxUploadNumFiles = 10;
const maxUploadFileSize = 52428800; // (bytes)

const sso = config.sso;

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
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    branch: branch
  },
  dev: {
    namespace: 'af2668-dev',
    name: `${name}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    host:
      (isStaticDeployment && (staticUrls.dev || defaultHost)) ||
      `${name}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    apiHost:
      (isStaticDeployment && (staticUrlsAPI.dev || defaultHostAPI)) ||
      `${apiName}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,

    siteminderLogoutURL: config.siteminderLogoutURL.dev,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'dev',
    sso: sso.dev,
    replicas: 1,
    maxReplicas: 2
  },
  test: {
    namespace: 'af2668-test',
    name: `${name}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    host: staticUrls.test,
    apiHost: staticUrlsAPI.test || defaultHostAPI,
    siteminderLogoutURL: config.siteminderLogoutURL.test,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'test',
    sso: sso.test,
    replicas: 3,
    maxReplicas: 5
  },
  prod: {
    namespace: 'af2668-prod',
    name: `${name}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    host: staticUrls.prod,
    apiHost: staticUrlsAPI.prod || defaultHostAPI,
    siteminderLogoutURL: config.siteminderLogoutURL.prod,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'prod',
    sso: sso.prod,
    replicas: 3,
    maxReplicas: 6
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = { phases, options, staticBranches };
