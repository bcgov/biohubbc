import { parseArgs } from 'util';
import { defaultPoolConfig, getAPIUserDBConnection, initDBPool } from '../../database/db';
import { VectronicAPIQuery } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { getLogger } from '../../utils/logger';
import { taskQueue } from '../../utils/task-queue';

const defaultLog = getLogger('TelemetryCronjob');

async function worker(item: number): Promise<number> {
  if (item === 5) {
    throw new Error('Error processing item 5');
  }
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(item * 2);
    }, 1000);
  });
}

const run = async () => {
  const result = await taskQueue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], worker, 2);

  console.time('promise');

  const a = new Promise((resolve) => setTimeout(() => resolve('a'), 2000));

  const b = await new Promise((resolve) => setTimeout(() => resolve('b'), 2000));

  await new Promise((resolve) => setTimeout(() => resolve('b'), 2000));

  await a;

  console.log({ a, b });

  console.timeEnd('promise');

  console.log({ result });
};

/**
 * Telemetry retrieval cronjob.
 *
 * Handles fetching Vectronic and Lotek telemetry from their respective APIs and storing it in the database.
 *
 * @returns {*} {Promise<void>}
 */
export async function main(): Promise<void> {
  const args = parseArguments(); // Parse the CLI arguments

  defaultLog.info({ message: 'Cronjob starting.', args });

  initDBPool(defaultPoolConfig); // Initialize the database connection pool

  const connection = getAPIUserDBConnection(); // Get the API user database connection

  try {
    //const lotekService = new TelemetryLotekService(connection); // Create a new Lotek telemetry service

    await run();

    await connection.open({ noTransaction: true }); // Open a connection to the database without a transaction

    defaultLog.info({ message: 'Cronjob completed.' });
  } catch (error) {
    defaultLog.error({ message: 'Cronjob failed to complete.', error });
    process.exit(1);
  } finally {
    defaultLog.info({ message: 'Cronjob cleaning up open connections.' });

    connection.release(); // No commit or rollback is needed when transaction is not used
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
      batch: { type: 'string', default: '1000' },
      // The start date for the telemetry data retrieval
      start: { type: 'string' },
      // The end date for the telemetry data retrieval
      end: { type: 'string' }
    },
    allowPositionals: true
  });

  return {
    concurrently: Number(parsedArgs.values.concurrently),
    batch: Number(parsedArgs.values.batch),
    start: parsedArgs.values.start,
    end: parsedArgs.values.end
  };
};

type Arguments = ReturnType<typeof parseArguments>;

/**
 * Fetch and insert the Vectronic telemetry data.
 *
 * @param {TelemetryVectronicService} vectronicService The Vectronic telemetry service.
 * @param {Arguments} args The CLI arguments.
 * @returns {*} {Promise<void>}
 */
export const processVectronicTelemetry = async (vectronicService: TelemetryVectronicService, args: Arguments) => {
  // Fetch the Vectronic device credentials from SIMS
  const credentials = await vectronicService.getDeviceCredentials();

  defaultLog.info({ vendor: 'VECTRONIC', message: `${credentials.length} credentials retrieved.` });

  // Inject the date range provided by the CLI arguments into the query
  const queries: VectronicAPIQuery[] = credentials.map((credential) => ({
    gtId: credential.max_idposition ? credential.max_idposition.toString() : undefined,
    idcollar: credential.idcollar,
    collarkey: credential.collarkey,
    beforeAcquisition: args.end,
    afterAcquisition: args.start
  }));

  // Fetch the telemetry data from the Vectronic API - fetches concurrently using a queue
  const processedDevices = await vectronicService.processTelemetry(queries, args.concurrently, args.batch);

  defaultLog.info({
    vendor: 'VECTRONIC',
    message: 'Processed devices.',
    devices: processedDevices
  });

  const errors = processedDevices.filter((device) => device.error).map((device) => device.error);

  const everyRequestFailed = processedDevices.length && processedDevices.length === errors.length;

  if (everyRequestFailed) {
    defaultLog.warn({
      vendor: 'VECTRONIC',
      message: 'Failed to retrieve telemetry from API.'
    });
  }
};

// Run the telemetry cronjob
main().catch((err) => {
  defaultLog.error({ message: 'Cronjob fatal error.', error: err });
  process.exit(1);
});
