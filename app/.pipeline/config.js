'use strict';

const PipelineCli = require('pipeline-cli');
const { processOptions } = require('./utils/utils');

// Options passed in from the git action
const rawOptions = PipelineCli.Util.parseArguments();

const options = processOptions(rawOptions);

// Get pull-request number from git action '--pr' arg
const changeId = options.pr;

// Get branch name from the git action '--branch' arg
const branch = options.branch || null;

// Get pipeline config map from git action '--config' arg
const pipelineConfigMapString = options.config;
const pipelineConfigMap = JSON.parse(pipelineConfigMapString);

const phases = {
  pr: {
    build: {
      ...pipelineConfigMap.app.pr.build,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.app}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}`,
      BRANCH: options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.app.pr.deploy,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: changeId,
      SUFFIX: `-dev-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.app}-pr-${changeId}`,
      VERSION: `pr-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-${changeId}`,
      APP_HOST: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      API_HOST: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      SSO: pipelineConfigMap.SSO.pr
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.app.dev.build,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.app}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.app.dev.deploy,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: 'deploy',
      SUFFIX: '-dev-deploy',
      INSTANCE: `${pipelineConfigMap.module.app}-dev-deploy`,
      VERSION: `deploy-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-deploy`,
      APP_HOST: pipelineConfigMap.app.dev.deploy.APP_HOST,
      API_HOST: pipelineConfigMap.app.dev.deploy.API_HOST,
      SSO: pipelineConfigMap.SSO.dev
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.app.test.build,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.app}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.app.test.deploy,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: 'deploy',
      SUFFIX: `-test`,
      INSTANCE: `${pipelineConfigMap.module.app}-test`,
      VERSION: `deploy-${changeId}`,
      TAG: `test-${pipelineConfigMap.version}`,
      APP_HOST: pipelineConfigMap.app.test.deploy.APP_HOST,
      API_HOST: pipelineConfigMap.app.test.deploy.API_HOST,
      SSO: pipelineConfigMap.SSO.test
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.app.prod.build,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.app}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.app.prod.deploy,
      NAME: pipelineConfigMap.module.app,
      CHANGE_ID: 'deploy',
      SUFFIX: `-prod`,
      INSTANCE: `${pipelineConfigMap.module.app}-prod`,
      VERSION: `deploy-${changeId}`,
      TAG: `prod-${pipelineConfigMap.version}`,
      APP_HOST: pipelineConfigMap.app.prod.deploy.APP_HOST,
      API_HOST: pipelineConfigMap.app.prod.deploy.API_HOST,
      SSO: pipelineConfigMap.SSO.prod
    }
  }
};

module.exports = exports = { phases, options };
