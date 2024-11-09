import { parseArgs } from 'util';
import { defaultPoolConfig, getAPIUserDBConnection, initDBPool } from '../../database/db';
import { TelemetryLotekService } from '../../services/telemetry-services/telemetry-lotek-service';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('TelemetryCronjob');

/**
 * Telemetry Cronjob: Handles fetching Vectronic and Lotek telemetry and inserting it into the database.
 *
 * Information:
 *
 * How to run:
 *  - Default: `npm run telemetry-cronjob` // concurrently = 100 and batchSize = 1000
 *  - CLI args: `npm run telemetry-cronjob -- --concurrently 100 --batchSize 1000 --startDate 2021-01-01 --endDate 2021-01-31`
 *
 * Date Ranges:
 *  If a date range is provided, the cronjob will fetch telemetry for that date range.
 *  If no date range is provided, the cronjob will fetch all telemetry data after the last record in the database.
 *    Lotek: We find the last record in the database and use the timestamp as the start date.
 *    Vectronic: We find the largest idposition (Vectronic PK) and use the gt-id query parameter.
 *
 * Web Services:
 *  - Lotek: https://webservice.lotek.com/API/Help
 *  - Vectronic: https://api.vectronic-wildlife.com/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#
 *
 * @returns {*} {Promise<void>}
 */
export async function main(): Promise<void> {
  // 0. SETUP
  const args = parseArguments(); // Parse the CLI arguments
  defaultLog.info({ message: 'Cronjob starting.', args });

  initDBPool(defaultPoolConfig); // Initialize the database connection pool
  const connection = getAPIUserDBConnection(); // Get the API user database connection

  try {
    await connection.open({ transaction: false }); // Open a connection to the database without a transaction

    // 1. INITIALIZE SERVICES
    defaultLog.info({ message: 'Initializing services.' });
    const vectronicService = new TelemetryVectronicService(connection);
    const lotekService = new TelemetryLotekService(connection);

    // 2. FETCH DEVICES AND CREDENTIALS
    const lotekDevices = await lotekService.fetchDevicesFromLotek(); // Fetch the lotek account devices
    const vectronicDevices = await vectronicService.getDeviceCredentials(); // Fetch the vectronic account devices
    defaultLog.info({ message: 'Fetching devices and credentials.' });

    // 3. GENERATE QUEUE TASKS
    defaultLog.info({ message: 'Generating tasks.' });
    const lotekTasks = lotekDevices.map((device) => ({ serial: device.nDeviceID })); // Create a task for each device
    const vectronicTasks = vectronicDevices.map((device) => ({ serial: device.idcollar, key: device.collarkey }));

    // 4. PROCESS TELEMETRY (FETCH AND INSERT)
    defaultLog.info({ message: 'Processing telemetry.' });
    const lotekResults = await lotekService.processTelemetry(lotekTasks.slice(200, 202), args);
    const vectronicResults = await vectronicService.processTelemetry(vectronicTasks, args);

    const results = lotekResults.concat(vectronicResults);

    // 5. GENERATE LOG INFORMATION
    const info = { telemetry: { new: 0, created: 0 }, lotekErrors: 0, vectronicErrors: 0 };
    for (const result of results) {
      if (result.error) {
        'key' in result.task ? info.vectronicErrors++ : info.lotekErrors++;
      } else {
        info.telemetry.new += result.value.new;
        info.telemetry.created += result.value.created;
      }
    }

    defaultLog.info({ message: 'Cronjob information', information: info });

    if (info.vectronicErrors === vectronicTasks.length || info.vectronicErrors === vectronicTasks.length) {
      defaultLog.error({ message: 'Partial failure detected. All tasks from a vendor failed to complete.' });
      throw lotekResults[0].error ?? vectronicResults[0].error; // Throw the first error to help debug
    }

    defaultLog.info({ message: 'Cronjob completed.' });
  } catch (error) {
    defaultLog.error({ message: 'Cronjob failed to complete.', error });
    process.exit(1);
  } finally {
    defaultLog.info({ message: 'Cronjob cleaning up open connections.' });

    connection.release(); // No commit or rollback is needed
    process.exit(0);
  }
}

/**
 * Parse the CLI arguments.
 *
 * @returns {*} The parsed CLI arguments.
 */
const parseArguments = () => {
  const parsedArgs = parseArgs({
    args: process.argv,
    options: {
      // The number of requests to make concurrently
      concurrently: { type: 'string', default: '10' },
      // The number of items to insert in a single batch
      batchSize: { type: 'string', default: '1000' },
      // The start date for fetching telemetry data
      startDate: { type: 'string' },
      // The end date for fetching telemetry data
      endDate: { type: 'string' }
    },
    allowPositionals: true
  });

  return {
    concurrently: Number(parsedArgs.values.concurrently),
    batchSize: Number(parsedArgs.values.batchSize),
    startDate: parsedArgs.values.startDate,
    endDate: parsedArgs.values.endDate
  };
};

// Run the telemetry cronjob
main().catch((err) => {
  defaultLog.error({ message: 'Cronjob fatal error.', error: err });
  process.exit(1);
});
