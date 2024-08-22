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
    tz: config.timezone.api,
    branch: branch,
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
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
    backboneInternalApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    backbonePublicApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/submission/intake',
    backboneArtifactIntakePath: '/api/artifact/intake',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn',
    bctwApiHost: 'https://moe-bctw-api-dev.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-dev.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'development',
    s3KeyPrefix: (isStaticDeployment && 'sims') || `local/${deployChangeId}/sims`,
    tz: config.timezone.api,
    sso: config.sso.dev,
    featureFlags: '',
    logLevel: (isStaticDeployment && 'info') || 'debug',
    logLevelFile: (isStaticDeployment && 'debug') || 'debug',
    logFileDir: 'data/logs',
    logFileName: 'sims-api-%DATE%.log',
    logFileDatePattern: 'YYYY-MM-DD-HH',
    logFileMaxSize: '50m',
    logFileMaxFiles: (isStaticDeployment && '10') || '2',
    volumeCapacity: (isStaticDeployment && '500Mi') || '100Mi',
    apiResponseValidationEnabled: true,
    databaseResponseValidationEnabled: true,
    nodeOptions: '--max_old_space_size=3000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '600m',
    memoryRequest: '100Mi',
    memoryLimit: '4Gi',
    replicas: '1',
    replicasMax: '1'
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
    backboneInternalApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    backbonePublicApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/submission/intake',
    backboneArtifactIntakePath: '/api/artifact/intake',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn',
    bctwApiHost: 'https://moe-bctw-api-test.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-test.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'production',
    s3KeyPrefix: 'sims',
    tz: config.timezone.api,
    sso: config.sso.test,
    featureFlags: '',
    logLevel: 'warn',
    logLevelFile: 'debug',
    logFileDir: 'data/logs',
    logFileName: 'sims-api-%DATE%.log',
    logFileDatePattern: 'YYYY-MM-DD-HH',
    logFileMaxSize: '50m',
    logFileMaxFiles: '10',
    volumeCapacity: '500Mi',
    apiResponseValidationEnabled: true,
    databaseResponseValidationEnabled: true,
    nodeOptions: '--max_old_space_size=3000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '4Gi',
    replicas: '2',
    replicasMax: '2'
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
    appHost: staticUrls.prodVanityUrl,
    backboneInternalApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    backbonePublicApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/submission/intake',
    backboneArtifactIntakePath: '/api/artifact/intake',
    biohubTaxonPath: '/api/taxonomy/taxon',
    biohubTaxonTsnPath: '/api/taxonomy/taxon/tsn',
    bctwApiHost: 'https://moe-bctw-api-prod.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-prod.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'production',
    s3KeyPrefix: 'sims',
    tz: config.timezone.api,
    sso: config.sso.prod,
    featureFlags: 'API_FF_SUBMIT_BIOHUB',
    logLevel: 'silent',
    logLevelFile: 'debug',
    logFileDir: 'data/logs',
    logFileName: 'sims-api-%DATE%.log',
    logFileDatePattern: 'YYYY-MM-DD-HH',
    logFileMaxSize: '50m',
    logFileMaxFiles: '10',
    volumeCapacity: '500Mi',
    apiResponseValidationEnabled: false,
    databaseResponseValidationEnabled: false,
    nodeOptions: '--max_old_space_size=6000', // 75% of memoryLimit (bytes)
    cpuRequest: '50m',
    cpuLimit: '2000m',
    memoryRequest: '100Mi',
    memoryLimit: '8Gi',
    replicas: '2',
    replicasMax: '2'
  }
};

module.exports = exports = { phases, options };
