export interface TelemetryQueueResult {
  /**
   * The serial number of the telemetry device.
   * @type {number}
   */
  serial: number;
  new: number;
  created: number;
  /**
   * The error that occurred during processing.
   * @type {Error | undefined}
   */
  error?: Error;
}
