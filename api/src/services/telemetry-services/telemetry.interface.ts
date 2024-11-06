export interface TelemetryQueueResult {
  /**
   * The serial number of the telemetry device.
   * @type {number}
   */
  serial: number;
  /**
   * The number of telemetry records processed.
   * @type {number}
   */
  telemetry: number;
  /**
   * The error that occurred during processing.
   * @type {Error | undefined}
   */
  error?: Error;
}
