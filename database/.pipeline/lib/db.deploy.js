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
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const name = `${phases[env][phase].name}`;
  const instance = `${phases[env][phase].instance}`;
  const changeId = `${phases[env][phase].changeId}`;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.dc.yaml`, {
      param: {
        NAME: name,
        DATABASE_SERVICE_NAME: `${name}-postgresql${phases[env][phase].suffix}`,
        IMAGE_STREAM_NAME: name,
        IMAGE_STREAM_VERSION: phases.build.tag,
        POSTGRESQL_DATABASE: 'biohubbc',
        TZ: phases[env][phase].tz,
        IMAGE_STREAM_NAMESPACE: phases.build.namespace,
        VOLUME_CAPACITY: phases[env][phase].volumeCapacity,
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit,
        REPLICAS: phases[env][phase].replicas
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, env, changeId, instance);
  oc.importImageStreams(objects, phases[env][phase].tag, phases.build.namespace, phases.build.tag);
  
  await oc.applyAndDeploy(objects, instance);
};

module.exports = { dbDeploy };
