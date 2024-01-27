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
 *   pr?: '<pr_number>',
 *   branch?: '<string>',
 *   static?: '<boolean>',
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
    phase: 'build',
    namespace: 'af2668-tools',
    name: pipelineConfigMap.module.db,
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
    version: `${pipelineConfigMap.version}-${changeId}`,
    tag: tag,
    branch: branch
  },
  pr: {
    ...pipelineConfigMap.database.deploy.pr,
    phase: 'dev',
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.db,
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.db}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`
  },
  dev: {
    ...pipelineConfigMap.database.deploy.dev,
    phase: 'dev',
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.db,
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.db}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`
  },
  test: {
    ...pipelineConfigMap.database.deploy.test,
    phase: 'test',
    namespace: 'af2668-test',
    name: pipelineConfigMap.module.db,
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${pipelineConfigMap.module.db}-test`,
    version: pipelineConfigMap.version,
    tag: `test-${pipelineConfigMap.version}`
  },
  prod: {
    ...pipelineConfigMap.database.deploy.prod,
    phase: 'prod',
    namespace: 'af2668-prod',
    name: pipelineConfigMap.module.db,
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${pipelineConfigMap.module.db}-prod`,
    version: pipelineConfigMap.version,
    tag: `prod-${pipelineConfigMap.version}`
  }
};

console.log('1==============================================');
console.log('api phases', phases);
console.log('2==============================================');
console.log('api options', options);
console.log('3==============================================');

module.exports = exports = { phases, options };
