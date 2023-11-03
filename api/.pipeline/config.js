'use strict';

const { PipelineConfigMapSchema } = require('./utils/configMapSchema');
const PipelineCli = require('pipeline-cli');

// Options passed in from the git action
const rawOptions = PipelineCli.Util.parseArguments();

// Pull-request number or branch name
const changeId = rawOptions.pr;

// Pipeline config map from openshift
const rawPipelineConfigMap = rawOptions.config;
// Validate the pipeline config map is not missing any fields
const pipelineConfigMap = PipelineConfigMapSchema.parse(JSON.parse(rawPipelineConfigMap));

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = rawOptions.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && rawOptions.branch) || null;
const tag =
  (branch && `build-${pipelineConfigMap.version}-${changeId}-${branch}`) ||
  `build-${pipelineConfigMap.version}-${changeId}`;

function processOptions(options) {
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
}

const options = processOptions(rawOptions);

const phases = {
  build: {
    namespace: 'af2668-tools',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
    version: `${pipelineConfigMap.version}-${changeId}`,
    tag: tag,
    env: 'build',
    tz: pipelineConfigMap.timezone.api,
    branch: branch,
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '3Gi'
  },
  dev: {
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.api}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`,
    host:
      (isStaticDeployment && pipelineConfigMap.staticUrlsAPI.dev) ||
      `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    appHost:
      (isStaticDeployment && pipelineConfigMap.staticUrls.dev) ||
      `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    backboneApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: false,
    bctwApiHost: 'https://moe-bctw-api-dev.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-dev.apps.silver.devops.gov.bc.ca/api',
    env: 'dev',
    elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: (isStaticDeployment && 'sims') || `local/${deployChangeId}/sims`,
    tz: pipelineConfigMap.timezone.api,
    sso: pipelineConfigMap.sso.dev,
    logLevel: 'debug',
    cpuRequest: '50m',
    cpuLimit: '400m',
    memoryRequest: '100Mi',
    memoryLimit: '2Gi',
    replicas: (isStaticDeployment && '1') || '1',
    replicasMax: (isStaticDeployment && '2') || '1'
  },
  test: {
    namespace: 'af2668-test',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${pipelineConfigMap.module.api}-test`,
    version: pipelineConfigMap.version,
    tag: `test-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.staticUrlsAPI.test,
    appHost: pipelineConfigMap.staticUrls.test,
    backboneApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: false,
    bctwApiHost: 'https://moe-bctw-api-test.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-test.apps.silver.devops.gov.bc.ca/api',
    env: 'test',
    elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: 'sims',
    tz: pipelineConfigMap.timezone.api,
    sso: pipelineConfigMap.sso.test,
    logLevel: 'info',
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '3Gi',
    replicas: '2',
    replicasMax: '4'
  },
  prod: {
    namespace: 'af2668-prod',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${pipelineConfigMap.module.api}-prod`,
    version: pipelineConfigMap.version,
    tag: `prod-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.staticUrlsAPI.prod,
    appHost: pipelineConfigMap.staticUrls.prodVanityUrl,
    backboneApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    backboneIntakePath: '/api/dwc/submission/queue',
    backboneArtifactIntakePath: '/api/artifact/intake',
    backboneIntakeEnabled: false,
    bctwApiHost: 'https://moe-bctw-api-prod.apps.silver.devops.gov.bc.ca',
    critterbaseApiHost: 'https://moe-critterbase-api-prod.apps.silver.devops.gov.bc.ca/api',
    env: 'prod',
    elasticsearchURL: 'http://es01.a0ec71-prod:9200',
    elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: 'sims',
    tz: pipelineConfigMap.timezone.api,
    sso: pipelineConfigMap.sso.prod,
    logLevel: 'info',
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '3Gi',
    replicas: '2',
    replicasMax: '4'
  }
};

module.exports = exports = { phases, options };
