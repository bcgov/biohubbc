'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Build the database image.
 *
 * @param {*} settings
 */
const dbBuild = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.bc.yaml`, {
      param: {
        NAME: phases[env][phase].NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        TAG_NAME: phases[env][phase].TAG
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
  oc.applyAndBuild(objects);
};

module.exports = { dbBuild };
