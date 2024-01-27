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

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../templates'));

  const name = `${phases[env][phase].name}-setup`;

  const objects = [];

  console.log('4==========================================');
  console.log({
    NAME: name,
    SUFFIX: phases[env][phase].suffix,
    VERSION: phases[env][phase].tag,
    SOURCE_CONTEXT_DIR: phases[env][phase].sourceContextDir,
    DB_SETUP_DOCKERFILE_PATH: phases[env][phase].dbSetupDockerfilePath,
    SOURCE_REPOSITORY_URL: oc.git.http_url,
    SOURCE_REPOSITORY_REF: phases[env][phase].branch,
    CPU_REQUEST: phases[env][phase].cpuRequest,
    CPU_LIMIT: phases[env][phase].cpuLimit,
    MEMORY_REQUEST: phases[env][phase].memoryRequest,
    MEMORY_LIMIT: phases[env][phase].memoryLimit
  });
  console.log('5==========================================');

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.bc.yaml`, {
      param: {
        NAME: name,
        SUFFIX: phases[env][phase].suffix,
        VERSION: phases[env][phase].tag,
        // SOURCE_CONTEXT_DIR: phases[env][phase].sourceContextDir,
        DB_SETUP_DOCKERFILE_PATH: phases[env][phase].dbSetupDockerfilePath,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[env][phase].branch,
        CPU_REQUEST: phases[env][phase].cpuRequest,
        CPU_LIMIT: phases[env][phase].cpuLimit,
        MEMORY_REQUEST: phases[env][phase].memoryRequest,
        MEMORY_LIMIT: phases[env][phase].memoryLimit
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, env, phases[env][phase].changeId, phases[env][phase].instance);
  oc.applyAndBuild(objects);
};

module.exports = { dbSetupBuild };
