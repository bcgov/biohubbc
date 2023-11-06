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
  const phase = options.phase;

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
        NODE_ENV: phases[phase].env,
        // BioHub Platform (aka: Backbone)
        BACKBONE_API_HOST: phases[phase].backboneApiHost,
        BACKBONE_INTAKE_PATH: phases[phase].backboneIntakePath,
        BACKBONE_ARTIFACT_INTAKE_PATH: phases[phase].backboneArtifactIntakePath,
        BACKBONE_INTAKE_ENABLED: phases[phase].backboneIntakeEnabled,
        // BCTW / Critterbase
        BCTW_API_HOST: phases[phase].bctwApiHost,
        CB_API_HOST: phases[phase].critterbaseApiHost,
        // Elastic Search
        ELASTICSEARCH_URL: phases[phase].elasticsearchURL,
        ELASTICSEARCH_TAXONOMY_INDEX: phases[phase].elasticsearchTaxonomyIndex,
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
        LOG_LEVEL: phases[phase].logLevel || 'info',
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
