'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');
const {
  checkAndClean,
  getResourceByName,
  getResourceByRaw,
  isResourceComplete,
  isResourceRunning,
  waitForResourceToMeetCondition
} = require('../utils/utils');

const dbSetupDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].deploy.namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const changeId = phases[env][phase].deploy.changeId;
  const isName = `${phases[env][phase].deploy.name}-setup`;
  const instance = `${isName}-${changeId}`;
  const isVersion = `${phases[env][phase].deploy.tag}-setup`;
  const imageStreamName = `${isName}:${isVersion}`;
  const dbName = `${phases[env][phase].deploy.name}-postgresql${phases[env][phase].deploy.suffix}`;

  const objects = [];
  const imageStreamObjects = [];

  // Clean existing image
  await checkAndClean(`istag/${imageStreamName}`, 10, 5, 0, oc).catch(() => {
    // Ignore errors, nothing to clean
  });

  // Creating image stream for setup
  imageStreamObjects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.is.yaml`, {
      param: {
        NAME: `${isName}`
      }
    })
  );

  oc.applyRecommendedLabels(imageStreamObjects, isName, env, `${changeId}`, instance);
  oc.importImageStreams(imageStreamObjects, isVersion, phases.build.namespace, phases.build.tag);

  // Get database setup image stream
  const fetchedImageStreams = oc.get(`istag/${imageStreamName}`) || [];

  if (!fetchedImageStreams.length) {
    console.log('Unable to fetch Database image reference for use in database setup deployment');
    process.exit(0);
  }

  const dbSetupImageStream = fetchedImageStreams[0];

  const name = `${isName}${phases[env][phase].deploy.suffix}`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.dc.yaml`, {
      param: {
        NAME: name,
        SUFFIX: phases[env][phase].deploy.suffix,
        VERSION: phases[env][phase].deploy.tag,
        CHANGE_ID: changeId,
        NODE_ENV: phases[env][phase].deploy.nodeEnv,
        DB_SERVICE_NAME: dbName,
        DB_SCHEMA: 'biohub',
        DB_SCHEMA_DAPI_V1: 'biohub_dapi_v1',
        IMAGE: dbSetupImageStream.image.dockerImageReference,
        CPU_REQUEST: '50m',
        CPU_LIMIT: '1000m',
        MEMORY_REQUEST: '100Mi',
        MEMORY_LIMIT: '1.5Gi'
      }
    })
  );

  // Clean existing setup pod
  await checkAndClean(`pod/${name}`, 10, 5, 0, oc).catch(() => {
    // Ignore errors, nothing to clean
  });

  // Wait to confirm if the db pod deployed successfully
  await waitForResourceToMeetCondition(
    () => getResourceByRaw(`name=${dbName}`, 'pod', settings, oc),
    isResourceRunning,
    30,
    5,
    0
  );

  // Deploy the db setup pod
  oc.applyRecommendedLabels(objects, isName, env, `${changeId}`, instance);
  await oc.applyAndDeploy(objects, phases[env][phase].deploy.instance);

  // Wait to confirm if the db setup pod deployed successfully
  await waitForResourceToMeetCondition(() => getResourceByName(`pod/${name}`, oc), isResourceComplete, 30, 5, 0);
};

module.exports = { dbSetupDeploy };
