'use strict';

const PipelineCli = require('pipeline-cli');
const { processOptions } = require('./utils/utils');

// Options passed in from the git action
const rawOptions = PipelineCli.Util.parseArguments();

const options = processOptions(rawOptions);

// Get pull-request number from git action '--pr' arg
const changeId = rawOptions.pr;

// Get branch name from the git action '--branch' arg
const branch = rawOptions.branch || null;

// Get pipeline config map from git action '--config' arg
const pipelineConfigMapString = rawOptions.config;
const pipelineConfigMap = JSON.parse(pipelineConfigMapString);

const phases = {
  pr: {
    build: {
      ...pipelineConfigMap.app.pr.build,
      name: pipelineConfigMap.module.app,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: `build-${pipelineConfigMap.version}-${changeId}`,
      branch: options.git.ref
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
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
