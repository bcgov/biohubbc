interface IDeviceKey {
  /**
   * Device vendor / manufacturer.
   *
   * @example 'lotek'
   * @type {string}
   */
  vendor: string;
  /**
   * Device serial identifier.
   *
   * @example 'a123' || 12345
   * @type {string | number}
   */
  serial: string | number;
}

/**
 * Generate a device key from a telemetry vendor and device serial.
 *
 * Note: In the database this value is used as psuedo foreign key from `telemetry` to `device`.
 *
 * @example 'lotek:1234'
 *
 * @param {{vendor: string; serial: string}} params - Vendor and serial
 * @returns {string}
 */
export const getTelemetryDeviceKey = ({ vendor, serial }: IDeviceKey): string => {
  return `${vendor.trim().toLowerCase()}:${String(serial).trim().toLowerCase()}`;
};

/**
 * Convert an object's keys to lowercase.
 *
 * @param {Record<string, any>} obj - Object to convert
 * @returns {Record<string, any>} - Object with lowercase keys
 */
export const keysToLowerCase = <T>(obj: Record<string, any>): T => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {} as T);
};
