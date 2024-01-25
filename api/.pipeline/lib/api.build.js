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
  const phase = settings.options.env;

  console.log('4==============================================');
  console.log('api options', options);
  console.log('api phase', phase);
  console.log('api phases', phases[phase]);
  console.log('5==============================================');

  console.log('6==============================================');
  console.log({
    NAME: phases[phase].name,
    SUFFIX: phases[phase].suffix,
    VERSION: phases[phase].tag,
    SOURCE_REPOSITORY_URL: oc.git.http_url,
    SOURCE_REPOSITORY_REF: phases[phase].branch || oc.git.ref,
    CPU_REQUEST: phases[phase].cpuRequest,
    CPU_LIMIT: phases[phase].cpuLimit,
    MEMORY_REQUEST: phases[phase].memoryRequest,
    MEMORY_LIMIT: phases[phase].memoryLimit
  });
  console.log('7==============================================');

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.bc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[phase].branch || oc.git.ref,
        CPU_REQUEST: phases[phase].cpuRequest,
        CPU_LIMIT: phases[phase].cpuLimit,
        MEMORY_REQUEST: phases[phase].memoryRequest,
        MEMORY_LIMIT: phases[phase].memoryLimit
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, phases[phase].changeId, phases[phase].instance);
  oc.applyAndBuild(objects);
};

module.exports = { apiBuild };
