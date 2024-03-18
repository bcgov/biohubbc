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

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const CHANGE_ID = phases[env][phase].CHANGE_ID;
  const isName = `${phases[env][phase].NAME}-setup`;
  const INSTANCE = `${isName}-${CHANGE_ID}`;
  const isVersion = `${phases[env][phase].TAG}-setup`;
  const imageStreamName = `${isName}:${isVersion}`;
  const DB_NAME = `${phases[env][phase].NAME}-postgresql${phases[env][phase].SUFFIX}`;

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

  oc.applyRecommendedLabels(imageStreamObjects, isName, env, CHANGE_ID, INSTANCE);
  oc.importImageStreams(imageStreamObjects, isVersion, phases[env]['build'].NAMESPACE, phases[env]['build'].TAG);

  // Get database setup image stream
  const fetchedImageStreams = oc.get(`istag/${imageStreamName}`) || [];

  if (!fetchedImageStreams.length) {
    console.debug('Unable to fetch Database image reference for use in database setup deployment');
    process.exit(0);
  }

  const dbSetupImageStream = fetchedImageStreams[0];

  const NAME = `${isName}${phases[env][phase].SUFFIX}`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.dc.yaml`, {
      param: {
        NAME: NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        VERSION: phases[env][phase].TAG,
        CHANGE_ID: CHANGE_ID,
        NODE_ENV: phases[env][phase].NODE_ENV,
        DB_SERVICE_NAME: DB_NAME,
        DB_SCHEMA: 'biohub',
        DB_SCHEMA_DAPI_V1: 'biohub_dapi_v1',
        IMAGE: dbSetupImageStream.image.dockerImageReference,
        // Development Seeding
        PROJECT_SEEDER_USER_IDENTIFIER: phases[env][phase].PROJECT_SEEDER_USER_IDENTIFIER,
        NUM_SEED_PROJECTS: phases[env][phase].NUM_SEED_PROJECTS,
        NUM_SEED_SURVEYS_PER_PROJECT: phases[env][phase].NUM_SEED_SURVEYS_PER_PROJECT,
        // Openshift Resources
        CPU_REQUEST: phases[env][phase].CPU_REQUEST,
        CPU_LIMIT: phases[env][phase].CPU_LIMIT,
        MEMORY_REQUEST: phases[env][phase].MEMORY_REQUEST,
        MEMORY_LIMIT: phases[env][phase].MEMORY_LIMIT
      }
    })
  );

  // Clean existing setup pod
  await checkAndClean(`pod/${NAME}`, 10, 5, 0, oc).catch(() => {
    // Ignore errors, nothing to clean
  });

  // Wait to confirm if the db pod deployed successfully
  await waitForResourceToMeetCondition(
    () => getResourceByRaw(`name=${DB_NAME}`, 'pod', settings, oc),
    isResourceRunning,
    30,
    5,
    0
  );

  // Deploy the db setup pod
  oc.applyRecommendedLabels(objects, isName, env, CHANGE_ID, INSTANCE);
  await oc.applyAndDeploy(objects, phases[env][phase].INSTANCE);

  // Wait to confirm if the db setup pod deployed successfully
  await waitForResourceToMeetCondition(() => getResourceByName(`pod/${NAME}`, oc), isResourceComplete, 30, 5, 0);
};

module.exports = { dbSetupDeploy };
