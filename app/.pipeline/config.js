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

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && rawOptions.branch) || null;
const tag =
  (branch && `build-${pipelineConfigMap.version}-${changeId}-${branch}`) ||
  `build-${pipelineConfigMap.version}-${changeId}`;

const maxUploadNumFiles = 10;
const maxUploadFileSize = 52428800; // (bytes)

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
  build: {
    namespace: 'af2668-tools',
    name: pipelineConfigMap.module.app,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${pipelineConfigMap.module.app}-build-${changeId}`,
    version: `${pipelineConfigMap.version}-${changeId}`,
    tag: tag,
    env: 'build',
    branch: branch,
    cpuRequest: '50m',
    cpuLimit: '1000m',
    memoryRequest: '100Mi',
    memoryLimit: '5Gi'
  },
  dev: {
    namespace: 'af2668-dev',
    name: pipelineConfigMap.module.app,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${pipelineConfigMap.module.app}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${pipelineConfigMap.version}-${deployChangeId}`,
    host:
      (isStaticDeployment && pipelineConfigMap.staticUrls.dev) ||
      `${pipelineConfigMap.module.app}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    apiHost:
      (isStaticDeployment && pipelineConfigMap.staticUrlsAPI.dev) ||
      `${pipelineConfigMap.module.api}-${changeId}-af2668-dev.apps.silver.devops.gov.bc.ca`,
    siteminderLogoutURL: pipelineConfigMap.siteminderLogoutURL.dev,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'dev',
    sso: pipelineConfigMap.sso.dev,
    cpuRequest: '50m',
    cpuLimit: '200m',
    memoryRequest: '100Mi',
    memoryLimit: '333Mi',
    replicas: (isStaticDeployment && '1') || '1',
    replicasMax: (isStaticDeployment && '2') || '1'
  },
  test: {
    namespace: 'af2668-test',
    name: pipelineConfigMap.module.app,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${pipelineConfigMap.module.app}-test`,
    version: pipelineConfigMap.version,
    tag: `test-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.staticUrls.test,
    apiHost: pipelineConfigMap.staticUrlsAPI.test,
    siteminderLogoutURL: pipelineConfigMap.siteminderLogoutURL.test,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'test',
    sso: pipelineConfigMap.sso.test,
    cpuRequest: '50m',
    cpuLimit: '500m',
    memoryRequest: '100Mi',
    memoryLimit: '500Mi',
    replicas: '2',
    replicasMax: '3'
  },
  prod: {
    namespace: 'af2668-prod',
    name: pipelineConfigMap.module.app,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${pipelineConfigMap.module.app}-prod`,
    version: pipelineConfigMap.version,
    tag: `prod-${pipelineConfigMap.version}`,
    host: pipelineConfigMap.staticUrls.prod,
    apiHost: pipelineConfigMap.staticUrlsAPI.prod,
    siteminderLogoutURL: pipelineConfigMap.siteminderLogoutURL.prod,
    maxUploadNumFiles,
    maxUploadFileSize,
    env: 'prod',
    sso: pipelineConfigMap.sso.prod,
    cpuRequest: '50m',
    cpuLimit: '500m',
    memoryRequest: '100Mi',
    memoryLimit: '500Mi',
    replicas: '2',
    replicasMax: '3'
  }
};

module.exports = exports = { phases, options };
