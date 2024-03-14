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
      branch: branch
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
      branch: branch
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
      branch: branch
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
      branch: branch
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
