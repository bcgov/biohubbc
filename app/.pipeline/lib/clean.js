'use strict';

const { OpenShiftClientX } = require('pipeline-cli');

/**
 * Run OC commands to clean all build and deployment artifacts (pods, imagestreams, builds/deployment configs, etc).
 *
 * @param {*} settings
 */
const clean = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const target_phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  for (let phaseKey in phases) {
    if (!Object.prototype.hasOwnProperty.call(phases, phaseKey)) {
      continue;
    }

    if (phaseKey !== target_phase) {
      continue;
    }

    const phaseObj = phases[phaseKey];

    // Get build configs
    let buildConfigs = oc.get('bc', {
      selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
      namespace: phaseObj.namespace
    });

    // Clean build configs
    buildConfigs.forEach((buildConfig) => {
      if (buildConfig.spec.output.to.kind == 'ImageStreamTag') {
        oc.delete([`ImageStreamTag/${buildConfig.spec.output.to.name}`], {
          'ignore-not-found': 'true',
          wait: 'true',
          namespace: phaseObj.namespace
        });
      }
    });

    // get deployment configs
    let deploymentConfigs = oc.get('dc', {
      selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},env-name=${phaseKey},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
      namespace: phaseObj.namespace
    });

    // Clean deployment configs
    deploymentConfigs.forEach((deploymentConfig) => {
      deploymentConfig.spec.triggers.forEach((trigger) => {
        if (trigger.type == 'ImageChange' && trigger.imageChangeParams.from.kind == 'ImageStreamTag') {
          oc.delete([`ImageStreamTag/${trigger.imageChangeParams.from.name}`], {
            'ignore-not-found': 'true',
            wait: 'true',
            namespace: phaseObj.namespace
          });
        }
      });
    });

    oc.raw('delete', ['all'], {
      selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
      wait: 'true',
      namespace: phaseObj.namespace
    });

    oc.raw('delete', ['pvc,Secret,secrets,secret,configmap,endpoints,Endpoints'], {
      selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
      wait: 'true',
      namespace: phaseObj.namespace
    });
  }
};

module.exports = { clean };
