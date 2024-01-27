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
      ...pipelineConfigMap.app.pr.build,
      namespace: 'af2668-tools',
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.app.pr.deploy,
      namespace: 'af2668-dev',
      name: pipelineConfigMap.module.app,
      //   phase: 'dev',
      changeId: changeId,
      suffix: `-dev-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-pr-${changeId}`,
      version: `${changeId}-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-${changeId}`,
      host: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      apiHost: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      sso: pipelineConfigMap.sso.dev
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.app.dev.build,
      namespace: 'af2668-tools',
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.app.dev.deploy,
      namespace: 'af2668-dev',
      name: pipelineConfigMap.module.app,
      //   phase: 'dev',
      changeId: 'deploy',
      suffix: '-dev-deploy',
      instance: `${pipelineConfigMap.module.app}-dev-deploy`,
      version: `deploy-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-deploy`,
      host: pipelineConfigMap.app.dev.deploy.staticAppUrl,
      apiHost: pipelineConfigMap.app.dev.deploy.staticApiUrl,
      sso: pipelineConfigMap.sso.dev
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.app.test.build,
      namespace: 'af2668-tools',
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.app.test.deploy,
      namespace: 'af2668-test',
      name: pipelineConfigMap.module.app,
      //   phase: 'test',
      changeId: 'deploy',
      suffix: `-test`,
      instance: `${pipelineConfigMap.module.app}-test`,
      version: pipelineConfigMap.version,
      tag: `test-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.app.test.deploy.staticAppUrl,
      apiHost: pipelineConfigMap.app.test.deploy.staticApiUrl,
      sso: pipelineConfigMap.sso.test
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.app.prod.build,
      namespace: 'af2668-tools',
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch || options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.app.prod.deploy,
      namespace: 'af2668-prod',
      name: pipelineConfigMap.module.app,
      //   phase: 'prod',
      changeId: 'deploy',
      suffix: `-prod`,
      instance: `${pipelineConfigMap.module.app}-prod`,
      version: pipelineConfigMap.version,
      tag: `prod-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.app.prod.deploy.staticAppUrl,
      apiHost: pipelineConfigMap.app.prod.deploy.staticApiUrl,
      sso: pipelineConfigMap.sso.prod
    }
  }
};

module.exports = exports = { phases, options };
