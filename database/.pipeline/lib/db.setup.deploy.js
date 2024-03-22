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

  const IMAGE_NAME = `${phases[env][phase].NAME}-setup`;
  const INSTANCE = `${IMAGE_NAME}-${phases[env][phase].CHANGE_ID}`;
  const IMAGE_VERSION = `${phases[env][phase].TAG}-setup`;
  const IMAGESTREAM_NAME = `${IMAGE_NAME}:${IMAGE_VERSION}`;
  const DB_SERVICE_NAME = `${phases[env][phase].NAME}-postgresql${phases[env][phase].SUFFIX}`;

  const objects = [];
  const imageStreamObjects = [];

  // Clean existing image
  await checkAndClean(`istag/${IMAGESTREAM_NAME}`, 10, 5, 0, oc).catch(() => {
    // Ignore errors, nothing to clean
  });

  // Creating image stream for setup
  imageStreamObjects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.is.yaml`, {
      param: {
        NAME: `${IMAGE_NAME}`
      }
    })
  );

  oc.applyRecommendedLabels(imageStreamObjects, IMAGE_NAME, env, phases[env][phase].CHANGE_ID, INSTANCE);
  oc.importImageStreams(imageStreamObjects, IMAGE_VERSION, phases[env]['build'].NAMESPACE, phases[env]['build'].TAG);

  // Get database setup image stream
  const fetchedImageStreams = oc.get(`istag/${IMAGESTREAM_NAME}`) || [];

  if (!fetchedImageStreams.length) {
    console.debug('Unable to fetch Database image reference for use in database setup deployment');
    process.exit(0);
  }

  const dbSetupImageStream = fetchedImageStreams[0];

  const NAME = `${IMAGE_NAME}${phases[env][phase].SUFFIX}`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.dc.yaml`, {
      param: {
        NAME: NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        VERSION: phases[env][phase].TAG,
        CHANGE_ID: phases[env][phase].CHANGE_ID,
        NODE_ENV: phases[env][phase].NODE_ENV,
        DB_SERVICE_NAME: DB_SERVICE_NAME,
        DB_SCHEMA: phases[env][phase].DB_SCHEMA,
        DB_SCHEMA_DAPI_V1: phases[env][phase].DB_SCHEMA_DAPI_V1,
        IMAGE: dbSetupImageStream.image.dockerImageReference,
        // Development Seeding
        SEED_PROJECT_USER_IDENTIFIER: phases[env][phase].SEED_PROJECT_USER_IDENTIFIER,
        SEED_NUM_PROJECTS: phases[env][phase].SEED_NUM_PROJECTS,
        SEED_NUM_SURVEYS_PER_PROJECT: phases[env][phase].SEED_NUM_SURVEYS_PER_PROJECT,
        SEED_NUM_OBSERVATIONS_PER_SURVEY: phases[env][phase].SEED_NUM_OBSERVATIONS_PER_SURVEY,
        SEED_NUM_SUBCOUNTS_PER_OBSERVATION: phases[env][phase].SEED_NUM_SUBCOUNTS_PER_OBSERVATION,
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
    () => getResourceByRaw(`name=${DB_SERVICE_NAME}`, 'pod', settings, oc),
    isResourceRunning,
    30,
    5,
    0
  );

  // Deploy the db setup pod
  oc.applyRecommendedLabels(objects, IMAGE_NAME, env, phases[env][phase].CHANGE_ID, INSTANCE);
  await oc.applyAndDeploy(objects, phases[env][phase].INSTANCE);

  // Wait to confirm if the db setup pod deployed successfully
  await waitForResourceToMeetCondition(() => getResourceByName(`pod/${NAME}`, oc), isResourceComplete, 30, 5, 0);
};

module.exports = { dbSetupDeploy };
