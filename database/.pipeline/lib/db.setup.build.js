'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Build the database setup (migrations, seeding, etc) image.
 *
 * @param {*} settings
 */
const dbSetupBuild = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].NAMESPACE }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const NAME = `${phases[env][phase].NAME}-setup`;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.bc.yaml`, {
      param: {
        NAME: NAME,
        SUFFIX: phases[env][phase].SUFFIX,
        VERSION: phases[env][phase].TAG,
        SOURCE_CONTEXT_DIR: phases[env][phase].SOURCE_CONTEXT_DIR,
        DB_SETUP_DOCKERFILE_PATH: phases[env][phase].DB_SETUP_DOCKERFILE_PATH,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[env][phase].BRANCH,
        CPU_REQUEST: phases[env][phase].CPU_REQUEST,
        CPU_LIMIT: phases[env][phase].CPU_LIMIT,
        MEMORY_REQUEST: phases[env][phase].MEMORY_REQUEST,
        MEMORY_LIMIT: phases[env][phase].MEMORY_LIMIT
      }
    })
  );

  oc.applyRecommendedLabels(objects, NAME, env, phases[env][phase].CHANGE_ID, phases[env][phase].INSTANCE);
  oc.applyAndBuild(objects);
};

module.exports = { dbSetupBuild };
