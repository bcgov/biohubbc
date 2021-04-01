/**
 * Iterates over an object, which may have nested objects, and copies all keys to a new flat object. Additionally, it
 * removes any keys that match the provided regex.
 *
 * @param {*} obj Object to traverse and cleanup/flatten.
 * @param {RegExp} regex [regex=\/^_.*\/] Regex that indicates which keys to remove, if they match. Defaults to a regex
 * that matches any string that starts with an underscore.
 * @param {object} [flatObj={}] The object to add the valid keys to. Will not contain any keys that match the regex, nor
 * any nested objects.
 * @return {*}
 */
export const stripOutKeysAndFlatten = function (obj: any, regex: RegExp = /^_.*/, newObj: object = {}) {
  if (!obj) {
    return obj;
  }

  Object.keys(obj).forEach((key) => {
    if (isObject(obj[key])) {
      // Traverse into the nested object
      stripOutKeysAndFlatten(obj[key], regex, newObj);
    } else {
      const matches = key.match(regex);
      if (matches && matches.length) {
        // Dont add key that match the regex
        return newObj;
      }

      // Add key
      newObj[key] = obj[key];

      return newObj;
    }
  });

  return newObj;
};

/**
 * Checks if the value provided is an object.
 *
 * @param {*} obj
 * @returns {boolean} True if the value is an object, false otherwise.
 */
export const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && item.constructor.name === 'Object';
};
