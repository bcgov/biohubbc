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
  const phase = settings.options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const changeId = phases[phase].changeId;

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.dc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST: phases[phase].host,
        APP_HOST: phases[phase].appHost,
        CHANGE_ID: phases.build.changeId || changeId,
        // Node
        NODE_ENV: phases[phase].nodeEnv,
        NODE_OPTIONS: phases[phase].nodeOptions,
        // Persistent Volume
        VOLUME_CAPACITY: phases[phase].volumeCapacity,
        // BioHub Platform (aka: Backbone)
        BACKBONE_INTERNAL_API_HOST: phases[phase].backboneInternalApiHost,
        BACKBONE_INTAKE_PATH: phases[phase].backboneIntakePath,
        BACKBONE_ARTIFACT_INTAKE_PATH: phases[phase].backboneArtifactIntakePath,
        BIOHUB_TAXON_PATH: phases[phase].biohubTaxonPath,
        BIOHUB_TAXON_TSN_PATH: phases[phase].biohubTaxonTsnPath,
        // BCTW / Critterbase
        BCTW_API_HOST: phases[phase].bctwApiHost,
        CB_API_HOST: phases[phase].critterbaseApiHost,
        // S3
        S3_KEY_PREFIX: phases[phase].s3KeyPrefix,
        // Database
        TZ: phases[phase].tz,
        DB_SERVICE_NAME: `${phases[phase].dbName}-postgresql${phases[phase].suffix}`,
        // Keycloak
        KEYCLOAK_HOST: phases[phase].sso.host,
        KEYCLOAK_REALM: phases[phase].sso.realm,
        KEYCLOAK_CLIENT_ID: phases[phase].sso.clientId,
        // Keycloak secret
        KEYCLOAK_SECRET: phases[phase].sso.keycloakSecret,
        // Keycloak Service Client
        KEYCLOAK_ADMIN_USERNAME: phases[phase].sso.serviceClient.serviceClientName,
        KEYCLOAK_SECRET_ADMIN_PASSWORD_KEY: phases[phase].sso.serviceClient.keycloakSecretServiceClientPasswordKey,
        // Keycloak CSS API
        KEYCLOAK_API_TOKEN_URL: phases[phase].sso.cssApi.cssApiTokenUrl,
        KEYCLOAK_API_CLIENT_ID: phases[phase].sso.cssApi.cssApiClientId,
        KEYCLOAK_API_CLIENT_SECRET_KEY: phases[phase].sso.cssApi.keycloakSecretCssApiSecretKey,
        KEYCLOAK_API_HOST: phases[phase].sso.cssApi.cssApiHost,
        KEYCLOAK_API_ENVIRONMENT: phases[phase].sso.cssApi.cssApiEnvironment,
        // Log Level
        LOG_LEVEL: phases[phase].logLevel,
        LOG_LEVEL_FILE: phases[phase].logLevelFile,
        LOG_FILE_DIR: phases[phase].logFileDir,
        LOG_FILE_NAME: phases[phase].logFileName,
        LOG_FILE_DATE_PATTERN: phases[phase].logFileDatePattern,
        LOG_FILE_MAX_SIZE: phases[phase].logFileMaxSize,
        LOG_FILE_MAX_FILES: phases[phase].logFileMaxFiles,
        // Api Validation
        API_RESPONSE_VALIDATION_ENABLED: phases[phase].apiResponseValidationEnabled,
        DATABASE_RESPONSE_VALIDATION_ENABLED: phases[phase].databaseResponseValidationEnabled,
        // Feature Flags
        FEATURE_FLAGS: phases[phase].featureFlags,
        // Openshift Resources
        CPU_REQUEST: phases[phase].cpuRequest,
        CPU_LIMIT: phases[phase].cpuLimit,
        MEMORY_REQUEST: phases[phase].memoryRequest,
        MEMORY_LIMIT: phases[phase].memoryLimit,
        REPLICAS: phases[phase].replicas,
        REPLICAS_MAX: phases[phase].replicasMax
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);

  await oc.applyAndDeploy(objects, phases[phase].instance);
};

module.exports = { apiDeploy };
