export interface TelemetryProcessingOptions {
  /**
   * The number of telemetry records to create in a single batch.
   * @type {number}
   */
  batchSize: number;
  /**
   * The number of processes to run concurrently.
   * Note: This will include fetching telemetry data and creating telemetry records.
   * @type {number}
   */
  concurrently: number;
  /**
   * The start date for fetching telemetry data.
   * @type {string | undefined} - ISO 8601 date string
   */
  startDate?: string;
  /**
   * The end date for fetching telemetry data.
   * @type {string | undefined} - ISO 8601 date string
   */
  endDate?: string;
}

export interface TelemetryProcessingResult {
  /**
   * The difference between Lotek telemetry count and SIMS telemetry count.
   * @type {number}
   */
  new: number;
  /**
   * The number of telemetry records created in SIMS.
   * @type {number}
   */
  created: number;
}
