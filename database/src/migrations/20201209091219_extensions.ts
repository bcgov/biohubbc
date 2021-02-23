import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS postgis CASCADE;
    CREATE EXTENSION IF NOT EXISTS postgis_raster CASCADE;
    CREATE EXTENSION IF NOT EXISTS postgis_topology CASCADE;
    CREATE EXTENSION IF NOT EXISTS postgis_sfcgal CASCADE;
    CREATE EXTENSION IF NOT EXISTS pgRouting CASCADE;
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch CASCADE;
    CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP EXTENSION IF EXISTS postgis CASCADE;
    DROP EXTENSION IF EXISTS postgis_raster CASCADE;
    DROP EXTENSION IF EXISTS postgis_topology CASCADE;
    DROP EXTENSION IF EXISTS postgis_sfcgal CASCADE;
    DROP EXTENSION IF EXISTS pgRouting CASCADE;
    DROP EXTENSION IF EXISTS fuzzystrmatch CASCADE;
    DROP EXTENSION IF EXISTS pgcrypto CASCADE;
  `);
}
