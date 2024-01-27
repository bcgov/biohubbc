'use strict';

const { OpenShiftClientX } = require('pipeline-cli');
const { checkAndClean } = require('../utils/utils');

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

  const phaseObj = phases[env][phase];

  // Get build configs
  let buildConfigs = oc.get('bc', {
    selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    namespace: phaseObj.namespace
  });

  // Clean build configs
  buildConfigs.forEach((bc) => {
    if (bc.spec.output.to.kind == 'ImageStreamTag') {
      oc.delete([`ImageStreamTag/${bc.spec.output.to.name}`], {
        'ignore-not-found': 'true',
        wait: 'true',
        namespace: phaseObj.namespace
      });
    }
  });

  // get deployment configs
  let deploymentConfigs = oc.get('dc', {
    selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},env-name=${env},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    namespace: phaseObj.namespace
  });

  // Clean deployment configs
  deploymentConfigs.forEach((dc) => {
    dc.spec.triggers.forEach((trigger) => {
      if (trigger.type == 'ImageChange' && trigger.imageChangeParams.from.kind == 'ImageStreamTag') {
        oc.delete([`ImageStreamTag/${trigger.imageChangeParams.from.name}`], {
          'ignore-not-found': 'true',
          wait: 'true',
          namespace: phaseObj.namespace
        });
      }
    });
  });

  // Cleaning other pods
  if (phase !== 'build') {
    const newOC = new OpenShiftClientX(Object.assign({ namespace: phaseObj.namespace }, options));
    const setupPod = `${phaseObj.name}-setup${phaseObj.suffix}`;
    await checkAndClean(`pod/${setupPod}`, 10, 5, 0, newOC).catch(() => {
      // Ignore errors, nothing to clean
    });
  }

  oc.raw('delete', ['all'], {
    selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    wait: 'true',
    namespace: phaseObj.namespace
  });

  oc.raw('delete', ['all,pvc,secrets,Secrets,secret,configmap,endpoints,Endpoints'], {
    selector: `app=${phaseObj.instance},env-id=${phaseObj.changeId},!shared,github-repo=${oc.git.repository},github-owner=${oc.git.owner}`,
    wait: 'true',
    namespace: phaseObj.namespace
  });
};

module.exports = { clean };
