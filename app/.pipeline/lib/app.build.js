'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Build the app image.
 *
 * @param {*} settings
 */
const appBuild = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.bc.yaml`, {
      param: {
        NAME: phases[env][phase].name,
        SUFFIX: phases[env][phase].suffix,
        VERSION: phases[env][phase].tag,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[env][phase].branch || oc.git.ref,
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[env][phase].name, env, phases[env][phase].changeId, phases[env][phase].instance);
  oc.applyAndBuild(objects);
};

module.exports = { appBuild };
