'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to deploy the api image (must be already built, see api.build.js).
 *
 * @param {*} settings
 * @returns
 */
const apiDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const DB_SERVICE_NAME = `${phases[env][phase].NAME}-postgresql${phases[env][phase].SUFFIX}`;

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.dc.yaml`, {
      param: {
        NAME: phases[env][phase].NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        VERSION: phases[env][phase].TAG,
        API_HOST: phases[env][phase].API_HOST,
        APP_HOST: phases[env][phase].APP_HOST,
        CHANGE_ID: phases[env]['build'].CHANGE_ID,
        MAX_REQ_BODY_SIZE: phases[env][phase].MAX_REQ_BODY_SIZE,
        // Node
        NODE_ENV: phases[env][phase].NODE_ENV,
        NODE_OPTIONS: phases[env][phase].NODE_OPTIONS,
        // Clamav
        ENABLE_FILE_VIRUS_SCAN: phases[env][phase].ENABLE_FILE_VIRUS_SCAN,
        CLAMAV_HOST: phases[env][phase].CLAMAV_HOST,
        CLAMAV_PORT: phases[env][phase].CLAMAV_PORT,
        // BioHub Platform (aka: Backbone)
        BACKBONE_INTERNAL_API_HOST: phases[env][phase].BACKBONE_INTERNAL_API_HOST,
        BACKBONE_INTAKE_PATH: phases[env][phase].BACKBONE_INTAKE_PATH,
        BACKBONE_ARTIFACT_INTAKE_PATH: phases[env][phase].BACKBONE_ARTIFACT_INTAKE_PATH,
        BIOHUB_TAXON_PATH: phases[env][phase].BIOHUB_TAXON_PATH,
        BIOHUB_TAXON_TSN_PATH: phases[env][phase].BIOHUB_TAXON_TSN_PATH,
        BACKBONE_INTAKE_ENABLED: phases[env][phase].BACKBONE_INTAKE_ENABLED,
        // BCTW / Critterbase
        BCTW_API_HOST: phases[env][phase].BCTW_API_HOST,
        CB_API_HOST: phases[env][phase].CB_API_HOST,
        // Database
        TZ: phases[env][phase].TZ,
        DB_SERVICE_NAME: DB_SERVICE_NAME,
        // Keycloak
        KEYCLOAK_HOST: phases[env][phase].SSO.KEYCLOAK_HOST,
        KEYCLOAK_REALM: phases[env][phase].SSO.KEYCLOAK_REALM,
        KEYCLOAK_CLIENT_ID: phases[env][phase].SSO.KEYCLOAK_CLIENT_ID,
        // Keycloak secret
        KEYCLOAK_SECRET: phases[env][phase].SSO.KEYCLOAK_SECRET,
        // Keycloak Service Client
        KEYCLOAK_ADMIN_USERNAME: phases[env][phase].SSO.serviceClient.KEYCLOAK_ADMIN_USERNAME,
        KEYCLOAK_SECRET_ADMIN_PASSWORD_KEY: phases[env][phase].SSO.serviceClient.KEYCLOAK_SECRET_ADMIN_PASSWORD_KEY,
        // Keycloak CSS API
        KEYCLOAK_API_TOKEN_URL: phases[env][phase].SSO.cssApi.KEYCLOAK_API_TOKEN_URL,
        KEYCLOAK_API_CLIENT_ID: phases[env][phase].SSO.cssApi.KEYCLOAK_API_CLIENT_ID,
        KEYCLOAK_API_CLIENT_SECRET_KEY: phases[env][phase].SSO.cssApi.KEYCLOAK_API_CLIENT_SECRET_KEY,
        KEYCLOAK_API_HOST: phases[env][phase].SSO.cssApi.KEYCLOAK_API_HOST,
        KEYCLOAK_API_ENVIRONMENT: phases[env][phase].SSO.cssApi.KEYCLOAK_API_ENVIRONMENT,
        // Object Store
        OBJECT_STORE_SECRET: phases[env][phase].OBJECT_STORE_SECRET,
        MAX_UPLOAD_NUM_FILES: phases[env][phase].MAX_UPLOAD_NUM_FILES,
        MAX_UPLOAD_FILE_SIZE: phases[env][phase].MAX_UPLOAD_FILE_SIZE,
        S3_KEY_PREFIX: phases[env][phase].S3_KEY_PREFIX,
        // Log Level
        LOG_LEVEL: phases[env][phase].LOG_LEVEL,
        API_RESPONSE_VALIDATION_ENABLED: phases[env][phase].API_RESPONSE_VALIDATION_ENABLED,
        DATABASE_RESPONSE_VALIDATION_ENABLED: phases[env][phase].DATABASE_RESPONSE_VALIDATION_ENABLED,
        // Openshift Resources
        CPU_REQUEST: phases[env][phase].CPU_REQUEST,
        CPU_LIMIT: phases[env][phase].CPU_LIMIT,
        MEMORY_REQUEST: phases[env][phase].MEMORY_REQUEST,
        MEMORY_LIMIT: phases[env][phase].MEMORY_LIMIT,
        REPLICAS: phases[env][phase].REPLICAS,
        REPLICAS_MAX: phases[env][phase].REPLICAS_MAX
      }
    })
  );

  oc.applyRecommendedLabels(
    objects,
    phases[env][phase].NAME,
    env,
    phases[env][phase].CHANGE_ID,
    phases[env][phase].INSTANCE
  );
  oc.importImageStreams(objects, phases[env][phase].TAG, phases[env]['build'].NAMESPACE, phases[env]['build'].TAG);

  await oc.applyAndDeploy(objects, phases[env][phase].INSTANCE);
};

module.exports = { apiDeploy };
