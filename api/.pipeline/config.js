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

const branch = (isStaticDeployment && rawOptions.branch) || null;
const tag =
  (branch && `build-${pipelineConfigMap.version}-${changeId}-${branch}`) ||
  `build-${pipelineConfigMap.version}-${changeId}`;

/**
 * Parses the npm cli command options and the git action context.
 *
 * @param {*} options
 * @return {{
 *   git: {
 *     dir: '<string>',
 *     branch: {
 *       name: '<string>',
 *       remote: '<string>',
 *       merge: '<string>'
 *     },
 *     url: 'https://github.com/bcgov/biohubbc.git',
 *     uri: 'https://github.com/bcgov/biohubbc',
 *     http_url: 'https://github.com/bcgov/biohubbc.git',
 *     owner: 'bcgov',
 *     repository: 'biohubbc',
 *     pull_request: '<pr_number>',
 *     ref: '<string>',
 *     branch_ref: '<string>'
 *   },
 *   pr: '<pr_number>',
 *   config: {}, // JSON config map
 *   type?: 'static'
 * }}
 */
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
    ...pipelineConfigMap.api.build.pr,
    namespace: 'af2668-tools',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
    version: `${pipelineConfigMap.version}-${changeId}`,
    tag: tag,
    // tz: pipelineConfigMap.tz.api,
    branch: branch
    // cpuRequest: '50m',
    // cpuLimit: '1000m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi'
  },
  pr: {
    ...pipelineConfigMap.api.deploy.pr,
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'pr',
    changeId: changeId,
    suffix: `-dev-${changeId}`,
    instance: `${pipelineConfigMap.module.api}-dev-${changeId}`,
    version: `${changeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${changeId}`,
    host: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    appHost: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    // backboneApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    // backboneIntakePath: '/api/dwc/submission/queue',
    // backboneArtifactIntakePath: '/api/artifact/intake',
    // backboneIntakeEnabled: false,
    // bctwApiHost: 'https://moe-bctw-api-dev.apps.silver.devops.gov.bc.ca',
    // critterbaseApiHost: 'https://moe-critterbase-api-dev.apps.silver.devops.gov.bc.ca/api',
    // env: 'dev',
    // elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    // elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    s3KeyPrefix: `local/${changeId}/sims`,
    // tz: pipelineConfigMap.tz.api,
    sso: pipelineConfigMap.sso.dev
    // logLevel: 'debug',
    // cpuRequest: '50m',
    // cpuLimit: '400m',
    // memoryRequest: '100Mi',
    // memoryLimit: '2Gi',
    // replicas: '1',
    // replicasMax: '1',
  },
  dev: {
    ...pipelineConfigMap.api.deploy.dev,
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'dev',
    changeId: 'deploy',
    suffix: '-dev-deploy',
    instance: `${pipelineConfigMap.module.api}-dev-deploy`,
    version: `deploy-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-deploy`,
    host: pipelineConfigMap.api.deploy.dev.staticApiUrl,
    appHost: pipelineConfigMap.api.deploy.dev.staticAppUrl,
    // backboneApiHost: 'https://api-dev-biohub-platform.apps.silver.devops.gov.bc.ca',
    // backboneIntakePath: '/api/dwc/submission/queue',
    // backboneArtifactIntakePath: '/api/artifact/intake',
    // backboneIntakeEnabled: false,
    // bctwApiHost: 'https://moe-bctw-api-dev.apps.silver.devops.gov.bc.ca',
    // critterbaseApiHost: 'https://moe-critterbase-api-dev.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'development',
    // elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    // elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    // s3KeyPrefix: 'sims',
    // tz: pipelineConfigMap.tz.api,
    sso: pipelineConfigMap.sso.dev
    // logLevel: 'info',
    // cpuRequest: '50m',
    // cpuLimit: '600m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '1',
    // replicasMax: '2',
  },
  test: {
    ...pipelineConfigMap.api.deploy.test,
    namespace: 'af2668-test',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'test',
    changeId: 'deploy',
    suffix: `-test`,
    instance: `${pipelineConfigMap.module.api}-test`,
    version: `deploy-${changeId}`,
    tag: `test-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.api.deploy.test.staticApiUrl,
    appHost: pipelineConfigMap.api.deploy.test.staticAppUrl,
    // backboneApiHost: 'https://api-test-biohub-platform.apps.silver.devops.gov.bc.ca',
    // backboneIntakePath: '/api/dwc/submission/queue',
    // backboneArtifactIntakePath: '/api/artifact/intake',
    // backboneIntakeEnabled: false,
    // bctwApiHost: 'https://moe-bctw-api-test.apps.silver.devops.gov.bc.ca',
    // critterbaseApiHost: 'https://moe-critterbase-api-test.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'production',
    // elasticsearchURL: 'http://es01.a0ec71-dev:9200',
    // elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    // s3KeyPrefix: 'sims',
    // tz: pipelineConfigMap.tz.api,
    sso: pipelineConfigMap.sso.test
    // logLevel: 'info',
    // cpuRequest: '50m',
    // cpuLimit: '1000m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '2',
    // replicasMax: '4'
  },
  prod: {
    ...pipelineConfigMap.api.deploy.prod,
    namespace: 'af2668-prod',
    name: pipelineConfigMap.module.api,
    dbName: pipelineConfigMap.module.db,
    phase: 'prod',
    changeId: 'deploy',
    suffix: `-prod`,
    instance: `${pipelineConfigMap.module.api}-prod`,
    version: `deploy-${changeId}`,
    tag: `prod-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.api.deploy.prod.staticApiUrl,
    appHost: pipelineConfigMap.api.deploy.prod.staticAppVanityUrl,
    // backboneApiHost: 'https://api-biohub-platform.apps.silver.devops.gov.bc.ca',
    // backboneIntakePath: '/api/dwc/submission/queue',
    // backboneArtifactIntakePath: '/api/artifact/intake',
    // backboneIntakeEnabled: false,
    // bctwApiHost: 'https://moe-bctw-api-prod.apps.silver.devops.gov.bc.ca',
    // critterbaseApiHost: 'https://moe-critterbase-api-prod.apps.silver.devops.gov.bc.ca/api',
    nodeEnv: 'production',
    // elasticsearchURL: 'http://es01.a0ec71-prod:9200',
    // elasticsearchTaxonomyIndex: 'taxonomy_3.0.0',
    // s3KeyPrefix: 'sims',
    // tz: pipelineConfigMap.tz.api,
    sso: pipelineConfigMap.sso.prod
    // logLevel: 'info',
    // cpuRequest: '50m',
    // cpuLimit: '1000m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '2',
    // replicasMax: '4'
  }
};

console.log('1==============================================');
console.log('api phases', phases);
console.log('2==============================================');
console.log('api options', options);
console.log('3==============================================');

module.exports = exports = { phases, options };
