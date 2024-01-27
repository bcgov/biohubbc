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

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.bc.yaml`, {
      param: {
        NAME: phases[env][phase].name,
        SUFFIX: phases[env][phase].suffix,
        TAG_NAME: phases[env][phase].tag
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[env][phase].name, env, phases[env][phase].changeId, phases[env][phase].instance);
  oc.applyAndBuild(objects);
};

module.exports = { dbBuild };
