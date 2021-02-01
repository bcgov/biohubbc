'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to deploy the database image (must be already built, see db.build.js).
 *
 * @param {*} settings
 * @returns
 */
module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

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
        POSTGRES_DB: 'biohubbc',
        IMAGE_STREAM_NAMESPACE: phases.build.namespace,
        VOLUME_CAPACITY:
          `${name}-postgresql${phases[phase].suffix}` === `${name}-postgresql-dev-deploy` ? '20Gi' : '3Gi'
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, phase, changeId, instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  oc.applyAndDeploy(objects, instance);
};
