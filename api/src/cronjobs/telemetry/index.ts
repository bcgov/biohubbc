import { defaultPoolConfig, getDBConnection, initDBPool } from '../../database/db';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('telemetry-cronjob');

export async function main() {
  initDBPool(defaultPoolConfig);

  const connection = getDBConnection();

  try {
    await connection.open();
  } catch (err) {
    defaultLog.error('Telemetry cronjob failed.', err);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main().catch((err) => {
  defaultLog.error('Main function failed.', err);
  process.exit(1);
});
