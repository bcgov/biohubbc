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

// The branch name, which is either the branch name provided in the git action (for a static deploy) or the current git
// branch name (in the case of a PR deploy)
const branch = rawOptions.branch || null;

const phases = {
  pr: {
    build: {
      ...pipelineConfigMap.api.pr.build,
      name: pipelineConfigMap.module.api,
      dbName: pipelineConfigMap.module.db,
      changeId: changeId,
      suffix: `-build-${changeId}`,
      instance: `${pipelineConfigMap.module.api}-build-${changeId}`,
      version: `${pipelineConfigMap.version}-${changeId}`,
      tag: `build-${pipelineConfigMap.version}-${changeId}`,
      branch: branch
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
      s3KeyPrefix: `${pipelineConfigMap.s3KeyPrefix}/${changeId}`
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      branch: branch
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      branch: branch
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
      tag: `build-${pipelineConfigMap.version}-${changeId}-${branch}`,
      branch: branch
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

if (options.phase === 'pr') {
  console.debug(JSON.stringify(options, null, 2));
  console.debug(JSON.stringify(phases, null, 2));
}

module.exports = exports = { phases, options };
