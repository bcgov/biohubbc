'use strict';

const PipelineCli = require('pipeline-cli');
const { processOptions } = require('./utils/utils');

// Options passed in from the git action
const rawOptions = PipelineCli.Util.parseArguments();

const options = processOptions(rawOptions);

// Get pull-request number from git action '--pr' arg
const changeId = rawOptions.pr;

// Get pipeline config map from git action '--config' arg
const pipelineConfigMapString = rawOptions.config;
const pipelineConfigMap = JSON.parse(pipelineConfigMapString);

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
// See `--type=static` in the `deployStatic.yml` git workflow
const isStaticDeployment = rawOptions.type === 'static';

// The branch name, which is either the branch name provided in the git action (for a static deploy) or the current git
// branch name (in the case of a PR deploy)
const branch = (isStaticDeployment && rawOptions.branch) || options.git.ref;

const tag =
  (branch && `build-${pipelineConfigMap.version}-${changeId}-${branch}`) ||
  `build-${pipelineConfigMap.version}-${changeId}`;

const phases = {
  pr: {
    build: {
      ...pipelineConfigMap.app.pr.build,
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch
    },
    deploy: {
      ...pipelineConfigMap.app.pr.deploy,
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-dev-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-pr-${changeId}`,
      version: `pr-${changeId}`,
      tag: `dev-${pipelineConfigMap.version}-${changeId}`,
      host: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      apiHost: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      sso: pipelineConfigMap.sso.pr
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.app.dev.build,
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch
    },
    deploy: {
      ...pipelineConfigMap.app.dev.deploy,
      name: pipelineConfigMap.module.app,
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
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch
    },
    deploy: {
      ...pipelineConfigMap.app.test.deploy,
      name: pipelineConfigMap.module.app,
      changeId: 'deploy',
      suffix: `-test`,
      instance: `${pipelineConfigMap.module.app}-test`,
      version: `deploy-${changeId}`,
      tag: `test-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.app.test.deploy.staticAppUrl,
      apiHost: pipelineConfigMap.app.test.deploy.staticApiUrl,
      sso: pipelineConfigMap.sso.test
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.app.prod.build,
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: tag,
      branch: branch
    },
    deploy: {
      ...pipelineConfigMap.app.prod.deploy,
      name: pipelineConfigMap.module.app,
      changeId: 'deploy',
      suffix: `-prod`,
      instance: `${pipelineConfigMap.module.app}-prod`,
      version: `deploy-${changeId}`,
      tag: `prod-${pipelineConfigMap.version}`,
      host: pipelineConfigMap.app.prod.deploy.staticAppUrl,
      apiHost: pipelineConfigMap.app.prod.deploy.staticApiUrl,
      sso: pipelineConfigMap.sso.prod
    }
  }
};

module.exports = exports = { phases, options };
