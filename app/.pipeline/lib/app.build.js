'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

const appBuild = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = 'build';

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.bc.yaml`, {
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
  console.log(`${JSON.stringify(objects, null, 2)}`);
  oc.applyAndBuild(objects);
};

module.exports = { appBuild };
