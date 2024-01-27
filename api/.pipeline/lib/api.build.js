'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Build the api image.
 *
 * @param {*} settings
 */
const apiBuild = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  console.log('4==============================================');
  console.log('api options', options);
  console.log('api env', env);
  console.log('api phase', phase);
  console.log('api phases', phases[env][phase]);
  console.log('5==============================================');

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  console.log('6==============================================');
  console.log({
    NAME: phases[env][phase].name,
    SUFFIX: phases[env][phase].suffix,
    VERSION: phases[env][phase].tag,
    SOURCE_REPOSITORY_URL: oc.git.http_url,
    SOURCE_REPOSITORY_REF: phases[env][phase].branch,
    CPU_REQUEST: phases[env][phase].cpuRequest,
    CPU_LIMIT: phases[env][phase].cpuLimit,
    MEMORY_REQUEST: phases[env][phase].memoryRequest,
    MEMORY_LIMIT: phases[env][phase].memoryLimit
  });
  console.log('7==============================================');

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.bc.yaml`, {
      param: {
        NAME: phases[env][phase].name,
        SUFFIX: phases[env][phase].suffix,
        VERSION: phases[env][phase].tag,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[env][phase].branch,
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit
      }
    })
  );

  oc.applyRecommendedLabels(
    objects,
    phases[env][phase].name,
    env,
    phases[env][phase].changeId,
    phases[env][phase].instance
  );
  oc.applyAndBuild(objects);
};

module.exports = { apiBuild };
