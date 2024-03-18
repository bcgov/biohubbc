'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

const appDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.dc.yaml`, {
      param: {
        NAME: phases[env][phase].NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        VERSION: phases[env][phase].TAG,
        APP_HOST: phases[env][phase].APP_HOST,
        CHANGE_ID: phases[env]['build'].CHANGE_ID,
        REACT_APP_API_HOST: phases[env][phase].API_HOST,
        REACT_APP_SITEMINDER_LOGOUT_URL: phases[env][phase].SITEMINDER_LOGOUT_URL,
        // File Upload Settings
        REACT_APP_MAX_UPLOAD_NUM_FILES: phases[env][phase].MAX_UPLOAD_NUM_FILES,
        REACT_APP_MAX_UPLOAD_FILE_SIZE: phases[env][phase].MAX_UPLOAD_FILE_SIZE,
        // Node
        NODE_ENV: phases[env][phase].NODE_ENV,
        REACT_APP_NODE_ENV: phases[env][phase].NODE_ENV,
        // Keycloak
        REACT_APP_KEYCLOAK_HOST: phases[env][phase].SSO.KEYCLOAK_HOST,
        REACT_APP_KEYCLOAK_REALM: phases[env][phase].SSO.KEYCLOAK_REALM,
        REACT_APP_KEYCLOAK_CLIENT_ID: phases[env][phase].SSO.KEYCLOAK_CLIENT_ID,
        // BioHub Plastform (aka: Backbone)
        REACT_APP_BACKBONE_PUBLIC_API_HOST: phases[env][phase].BACKBONE_PUBLIC_API_HOST,
        REACT_APP_BIOHUB_TAXON_PATH: phases[env][phase].BIOHUB_TAXON_PATH,
        REACT_APP_BIOHUB_TAXON_TSN_PATH: phases[env][phase].BIOHUB_TAXON_TSN_PATH,
        REACT_APP_BIOHUB_FEATURE_FLAG: phases[env][phase].REACT_APP_BIOHUB_FEATURE_FLAG,
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

module.exports = { appDeploy };
