/**
 * @description Check and delete existing resource
 */
module.exports = (resourceName, oc) => {
  try {
    const list = oc.get(resourceName) || [];
    if (list.length === 0) {
      console.log(`checkAndClean: No resource available with resource name: ${resourceName}`);
    } else {
      console.log(`checkAndClean: Cleaning resource => ${resourceName}`);
      oc.delete([resourceName], { 'ignore-not-found': 'true', wait: 'true' });
    }
  } catch (excp) {
    console.log(`Resource ${resourceName} not available [${excp}]`);
  }
};
// ---------------------------------------
