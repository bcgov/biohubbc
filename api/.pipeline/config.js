'use strict';

let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const appName = config.module.app;
const name = config.module.api;
const dbName = config.module.db;

const version = config.version;

const changeId = options.pr; // pull-request number or branch name

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
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
    tz: config.timezone.api,
    branch: branch,
    cpuRequest: '100m',
    cpuLimit: '1250m',
    memoryRequest: '512Mi',
    memoryLimit: '3Gi'
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
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: (isStaticDeployment && true) || false,
    env: 'dev',
    elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: 'sims',
    tz: config.timezone.api,
    sso: config.sso.dev,
    logLevel: 'debug',
    cpuRequest: '100m',
    cpuLimit: '500m',
    memoryRequest: '512Mi',
    memoryLimit: '2Gi',
    replicas: (isStaticDeployment && '2') || '1',
    replicasMax: (isStaticDeployment && '3') || '1'
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
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: true,
    env: 'test',
    elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: 'sims',
    tz: config.timezone.api,
    sso: config.sso.test,
    logLevel: 'info',
    cpuRequest: '200m',
    cpuLimit: '1000m',
    memoryRequest: '512Mi',
    memoryLimit: '3Gi',
    replicas: '2',
    replicasMax: '5'
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
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: false,
    env: 'prod',
    elasticsearchURL: 'http://es01.a0ec71-prod:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: 'sims',
    tz: config.timezone.api,
    sso: config.sso.prod,
    logLevel: 'info',
    cpuRequest: '200m',
    cpuLimit: '1000m',
    memoryRequest: '512Mi',
    memoryLimit: '3Gi',
    replicas: '2',
    replicasMax: '5'
  }
};

module.exports = exports = { phases, options };
