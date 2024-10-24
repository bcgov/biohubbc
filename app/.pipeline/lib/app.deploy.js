'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

const appDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = settings.options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const changeId = phases[phase].changeId;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.dc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST: phases[phase].host,
        CHANGE_ID: phases.build.changeId || changeId,
        REACT_APP_API_HOST: phases[phase].apiHost,
        REACT_APP_SITEMINDER_LOGOUT_URL: phases[phase].siteminderLogoutURL,
        // File Upload Settings
        REACT_APP_MAX_UPLOAD_NUM_FILES: phases[phase].maxUploadNumFiles,
        REACT_APP_MAX_UPLOAD_FILE_SIZE: phases[phase].maxUploadFileSize,
        // Node
        NODE_ENV: phases[phase].nodeEnv,
        REACT_APP_NODE_ENV: phases[phase].nodeEnv,
        // Keycloak
        REACT_APP_KEYCLOAK_HOST: phases[phase].sso.host,
        REACT_APP_KEYCLOAK_REALM: phases[phase].sso.realm,
        REACT_APP_KEYCLOAK_CLIENT_ID: phases[phase].sso.clientId,
        // Feature Flags
        REACT_APP_FEATURE_FLAGS: phases[phase].featureFlags,
        // Openshift Resources
        CPU_REQUEST: phases[phase].cpuRequest,
        CPU_LIMIT: phases[phase].cpuLimit,
        MEMORY_REQUEST: phases[phase].memoryRequest,
        MEMORY_LIMIT: phases[phase].memoryLimit,
        REPLICAS: phases[phase].replicas,
        REPLICAS_MAX: phases[phase].replicasMax,
        REACT_APP_BACKBONE_PUBLIC_API_HOST: phases[phase].backbonePublicApiHost,
        REACT_APP_BIOHUB_TAXON_PATH: phases[phase].biohubTaxonPath,
        REACT_APP_BIOHUB_TAXON_TSN_PATH: phases[phase].biohubTaxonTsnPath
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);

  await oc.applyAndDeploy(objects, phases[phase].instance);
};

module.exports = { appDeploy };
