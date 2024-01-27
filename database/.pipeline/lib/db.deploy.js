'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to deploy the database image (must be already built, see db.build.js).
 *
 * @param {*} settings
 * @returns
 */
const dbDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const name = `${phases[phase].name}`;
  const instance = `${phases[phase].instance}`;
  const changeId = `${phases[phase].changeId}`;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.dc.yaml`, {
      param: {
        NAME: name,
        DATABASE_SERVICE_NAME: `${name}-postgresql${phases[phase].suffix}`,
        IMAGE_STREAM_NAME: name,
        IMAGE_STREAM_VERSION: phases.build.tag,
        POSTGRESQL_DATABASE: 'biohubbc',
        TZ: phases[phase].tz,
        IMAGE_STREAM_NAMESPACE: phases.build.namespace,
        VOLUME_CAPACITY: phases[phase].volumeCapacity,
        CPU_REQUEST: phases[phase].cpuRequest,
        CPU_LIMIT: phases[phase].cpuLimit,
        MEMORY_REQUEST: phases[phase].memoryRequest,
        MEMORY_LIMIT: phases[phase].memoryLimit,
        REPLICAS: phases[phase].replicas
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, phase, changeId, instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  
  await oc.applyAndDeploy(objects, instance);
};

module.exports = { dbDeploy };
