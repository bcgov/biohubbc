'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

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
        REACT_APP_N8N_HOST: phases[phase].n8nHost,
        REACT_APP_SITEMINDER_LOGOUT_URL: phases[phase].siteminderLogoutURL,
        REACT_APP_MAX_UPLOAD_NUM_FILES: phases[phase].maxUploadNumFiles,
        REACT_APP_MAX_UPLOAD_FILE_SIZE: phases[phase].maxUploadFileSize,
        NODE_ENV: phases[phase].env || 'dev',
        REACT_APP_NODE_ENV: phases[phase].env || 'dev',
        SSO_URL: phases[phase].sso.url,
        SSO_CLIENT_ID: phases[phase].sso.clientId,
        SSO_REALM: phases[phase].sso.realm,
        REPLICAS: phases[phase].replicas || 1,
        REPLICA_MAX: phases[phase].maxReplicas || 1
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);

  oc.applyAndDeploy(objects, phases[phase].instance);
};
