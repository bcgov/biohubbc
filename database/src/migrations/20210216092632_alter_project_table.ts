import * as fs from 'fs';
import * as Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Alter the project table:
 * - remove not null constraint from scientific_collection_permit_number column
 * - add project coordinator fields
 *
 * Regenerate the dapi views.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ALTER TABLE project ALTER COLUMN scientific_collection_permit_number DROP NOT NULL;
  `);

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    DO $$
    BEGIN
      BEGIN
          BEGIN
              ALTER TABLE project ADD COLUMN coordinator_first_name varchar(50) NOT NULL;
          EXCEPTION
              WHEN duplicate_column THEN
          END;
      END;

      BEGIN
          BEGIN
              ALTER TABLE project ADD COLUMN coordinator_last_name varchar(50) NOT NULL;
          EXCEPTION
              WHEN duplicate_column THEN
          END;
      END;
      BEGIN
          BEGIN
              ALTER TABLE project ADD COLUMN coordinator_email_address varchar(500) NOT NULL;
          EXCEPTION
              WHEN duplicate_column THEN
          END;
      END;
      BEGIN
          BEGIN
              ALTER TABLE project ADD COLUMN coordinator_agency_name varchar(300) NOT NULL;
          EXCEPTION
              WHEN duplicate_column THEN
          END;
      END;
    END;
    $$
  `);

  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_dapi_views}
  `);
}

/**
 * Alter the project table:
 * - add not null constraint to scientific_collection_permit_number column
 * - remove project coordinator fields
 *
 * Regenerate the dapi views.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ALTER TABLE project ALTER COLUMN scientific_collection_permit_number SET NOT NULL;
  `);

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    DO $$
    BEGIN
      ALTER TABLE project DROP COLUMN coordinator_first_name;
      ALTER TABLE project DROP COLUMN coordinator_last_name;
      ALTER TABLE project DROP COLUMN coordinator_email_address;
      ALTER TABLE project DROP COLUMN coordinator_agency_name;
    END;
    $$
  `);

  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_dapi_views}
  `);
}
