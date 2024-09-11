import { defaultPoolConfig, getDBConnection, IDBConnection, initDBPool } from './db';
import { transformPermits } from './transformations/permit';
import { transformProjects } from './transformations/project';
import { transformSampleSites } from './transformations/sampling-site';
import { transformSurveyStratums } from './transformations/stratum';
import { transformSurveys } from './transformations/survey';
import { transformUsers } from './transformations/user';
import { truncateTables } from './utils/truncateTables';

let connection: IDBConnection; // Declare connection variable at the module level

async function main() {
  console.log('Initializing the database connection');
  // Initializes the database connection.
  initDBPool(defaultPoolConfig);

  // Gets the database connection, connecting with the user `spi`
  connection = getDBConnection();

  console.log('Got the connection', defaultPoolConfig)

  try {
    // Opens a database connection for the transformations
    await connection.open();

    console.log('Opened the database connection');

    // FOR TESTING ONLY
    // Some insert statements will fail due to duplicates unless the tables are truncated
    if (process.env.NODE_ENV === 'development' || 'test') {
      await truncateTables(connection);
    }

    // STEP 1. Creates public.migrate_spi_user_deduplication containing deduplicated users from the public.spi_persons table
    await transformUsers(connection);

    // STEP 2. Transforms SPI Projects into SIMS Projects and assign project participants
    await transformProjects(connection);

    // STEP 3. Transforms SPI Surveys into SIMS Surveys
    await transformSurveys(connection);

    // STEP 4. Transforms SPI Permits into SIMS Permits
    await transformPermits(connection);

    // STEP 5. Transforms SPI Survey Stratums into SIMS Survey Stratums
    await transformSurveyStratums(connection);

    // STEP 6. Transforms SPI Design Components into SIMS Sampling Sites
    await transformSampleSites(connection);

    //STEP 7.  Transforms SPI Survey Areas into SIMS Survey Locations
    await transformSampleSites(connection);

    // Commit the transactions
    connection.commit();

    console.log('All transformations completed successfully');
  } catch (error) {
    console.error('Error during transformations:', error);
    await connection.rollback();
  } finally {
    await connection.release();
  }
}

// Execute the transformations
main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});
