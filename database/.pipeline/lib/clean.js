'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const { checkAndClean } = require('../utils/utils');

/**
 * Run OC commands to clean all build and deployment artifacts (pods, imagestreams, builds/deployment configs, etc).
 *
 * @param {*} settings
 */
const clean = async (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const env = settings.options.env;
  const phase = settings.options.phase;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  if (!Object.prototype.hasOwnProperty.call(phases, env)) {
    // <env> is not a field of phases
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(phases[env], phase)) {
    // <phase> is not a field of phases[env]
    return;
  }

  // Get build configs
  let buildConfigs = oc.get('bc', {
    selector: `app=${phases[env][phase].instance},env-id=${phases[env][phase].changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    namespace: phases[env][phase].namespace
  });

  // Clean build configs
  buildConfigs.forEach((buildConfig) => {
    if (buildConfig.spec.output.to.kind == 'ImageStreamTag') {
      oc.delete([`ImageStreamTag/${buildConfig.spec.output.to.name}`], {
        'ignore-not-found': 'true',
        wait: 'true',
        namespace: phases[env][phase].namespace
      });
    }
  });

  // get deployment configs
  let deploymentConfigs = oc.get('dc', {
    selector: `app=${phases[env][phase].instance},env-id=${phases[env][phase].changeId},env-name=${env},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    namespace: phases[env][phase].namespace
  });

  // Clean deployment configs
  deploymentConfigs.forEach((deploymentConfig) => {
    deploymentConfig.spec.triggers.forEach((trigger) => {
      if (trigger.type == 'ImageChange' && trigger.imageChangeParams.from.kind == 'ImageStreamTag') {
        oc.delete([`ImageStreamTag/${trigger.imageChangeParams.from.name}`], {
          'ignore-not-found': 'true',
          wait: 'true',
          namespace: phases[env][phase].namespace
        });
      }
    });
  });

  // Cleaning other pods
  if (phase !== 'build') {
    const newOC = new OpenShiftClientX(Object.assign({ namespace: phases[env][phase].namespace }, options));
    const setupPod = `${phases[env][phase].name}-setup${phases[env][phase].suffix}`;
    await checkAndClean(`pod/${setupPod}`, 10, 5, 0, newOC).catch(() => {
      // Ignore errors, nothing to clean
    });
  }

  oc.raw('delete', ['all'], {
    selector: `app=${phases[env][phase].instance},env-id=${phases[env][phase].changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    wait: 'true',
    namespace: phases[env][phase].namespace
  });

  oc.raw('delete', ['all,pvc,secrets,Secrets,secret,configmap,endpoints,Endpoints'], {
    selector: `app=${phases[env][phase].instance},env-id=${phases[env][phase].changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    wait: 'true',
    namespace: phases[env][phase].namespace
  });
};

module.exports = { clean };
