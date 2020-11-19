'use strict';
const { OpenShiftClientX } = require('pipeline-cli');

module.exports = (resourceName, settings, countArg, timeoutArg) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const timeout = timeoutArg || 20000;
  let count = countArg || 20;

  const check = () => {
    try {
      console.log(`Getting resource ${resourceName}`);
      const list = oc.get(resourceName) || [];
      // console.log(`${list.length}:${JSON.stringify(list, null, 2)}`)
      if (list.length === 0) {
        console.log(`Unable to fetch Database resource: ${resourceName}`);
        throw new Error(`Unable to fetch Database resource: ${resourceName}`);
      }
      // console.log(JSON.stringify(data, null, 2));
      // Get Status
      console.log(`Getting POD Status: ${resourceName}`);
      const data = list[0];
      const status = data.status || { conditions: [], containerStatuses: [] };
      if (status.conditions && status.conditions.length === 0) {
        console.log(`Unable to fetch Database resource: ${resourceName} status`);
        console.log(`${JSON.stringify(data)}`);

        // Retry if count is not zero
        if (count > 0) {
          console.log(`Retry until count is 0: ${resourceName}`);
          count = count - 1;
          setTimeout(check, timeout);
        } else {
          throw new Error(`Unable to fetch Database resource: ${resourceName} status`);
        }
      }

      if (!status.containerStatuses) {
        console.log(`Unable to fetch Database resource: ${resourceName} container state (not defined)`);
        console.log(`${JSON.stringify(data)}`);

        // Retry if count is not zero
        if (count > 0) {
          console.log(`Retry until count is 0: ${resourceName}`);
          count = count - 1;
          setTimeout(check, timeout);
          return;
        } else {
          throw new Error(`Unable to fetch Database resource: ${resourceName} status`);
        }
      }

      // Checking Container state
      if (status.containerStatuses && status.containerStatuses.length === 0) {
        console.log(`Unable to fetch Database resource: ${resourceName} container state`);
        console.log(`${JSON.stringify(data)}`);

        // Retry if count is not zero
        if (count > 0) {
          console.log(`Retry until count is 0: ${resourceName}`);
          count = count - 1;
          setTimeout(check, timeout);
          return;
        } else {
          throw new Error(`Unable to fetch Database resource: ${resourceName} status`);
        }
      }

      console.log(`Checking Container State: ${resourceName}`);
      const containerStatus = status.containerStatuses[0] || {};
      if (!containerStatus.state) {
        console.log(`Unable to fetch Database resource: ${resourceName} container state`);
        console.log(`${JSON.stringify(data)}`);
        throw new Error(`Unable to fetch Database resource: ${resourceName} container state`);
      }
      const state = containerStatus.state || {};
      if (state.terminated) {
        if (state.terminated.reason.toLowerCase() === 'completed') {
          console.log(`${resourceName}: Finished [Successfully]`);
          // console.log(`${resourceName}: Deleting`)
          // Remove Pod
          // oc.delete([resourceName], {'ignore-not-found':'true', 'wait':'true'})
          return;
        } else {
          console.log(`Unable to fetch Database resource: ${resourceName} terminated with error`);
          console.log(JSON.stringify(data.status, null, 2));
          throw new Error(`Unable to fetch Database resource: ${resourceName} terminated with error`);
        }
      } else {
        if (count > 0) {
          console.log(`Waiting for resource: ${resourceName} to finish ... ${count}`);
          count = count - 1;
          setTimeout(check, timeout);
        } else {
          console.log(`Wait time exceed for resource: ${resourceName}`);
          console.log(`${JSON.stringify(data)}`);
          throw new Error(`Wait time exceed for resource: ${resourceName}`);
        }
      }
    } catch (excp) {
      console.log(`Pod (${resourceName}) Wait: Exception  ${excp}`);
      throw excp;
    }
  };

  setTimeout(check, timeout + 10000);
};
