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
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));
  const changeId = phases[phase].changeId;

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.dc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST: phases[phase].host,
        CHANGE_ID: phases.build.changeId || changeId,
        APP_HOST: phases[phase].appHost,
        NODE_ENV: phases[phase].env || 'dev',
        ELASTICSEARCH_URL: phases[phase].elasticsearchURL,
        ELASTICSEARCH_EML_INDEX: phases[phase].elasticsearchEmlIndex,
        S3_KEY_PREFIX: phases[phase].s3KeyPrefix,
        ELASTICSEARCH_URL: phases[phase].elasticsearchURL,
        KEYCLOAK_ADMIN_USERNAME: 'sims-svc',
        KEYCLOAK_SECRET: 'keycloak-admin-password',
        KEYCLOAK_SECRET_ADMIN_PASSWORD: 'keycloak_admin_password',
        DB_SERVICE_NAME: `${phases[phase].dbName}-postgresql${phases[phase].suffix}`,
        KEYCLOAK_HOST: phases[phase].sso.url,
        KEYCLOAK_CLIENT_ID: phases[phase].sso.clientId,
        KEYCLOAK_REALM: phases[phase].sso.realm,
        REPLICAS: phases[phase].replicas || 1,
        REPLICA_MAX: phases[phase].maxReplicas || 1,
        LOG_LEVEL: phases[phase].logLevel || 'info'
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);

  oc.applyAndDeploy(objects, phases[phase].instance);
};

module.exports = { apiDeploy };
