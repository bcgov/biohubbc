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

// Default: run both seeding and migrations
let dbSetupDockerfilePath = './.docker/db/Dockerfile.setup';
if (isStaticDeployment && options.branch === 'prod') {
  // If this is static build to prod, then only run the migrations
  dbSetupDockerfilePath = './.docker/db/Dockerfile.migrate';
}

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
    ...pipelineConfigMap.database.build,
    namespace: 'af2668-tools',
    name: pipelineConfigMap.module.db,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
    version: `${pipelineConfigMap.version}-${changeId}`,
    tag: tag,
    // tz: pipelineConfigMap.tz.db,
    branch: branch,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  },
  pr: {
    ...pipelineConfigMap.database.deploy.pr,
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.db,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.db}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`,
    env: 'dev',
    // tz: pipelineConfigMap.tz.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
    // volumeCapacity: (isStaticDeployment && '3Gi') || '500Mi',
    // cpuRequest: '50m',
    // cpuLimit: '400m',
    // memoryRequest: '100Mi',
    // memoryLimit: '2Gi',
    // replicas: '1'
  },
  dev: {
    ...pipelineConfigMap.database.deploy.dev,
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.db,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.db}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`,
    nodeEnv: 'development',
    // tz: pipelineConfigMap.tz.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
    // volumeCapacity: (isStaticDeployment && '3Gi') || '500Mi',
    // cpuRequest: '50m',
    // cpuLimit: '600m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '1'
  },
  test: {
    ...pipelineConfigMap.database.deploy.test,
    namespace: 'af2668-test',
    name: pipelineConfigMap.module.db,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${pipelineConfigMap.module.db}-test`,
    version: pipelineConfigMap.version,
    tag: `test-${pipelineConfigMap.version}`,
    nodeEnv: 'production',
    // tz: pipelineConfigMap.tz.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
    // volumeCapacity: '3Gi',
    // cpuRequest: '50m',
    // cpuLimit: '1000m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '1'
  },
  prod: {
    ...pipelineConfigMap.database.deploy.prod,
    namespace: 'af2668-prod',
    name: pipelineConfigMap.module.db,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${pipelineConfigMap.module.db}-prod`,
    version: pipelineConfigMap.version,
    tag: `prod-${pipelineConfigMap.version}`,
    nodeEnv: 'production',
    // tz: pipelineConfigMap.tz.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
    // volumeCapacity: '5Gi',
    // cpuRequest: '50m',
    // cpuLimit: '1000m',
    // memoryRequest: '100Mi',
    // memoryLimit: '3Gi',
    // replicas: '1'
  }
};

console.log('1==============================================');
console.log('api phases', phases);
console.log('2==============================================');
console.log('api options', options);
console.log('3==============================================');

module.exports = exports = { phases, options };
