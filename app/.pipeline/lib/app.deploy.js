'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

const appDeploy = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.dc.yaml`, {
      param: {
        NAME: phases[env][phase].name,
        SUFFIX: phases[env][phase].suffix,
        VERSION: phases[env][phase].tag,
        HOST: phases[env][phase].host,
        CHANGE_ID: phases[env].build.changeId || phases[env][phase].changeId,
        REACT_APP_API_HOST: phases[env][phase].apiHost,
        REACT_APP_SITEMINDER_LOGOUT_URL: phases[env][phase].siteminderLogoutURL,
        // File Upload Settings
        REACT_APP_MAX_UPLOAD_NUM_FILES: phases[env][phase].maxUploadNumFiles,
        REACT_APP_MAX_UPLOAD_FILE_SIZE: phases[env][phase].maxUploadFileSize,
        // Node
        NODE_ENV: phases[env][phase].nodeEnv,
        REACT_APP_NODE_ENV: phases[env][phase].nodeEnv,
        // Keycloak
        REACT_APP_KEYCLOAK_HOST: phases[env][phase].sso.host,
        REACT_APP_KEYCLOAK_REALM: phases[env][phase].sso.realm,
        REACT_APP_KEYCLOAK_CLIENT_ID: phases[env][phase].sso.clientId,
        // BioHub Plastform (aka: Backbone)
        REACT_APP_BIOHUB_FEATURE_FLAG: phases[env][phase].biohubFeatureFlag,
        REACT_APP_BACKBONE_API_HOST: phases[env][phase].backboneApiHost,
        REACT_APP_BIOHUB_TAXON_PATH: phases[env][phase].biohubTaxonPath,
        // Openshift Resources
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit,
        REPLICAS: phases[env][phase].replicas,
        REPLICAS_MAX: phases[env][phase].replicasMax,
        REACT_APP_BIOHUB_FEATURE_FLAG: phases[env][phase].biohubFeatureFlag,
        REACT_APP_BACKBONE_PUBLIC_API_HOST: phases[env][phase].backbonePublicApiHost,
        REACT_APP_BIOHUB_TAXON_PATH: phases[env][phase].biohubTaxonPath,
        REACT_APP_BIOHUB_TAXON_TSN_PATH: phases[env][phase].biohubTaxonTsnPath
      }
    })
  );

  oc.applyRecommendedLabels(
    objects,
    phases[env][phase].name,
    env,
    phases[env][phase].changeId,
    phases[env][phase].instance
  );
  oc.importImageStreams(objects, phases[env][phase].tag, phases[env].build.namespace, phases[env].build.tag);

  await oc.applyAndDeploy(objects, phases[env][phase].instance);
};

module.exports = { appDeploy };
