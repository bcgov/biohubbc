import path from 'path';
import { defaultPoolConfig, getDBConnection, IDBConnection, initDBPool } from './db';
import { transformPermits } from './transformations/permit';
import { transformProjects } from './transformations/project';
import { transformSamplingMethods } from './transformations/sampling-methods';
import { transformSampleSites } from './transformations/sampling-site';
import { transformSampleVisits } from './transformations/sampling_period';
import { insertMappedSpecies } from './transformations/species-map';
import { transformSurveyStratums } from './transformations/stratum';
import { transformStudyAreas } from './transformations/study-area';
import { transformStudySpecies } from './transformations/study-species';
import { transformSurveys } from './transformations/survey';
import { transformUsers } from './transformations/user';
import { transformWildlifeObservations } from './transformations/wildlife_observations_1';
import { truncateTables } from './utils/truncate-tables';

let connection: IDBConnection; // Declare connection variable at the module level

async function main() {
  console.log('Initializing the database connection');
  // Initializes the database connection.
  initDBPool(defaultPoolConfig);

  // Gets the database connection, connecting with the user `spi`
  connection = getDBConnection();

  try {
    // Opens a database connection for the transformations
    await connection.open();

    console.log('Opened the database connection');

    // Step 0. Clean slate the database, removing previously transformed data for testing
    // NOTE: Some insert statements will fail due to duplicates unless the tables are truncated
    if (process.env.NODE_ENV === 'development' || 'test') {
      await truncateTables(connection);
    }

    // STEP 1. Map SPI species codes to ITIS species codes
    // This only needs to be run if public.migrate_spi_species is empty. Commenting out to not overhwelm ITIS with requests.
    if (process.env.SPI_MIGRATE_INCLUDE_SPECIES) {
      await insertMappedSpecies(path.resolve(__dirname, 'data/WLDTAXONOMIC_UNITS.csv'), connection);
    }

    // STEP 2. Creates public.migrate_spi_user_deduplication containing deduplicated users from the public.spi_persons table
    await transformUsers(connection);

    // STEP 3. Transforms SPI Projects into SIMS Projects and assign project participants
    await transformProjects(connection);

    // STEP 4. Transforms SPI Surveys into SIMS Surveys
    await transformSurveys(connection);

    // STEP 5. Transforms SPI Permits into SIMS Permits
    await transformPermits(connection);

    // STEP 6. Transforms SPI Survey Stratums into SIMS Survey Stratums
    await transformSurveyStratums(connection);

    // STEP 7. Transforms SPI Design Components into SIMS Sampling Sites
    await transformSampleSites(connection);

    //STEP 8.  Transforms SPI Sampling Method
    await transformSamplingMethods(connection);

    //STEP 9.  Transforms SPI Sampling Period
    await transformSampleVisits(connection);

    // STEP 10. Transforms Target taxa into Study Species
    await transformStudySpecies(connection);
    // STEP 11
    await transformWildlifeObservations(connection);

    //STEP 7.  Transforms SPI Survey Areas into SIMS Survey Locations
    await transformStudyAreas(connection);

    //STEP 7.  Transforms SPI Survey Areas into SIMS Survey Locations
    await transformStudyAreas(connection);

    connection.rollback();

    // Commit the transactions
    // connection.commit();

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
