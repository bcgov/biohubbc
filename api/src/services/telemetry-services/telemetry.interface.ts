export interface ProcessedTelemetry {
  /**
   * The serial number of the telemetry device.
   * @type {number}
   */
  serial: number;
  /**
   * The number of new telemetry records found.
   * @type {number}
   */
  new: number;
  /**
   * The number of telemetry records created.
   * @type {number}
   */
  created: number;
}
