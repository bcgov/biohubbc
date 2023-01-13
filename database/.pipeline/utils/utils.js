'use strict';

/**
 * Make an `oc get` command to fetch a resource by name.
 *
 * @param {string} resourceName
 * @param {OpenShiftClientX} oc OpenShift client (see `getOCClient`)
 * @return {*}
 * @throws an Error if the oc command fails
 */
const getResourceByName = (resourceName, oc) => {
  console.log(`1 - getResourceByName - Fetching resource: ${resourceName}`);
  const matches = oc.get(resourceName); // oc --namespace=a0ec71-dev get pod/biohub-platform-db-setup-dev-108 --output=json

  if (!matches || !matches.length) {
    return null;
  }

  return matches[0];
};

/**
 * Ger a resource by a manually defined selector (ie: oc get <type> --selector=<selector> --output=json)
 *
 * Example selector: `name=<some name>`
 *
 * @param {string} selector
 * @param {*} settings
 * @return {*}
 */
const getResourceByRaw = (selector, type, settings, oc) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const result = oc.raw('get', [type], {
    selector: selector,
    output: 'json',
    namespace: phases[phase].namespace
  });

  if (!result.stdout || !result.stdout.trim()) {
    return null;
  }

  const matches = oc.unwrapOpenShiftList(JSON.parse(result.stdout.trim()));

  if (!matches || !matches.length) {
    return null;
  }

  return matches[0];
};

/**
 * Make an `oc delete` command to delete a resource by name.
 *
 * @param {*} resourceName
 * @param {*} oc OpenShift client (see `getOCClient`)
 * @return {*}
 */
const deleteResourceByName = (resourceName, oc) => {
  console.log(`1 - deleteResourceByName - Deleting resource: ${resourceName}`);
  return oc.delete([resourceName], { 'ignore-not-found': 'true', wait: 'true' });
};

/**
 * Check if a resource is running.
 *
 * @param {object} resource a resource (json object)
 * @return {boolean} `true` if the resource is running, `false` if the resource is not found or not yet running.
 * @throws an Error if the resource has terminated successfully (complete) or with an error (failed).
 */
const isResourceRunning = (resource) => {
  const status = resource.status || { conditions: [], containerStatuses: [] };

  if (!status.conditions) {
    console.log(`1 - isResourceRunning - Resource 'status.conditions' is null or undefined`);
    return false;
  }

  if (status.conditions && !status.conditions.length) {
    console.log(`2 - isResourceRunning - Resource 'status.conditions' is empty`);
    return false;
  }

  if (!status.containerStatuses) {
    console.log(`3 - isResourceRunning - Resource 'status.containerStatuses' is null or undefined`);
    return false;
  }

  if (!status.containerStatuses.length) {
    console.log(`4 - isResourceRunning - Resource 'status.containerStatuses' is empty`);
    return false;
  }

  const containerStatus = status.containerStatuses[0] || {};

  if (!containerStatus.state) {
    console.log(`5 - isResourceRunning - Resource 'status.containerStatus[0].state' is null or undefined`);
    return false;
  }

  const state = containerStatus.state || {};

  if (state.terminated) {
    if (state.terminated.reason.toLowerCase() === 'completed') {
      console.log(`8 - isResourceRunning - Resource completed successfully`);
      throw new Error(`7 - isResourceRunning - Resource terminated without error`);
    } else {
      console.log(`9 - isResourceRunning - Resource terminated with error`);
      console.log(`9 - isResourceRunning - Error: resource status = ${JSON.stringify(resource.status, null, 2)}`);
      throw new Error(`9 - isResourceRunning - Resource terminated with error`);
    }
  }

  if (state.running) {
    console.log(`6 - isResourceRunning - Resource is running`);
    return true; // Happy path
  }

  console.log(`7 - isResourceRunning - Resource is pending`);
  return false;
};

/**
 * Check if a resource terminated successfully (complete) or terminated with an error (failed).
 *
 * @param {object} resource a resource (json object)
 * @return {boolean} `true` if the resource terminated successfully (complete), `false` if the resource has not yet
 * terminated.
 * @throws an Error if the resource has terminated with an error (failed).
 */
const isResourceComplete = (resource) => {
  const status = resource.status || { conditions: [], containerStatuses: [] };

  if (!status.conditions) {
    console.log(`1 - isResourceComplete - Resource 'status.conditions' is null or undefined`);
    return false;
  }

  if (status.conditions && !status.conditions.length) {
    console.log(`2 - isResourceComplete - Resource 'status.conditions' is empty`);
    return false;
  }

  if (!status.containerStatuses) {
    console.log(`3 - isResourceComplete - Resource 'status.containerStatuses' is null or undefined`);
    return false;
  }

  if (!status.containerStatuses.length) {
    console.log(`4 - isResourceComplete - Resource 'status.containerStatuses' is empty`);
    return false;
  }

  const containerStatus = status.containerStatuses[0] || {};

  if (!containerStatus.state) {
    console.log(`5 - isResourceComplete - Resource 'status.containerStatus[0].state' is null or undefined`);
    return false;
  }

  const state = containerStatus.state || {};

  if (state.terminated) {
    if (state.terminated.reason.toLowerCase() === 'completed') {
      console.log(`7 - isResourceComplete - Resource completed successfully`);
      return true; // Happy path
    } else {
      console.log(`8 - isResourceComplete - Resource terminated with error`);
      console.log(`8 - isResourceComplete - Error: resource status = ${JSON.stringify(resource.status, null, 2)}`);
      throw new Error(`8 - isResourceComplete - Resource terminated with error`);
    }
  }

  console.log(`6 - isResourceComplete - Resource is pending`);
  return false;
};

/**
 * Async/Await compatible version of `setTimeout`
 *
 * @param {*} timeout number of milliseconds to timeout for before resolving.
 * @return {*}
 */
const sleep = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
};

/**
 * Check that a given resource exists, and has met some condition.
 *
 * @param {() => object} getResourceFunction function that returns a resource
 * @param {(object) => boolean} resourceConditionFunction function that returns a boolean indicating if a desired resource condition has
 * been met
 * @param {number} numberOfRetries How many times to check for the resource (defaults to 20)
 * @param {number} timeoutBetweenRetries How many seconds to wait between each check (defaults to 5)
 * @param {number} initialDelay How many seconds to wait before performing the first check (defaults to 0)
 * @throws an Error if the condition is not met within the wait time specified.
 */
const waitForResourceToMeetCondition = async (
  getResourceFunction,
  resourceConditionFunction,
  numberOfRetries,
  timeoutBetweenRetries,
  initialDelay
) => {
  const timeout = (timeoutBetweenRetries || 5) * 1000;
  let count = numberOfRetries || 20;
  const delay = (initialDelay || 0) * 1000;

  const retry = async () => {
    if (count > 0) {
      count = count - 1;
      console.log(`4 - waitForResourceToMeetCondition - Waiting for resource: retry count = ${count}`);
      await sleep(timeout);
      return check();
    } else {
      throw new Error(`5 - waitForResourceToMeetCondition - Error: waiting for resource timed out`);
    }
  };

  const check = async () => {
    console.log(`1 - waitForResourceToMeetCondition - Waiting for resource begin`);

    let resource;

    try {
      resource = getResourceFunction();
    } catch {
      console.log(`2 - waitForResourceToMeetCondition - Resource was not found`);
      return retry();
    }

    if (!resource) {
      console.log(`3 - waitForResourceToMeetCondition - Resource was not found`);
      return retry();
    }

    try {
      const isConditionMet = resourceConditionFunction(resource);

      if (!isConditionMet) {
        return retry();
      }
    } catch {
      console.error(`6 - waitForResourceToMeetCondition - Error: waiting for resource failed`);
      throw new Error(`6 - waitForResourceToMeetCondition - Error: waiting for resource failed`);
    }
  };

  await sleep(delay);

  return check();
};

/**
 * Check that a given resource exists, and delete it when found.
 *
 * @param {string} resourceName the name of the resource
 * @param {number} numberOfRetries How many times to check for the resource (defaults to 20)
 * @param {number} timeoutBetweenRetries How many seconds to wait between each check (defaults to 5)
 * @param {number} initialDelay How many seconds to wait before performing the first check (defaults to 0)
 * @param {OpenShiftClientX} oc OpenShift client (see `getOCClient`)
 * @throws an Error if the resource is not found within the wait time specified.
 */
const checkAndClean = async (resourceName, numberOfRetries, timeoutBetweenRetries, initialDelay, oc) => {
  const timeout = (timeoutBetweenRetries || 5) * 1000;
  let count = numberOfRetries || 20;
  const delay = (initialDelay || 0) * 1000;

  const retry = async () => {
    if (count > 0) {
      count = count - 1;
      console.log(`5 - checkAndClean - Waiting for resource: retry count = ${count}`);
      await sleep(timeout);
      return check();
    } else {
      throw new Error(`6 - checkAndClean - Error: waiting for resource timed out`);
    }
  };

  const check = async () => {
    console.log(`1 - checkAndClean - Waiting for resource begin`);

    try {
      let resource;

      try {
        resource = getResourceByName(resourceName, oc);
      } catch {
        console.log(`2 - checkAndClean - Resource was not found`);
        return retry();
      }

      if (!resource) {
        console.log(`3 - checkAndClean - Resource was not found`);
        return retry();
      }

      console.log(`4 - checkAndClean - Deleting resource: ${resourceName}`);
      deleteResourceByName(resourceName, oc);
    } catch {
      console.error(`7 - checkAndClean - Error: waiting for resource failed`);
      throw new Error(`7 - checkAndClean - Error: waiting for resource failed`);
    }
  };

  await sleep(delay);

  return check();
};

module.exports = {
  checkAndClean,
  deleteResourceByName,
  getResourceByName,
  getResourceByRaw,
  isResourceComplete,
  isResourceRunning,
  waitForResourceToMeetCondition
};
