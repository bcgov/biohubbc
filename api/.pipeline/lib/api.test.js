'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');
const wait = require('../utils/wait');
const checkAndClean = require('../utils/checkAndClean');

/**
 * Run a pod to execute tests.
 *
 * @param {*} settings
 */
module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const changeId = phases[phase].changeId;
  const instance = `${phases[phase].name}-${changeId}`;
  const image = `${phases[phase].name}:${phases[phase].tag}-setup`;

  let objects = [];

  // Get API image stream
  const data = oc.get(`istag/${image}`) || [];
  if (data.length === 0) {
    console.log('Unable to fetch API image ref');
    process.exit(0);
  }
  const imageStream = data[0];

  const podName = `${phases[phase].name}${phases[phase].suffix}-test`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.test.yaml`, {
      param: {
        NAME: podName,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        CHANGE_ID: phases[phase].changeId,
        ENVIRONMENT: phases[phase].env || 'dev',
        DB_SERVICE_NAME: `${phases[phase].dbName}-postgresql${phases[phase].suffix}`,
        IMAGE: imageStream.image.dockerImageReference,
        CERTIFICATE_URL: 'https://dev.oidc.gov.bc.ca/auth/realms/dfmlcg7z/protocol/openid-connect/certs'
      }
    })
  );
  checkAndClean(`pod/${podName}`, oc);

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, instance);
  oc.applyAndDeploy(objects, phases[phase].instance);

  wait(`pod/${podName}`, settings, 35);
};
