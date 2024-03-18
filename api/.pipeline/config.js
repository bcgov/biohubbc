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
      ...pipelineConfigMap.api.pr.build,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.api}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}`,
      BRANCH: options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.api.pr.deploy,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-dev-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.api}-pr-${changeId}`,
      VERSION: `pr-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-${changeId}`,
      API_HOST: `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      APP_HOST: `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
      SSO: pipelineConfigMap.sso.pr,
      S3_KEY_PREFIX: `${pipelineConfigMap.S3_KEY_PREFIX}/${changeId}`
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.api.dev.build,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.api}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.api.dev.deploy,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: '-dev-deploy',
      INSTANCE: `${pipelineConfigMap.module.api}-dev-deploy`,
      VERSION: `deploy-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-deploy`,
      API_HOST: pipelineConfigMap.api.dev.deploy.API_HOST,
      APP_HOST: pipelineConfigMap.api.dev.deploy.APP_HOST,
      SSO: pipelineConfigMap.sso.dev
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.api.test.build,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.api}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.api.test.deploy,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: `-test`,
      INSTANCE: `${pipelineConfigMap.module.api}-test`,
      VERSION: `deploy-${changeId}`,
      TAG: `test-${pipelineConfigMap.version}`,
      API_HOST: pipelineConfigMap.api.test.deploy.API_HOST,
      APP_HOST: pipelineConfigMap.api.test.deploy.APP_HOST,
      SSO: pipelineConfigMap.sso.test
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.api.prod.build,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,

      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.api}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.api.prod.deploy,
      NAME: pipelineConfigMap.module.api,
      DB_NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: `-prod`,
      INSTANCE: `${pipelineConfigMap.module.api}-prod`,
      VERSION: `deploy-${changeId}`,
      TAG: `prod-${pipelineConfigMap.version}`,
      API_HOST: pipelineConfigMap.api.prod.deploy.API_HOST,
      APP_HOST: pipelineConfigMap.api.prod.deploy.APP_VANITY_URL,
      SSO: pipelineConfigMap.sso.prod
    }
  }
};

module.exports = exports = { phases, options };
