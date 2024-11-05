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

export const formatVectronicAPITelemetry = (telemetry: Record<string, number>) => {
  return {
    idposition: telemetry.idPosition,
    idcollar: telemetry.idCollar,
    acquisitiontime: telemetry.acquisitionTime,
    scst: telemetry.scts,
    origincode: telemetry.originCode,
    ecefx: telemetry.ecefX,
    ecefy: telemetry.ecefY,
    ecefz: telemetry.ecefZ,
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    height: telemetry.height,
    dop: telemetry.dop,
    idfixtype: telemetry.idFixType,
    positionerror: telemetry.positionError,
    satcount: telemetry.satCount,
    ch01satid: telemetry.ch01SatId,
    ch01satcnr: telemetry.ch01SatCnr,
    ch02satid: telemetry.ch02SatId,
    ch02satcnr: telemetry.ch02SatCnr,
    ch03satid: telemetry.ch03SatId,
    ch03satcnr: telemetry.ch03SatCnr,
    ch04satid: telemetry.ch04SatId,
    ch04satcnr: telemetry.ch04SatCnr,
    ch05satid: telemetry.ch05SatId,
    ch05satcnr: telemetry.ch05SatCnr,
    ch06satid: telemetry.ch06SatId,
    ch06satcnr: telemetry.ch06SatCnr,
    ch07satid: telemetry.ch07SatId,
    ch07satcnr: telemetry.ch07SatCnr,
    ch08satid: telemetry.ch08SatId,
    ch08satcnr: telemetry.ch08SatCnr,
    ch09satid: telemetry.ch09SatId,
    ch09satcnr: telemetry.ch09SatCnr,
    ch10satid: telemetry.ch10SatId,
    ch10satcnr: telemetry.ch10SatCnr,
    ch11satid: telemetry.ch11SatId,
    ch11satcnr: telemetry.ch11SatCnr,
    ch12satid: telemetry.ch12SatId,
    ch12satcnr: telemetry.ch12SatCnr,
    idmortalitystatus: telemetry.idMortalityStatus,
    activity: telemetry.activity,
    mainvoltage: telemetry.mainVoltage,
    backupvoltage: telemetry.backupVoltage,
    temperature: telemetry.temperature,
    transformedx: telemetry.transformedX,
    transformedy: telemetry.transformedY
  };
};
