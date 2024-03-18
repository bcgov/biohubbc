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
      ...pipelineConfigMap.database.pr.build,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.db}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}`,
      BRANCH: options.git.ref
    },
    deploy: {
      ...pipelineConfigMap.database.pr.deploy,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-dev-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.db}-pr-${changeId}`,
      VERSION: `pr-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-${changeId}`
    }
  },
  dev: {
    build: {
      ...pipelineConfigMap.database.dev.build,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.db}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.database.dev.deploy,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: `-dev-deploy`,
      INSTANCE: `${pipelineConfigMap.module.db}-dev-deploy`,
      VERSION: `deploy-${changeId}`,
      TAG: `dev-${pipelineConfigMap.version}-deploy`
    }
  },
  test: {
    build: {
      ...pipelineConfigMap.database.test.build,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.db}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.database.test.deploy,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: `-test`,
      INSTANCE: `${pipelineConfigMap.module.db}-test`,
      VERSION: `deploy-${changeId}`,
      TAG: `test-${pipelineConfigMap.version}`
    }
  },
  prod: {
    build: {
      ...pipelineConfigMap.database.prod.build,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: changeId,
      SUFFIX: `-build-${changeId}`,
      INSTANCE: `${pipelineConfigMap.module.db}-build-${changeId}`,
      VERSION: `${pipelineConfigMap.version}-${changeId}`,
      TAG: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      BRANCH: branch
    },
    deploy: {
      ...pipelineConfigMap.database.prod.deploy,
      NAME: pipelineConfigMap.module.db,
      CHANGE_ID: 'deploy',
      SUFFIX: `-prod`,
      INSTANCE: `${pipelineConfigMap.module.db}-prod`,
      VERSION: `deploy-${changeId}`,
      TAG: `prod-${pipelineConfigMap.version}`
    }
  }
};

module.exports = exports = { phases, options };
