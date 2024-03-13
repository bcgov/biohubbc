'use strict';

const PipelineCli = require('pipeline-cli');

// Options passed in from the git action
const rawOptions = PipelineCli.Util.parseArguments();

// Pull-request number or branch name
const changeId = rawOptions.pr;

// Pipeline config map from openshift
const rawPipelineConfigMap = rawOptions.config;
// Validate the pipeline config map is not missing any fields
const pipelineConfigMap = JSON.parse(rawPipelineConfigMap);

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = rawOptions.type === 'static';

const branch = (isStaticDeployment && rawOptions.branch) || null;

const dbSetupDockerfilePath = './.docker/db/Dockerfile.setup';

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
 *   env: 'pr' | 'dev' | 'test' | 'prod',
 *   phase: 'build' | 'deploy',
 *   pr?: '<pr_number>',
 *   branch?: '<branch_name>',
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
  pr: {
    build: {
      ...pipelineConfigMap.database.pr.build,
      name: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.database.pr.deploy,
      name: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-dev-${changeId}`,
      instance: `${pipelineConfigMap.module.db}-pr-${changeId}`,
      version: `pr-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-${changeId}`
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.database.dev.build,
      name: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.database.dev.deploy,
      name: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: `-dev-deploy`,
      instance: `${pipelineConfigMap.module.db}-dev-deploy`,
      version: `deploy-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-deploy`
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.database.test.build,
      name: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.database.test.deploy,
      name: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: `-test`,
      instance: `${pipelineConfigMap.module.db}-test`,
      version: `deploy-${changeId}`,
      tag: `test-${pipelineConfigMap.version}`
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.database.prod.build,
      name: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.db}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.database.prod.deploy,
      name: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: `-prod`,
      instance: `${pipelineConfigMap.module.db}-prod`,
      version: `deploy-${changeId}`,
      tag: `prod-${pipelineConfigMap.version}`
    }
  }
};

module.exports = exports = { phases, options };
