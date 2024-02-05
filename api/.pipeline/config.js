'use strict';

const PipelineCli = require('pipeline-cli');
const { getPipelineConfigMapSchema } = require('../../.pipeline/configMaps/PipelineConfigMapSchema');

const PipelineConfigMapSchema = getPipelineConfigMapSchema();

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
      ...PipelineConfigMapSchema.api.pr.build,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.api.pr.deploy,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-dev-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-pr-${changeId}`,
      version: `pr-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-${changeId}`,
      host: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      appHost: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      sso: pipelineConfigMap.sso.pr,
      s3KeyPrefix: `local/${changeId}/${pipelineConfigMap.name}`
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.api.dev.build,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.api.dev.deploy,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: '-dev-deploy',
      instance: `${pipelineConfigMap.module.api}-dev-deploy`,
      version: `deploy-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-deploy`,
      host: pipelineConfigMap.api.dev.deploy.staticApiUrl,
      appHost: pipelineConfigMap.api.dev.deploy.staticAppUrl,
      sso: pipelineConfigMap.sso.dev
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.api.test.build,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.api.test.deploy,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: `-test`,
      instance: `${pipelineConfigMap.module.api}-test`,
      version: `deploy-${changeId}`,
      tag: `test-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.api.test.deploy.staticApiUrl,
      appHost: pipelineConfigMap.api.test.deploy.staticAppUrl,
      sso: pipelineConfigMap.sso.test
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.api.prod.build,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,

      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.api.prod.deploy,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: 'deploy',
      suffix: `-prod`,
      instance: `${pipelineConfigMap.module.api}-prod`,
      version: `deploy-${changeId}`,
      tag: `prod-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.api.prod.deploy.staticApiUrl,
      appHost: pipelineConfigMap.api.prod.deploy.staticAppVanityUrl,
      sso: pipelineConfigMap.sso.prod
    }
  }
};

module.exports = exports = { phases, options };
