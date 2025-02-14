import { parseArgs } from 'util';
import { z } from 'zod';
import { defaultPoolConfig, getAPIUserDBConnection, initDBPool } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryLotekService } from '../../services/telemetry-services/telemetry-lotek-service';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { TelemetryProcessingResult } from '../../services/telemetry-services/telemetry.interface';
import { getLogger } from '../../utils/logger';
import { QueueResult } from '../../utils/task-queue';

const defaultLog = getLogger('telemetry-cronjob');

/**
 * Telemetry Cronjob: Handles fetching Vectronic and Lotek telemetry and inserting it into the database.
 *
 * Information:
 *
 * How to run:
 *  - Default: `npm run telemetry-cronjob` // defaults to: concurrently = 100 and batchSize = 1000
 *  - CLI args: `npm run telemetry-cronjob -- --concurrently 100 --batchSize 1000 --startDate 2021-01-01 --endDate 2021-01-31`
 *
 * Telemetry device processing flow:
 *  1. Fetch the telemetry count from the vendor API.
 *  2. Fetch the telemetry count from the SIMS database.
 *  3. Compare and check for missing telemetry records.
 *  4. Fetch the telemetry data from the vendor API. See `Date ranges` section below.
 *  5. Insert the telemetry data into the SIMS database.
 *
 * Date ranges:
 *  If a date range is provided, the cronjob will fetch telemetry for that date range.
 *  If no date range is provided, the cronjob will fetch all telemetry data after the last record in the database.
 *    Lotek: We find the last record in the database and use the timestamp as the start date.
 *    Vectronic: We find the largest / max idposition (the Vectronic PK ID) and use the `gt-id` query parameter.
 *
 *
 * Web Services:
 *  - Lotek: https://webservice.lotek.com/API/Help
 *  - Vectronic: https://api.vectronic-wildlife.com/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#
 *
 * @returns {*} {Promise<void>}
 */
export async function telemetryCronjob() {
  // 0. SETUP - Parse CLI arguments, initialize the database and get a connection
  const args = parseArguments();
  defaultLog.info({ message: 'Cronjob starting.', args });

  initDBPool(defaultPoolConfig);

  const connection = getAPIUserDBConnection();

  try {
    await connection.open({ transaction: false }); // Open a non-transaction database connection

    // 1. INITIALIZE SERVICES - Lotek + Vectronic
    defaultLog.info({ message: 'Initializing services.' });
    const vectronicService = new TelemetryVectronicService(connection);
    const lotekService = new TelemetryLotekService(connection);

    // 2. FETCH DEVICES AND CREDENTIALS - Fetch devices from Lotek and get SIMS Vectronic credentials
    defaultLog.info({ message: 'Fetching devices and credentials.' });
    let lotekDevices = await lotekService.fetchDevicesFromLotek(); // Fetch the lotek account devices
    let vectronicDevices = await vectronicService.getDeviceCredentials(); // Fetch the vectronic account devices

    // Optional device limit for testing
    if (args._test_maxDevices) {
      lotekDevices = lotekDevices.slice(0, args._test_maxDevices);
      vectronicDevices = vectronicDevices.slice(0, args._test_maxDevices);
    }

    // 3. GENERATE QUEUEABLE TASKS - Create tasks for each device
    defaultLog.info({ message: 'Generating tasks.' });
    const lotekTasks = lotekDevices.map((device) => ({ serial: device.nDeviceID })); // Create a task for each device
    const vectronicTasks = vectronicDevices.map((device) => ({ serial: device.idcollar, key: device.collarkey }));

    // 4. PROCESS TELEMETRY - Fetch telemetry from the vendor API and insert it into the SIMS database
    defaultLog.info({ message: 'Processing telemetry.' });
    const lotekResults = await lotekService.processTelemetry(lotekTasks, args);
    const vectronicResults = await vectronicService.processTelemetry(vectronicTasks, args);

    // 5. PARSE RESULTS - Parse the telemetry processing results for logging
    const parsedLotek = parseResults('Lotek', lotekResults);
    const parsedVectronic = parseResults('Vectronic', vectronicResults);

    return {
      new_telemetry: parsedLotek.new + parsedVectronic.new,
      created_telemetry: parsedLotek.created + parsedVectronic.created,
      errors: parsedLotek.errors.concat(parsedVectronic.errors)
    };
  } finally {
    connection.release(); // No commit or rollback is needed (not in a transaction)
  }
}

/**
 * Parse the results of the telemetry processing.
 *
 * @param {string} vendor The vendor name.
 * @param {QueueResult<{ serial: number }, TelemetryProcessingResult>[]} results The telemetry processing results.
 * @returns {*} The parsed telemetry results.
 */
export const parseResults = (vendor: string, results: QueueResult<{ serial: number }, TelemetryProcessingResult>[]) => {
  let newTelemetry = 0;
  let createdTelemetry = 0;
  const errors = [];

  for (const result of results) {
    if (result.error) {
      errors.push(result.error);
    }

    if (result.value) {
      newTelemetry += result.value.new;
      createdTelemetry += result.value.created;
    }
  }

  if (results.length && errors.length === results.length) {
    defaultLog.error({
      label: 'Partial Failure',
      vendor: vendor,
      message: 'Partial failure detected. All resolved results contained a thrown error.',
      firstError: errors[0]
    });

    throw new ApiGeneralError(`All tasks failed to complete for ${vendor}.`);
  }

  return {
    new: newTelemetry,
    created: createdTelemetry,
    errors
  };
};

/**
 * Parse the CLI arguments.
 *
 * @returns {*} The parsed CLI arguments.
 */
export const parseArguments = () => {
  const parsedArgs = parseArgs({
    args: process.argv,
    options: {
      // The number of requests to make concurrently
      concurrently: { type: 'string', default: '100' },
      // The number of items to insert in a single batch
      batchSize: { type: 'string', default: '1000' },
      // The start date for fetching telemetry data
      startDate: { type: 'string' },
      // The end date for fetching telemetry data
      endDate: { type: 'string' },
      // The maximum number of devices to process (for testing)
      _test_maxDevices: { type: 'string' }
    },
    allowPositionals: true
  });

  return z
    .object({
      concurrently: z.coerce.number(),
      batchSize: z.coerce.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      _test_maxDevices: z.coerce.number().optional()
    })
    .strict()
    .parse(parsedArgs.values);
};
