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

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.dc.yaml`, {
      param: {
        NAME: phases[env][phase].name,
        SUFFIX: phases[env][phase].suffix,
        VERSION: phases[env][phase].tag,
        HOST: phases[env][phase].host,
        APP_HOST: phases[env][phase].appHost,
        CHANGE_ID: phases[env][phase].changeId,
        // Node
        NODE_ENV: phases[env][phase].nodeEnv,
        NODE_OPTIONS: phases[env][phase].nodeOptions,
        // BioHub Platform (aka: Backbone)
        BACKBONE_API_HOST: phases[env][phase].backboneApiHost,
        BACKBONE_INTAKE_PATH: phases[env][phase].backboneIntakePath,
        BACKBONE_ARTIFACT_INTAKE_PATH: phases[env][phase].backboneArtifactIntakePath,
        BACKBONE_INTAKE_ENABLED: phases[env][phase].backboneIntakeEnabled,
        // BCTW / Critterbase
        BCTW_API_HOST: phases[env][phase].bctwApiHost,
        CB_API_HOST: phases[env][phase].critterbaseApiHost,
        // Elastic Search
        ELASTICSEARCH_URL: phases[env][phase].elasticsearchURL,
        ELASTICSEARCH_TAXONOMY_INDEX: phases[env][phase].elasticsearchTaxonomyIndex,
        // S3
        S3_KEY_PREFIX: phases[env][phase].s3KeyPrefix,
        // Database
        TZ: phases[env][phase].tz,
        DB_SERVICE_NAME: `${phases[env][phase].dbName}-postgresql${phases[env][phase].suffix}`,
        // Keycloak
        KEYCLOAK_HOST: phases[env][phase].sso.host,
        KEYCLOAK_REALM: phases[env][phase].sso.realm,
        KEYCLOAK_CLIENT_ID: phases[env][phase].sso.clientId,
        // Keycloak secret
        KEYCLOAK_SECRET: phases[env][phase].sso.keycloakSecret,
        // Keycloak Service Client
        KEYCLOAK_ADMIN_USERNAME: phases[env][phase].sso.serviceClient.serviceClientName,
        KEYCLOAK_SECRET_ADMIN_PASSWORD_KEY: phases[env][phase].sso.serviceClient.keycloakSecretServiceClientPasswordKey,
        // Keycloak CSS API
        KEYCLOAK_API_TOKEN_URL: phases[env][phase].sso.cssApi.cssApiTokenUrl,
        KEYCLOAK_API_CLIENT_ID: phases[env][phase].sso.cssApi.cssApiClientId,
        KEYCLOAK_API_CLIENT_SECRET_KEY: phases[env][phase].sso.cssApi.keycloakSecretCssApiSecretKey,
        KEYCLOAK_API_HOST: phases[env][phase].sso.cssApi.cssApiHost,
        KEYCLOAK_API_ENVIRONMENT: phases[env][phase].sso.cssApi.cssApiEnvironment,
        // Log Level
        LOG_LEVEL: phases[env][phase].logLevel || 'info',
        // Openshift Resources
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit,
        REPLICAS: phases[env][phase].replicas,
        REPLICAS_MAX: phases[env][phase].replicasMax
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[env][phase].name, env, `${changeId}`, phases[env][phase].instance);
  oc.importImageStreams(objects, phases[env][phase].tag, phases.build.namespace, phases.build.tag);

  await oc.applyAndDeploy(objects, phases[env][phase].instance);
};

module.exports = { apiDeploy };
