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
