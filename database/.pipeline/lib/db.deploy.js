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

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const NAME = `${phases[env][phase].NAME}`;
  const INSTANCE = `${phases[env][phase].INSTANCE}`;
  const CHANGE_ID = `${phases[env][phase].CHANGE_ID}`;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.dc.yaml`, {
      param: {
        NAME: NAME,
        DATABASE_SERVICE_NAME: `${NAME}-postgresql${phases[env][phase].SUFFIX}`,
        IMAGE_STREAM_NAME: NAME,
        IMAGE_STREAM_VERSION: phases[env]['build'].TAG,
        POSTGRESQL_DATABASE: 'biohubbc',
        TZ: phases[env][phase].TZ,
        IMAGE_STREAM_NAMESPACE: phases[env]['build'].NAMESPACE,
        VOLUME_CAPACITY: phases[env][phase].VOLUME_CAPACITY,
        // Openshift Resources
        CPU_REQUEST: phases[env][phase].CPU_REQUEST,
        CPU_LIMIT: phases[env][phase].CPU_LIMIT,
        MEMORY_REQUEST: phases[env][phase].MEMORY_REQUEST,
        MEMORY_LIMIT: phases[env][phase].MEMORY_LIMIT,
        REPLICAS: phases[env][phase].REPLICAS
      }
    })
  );

  oc.applyRecommendedLabels(objects, NAME, env, CHANGE_ID, INSTANCE);
  oc.importImageStreams(objects, phases[env][phase].TAG, phases[env]['build'].NAMESPACE, phases[env]['build'].TAG);

  await oc.applyAndDeploy(objects, INSTANCE);
};

module.exports = { dbDeploy };
