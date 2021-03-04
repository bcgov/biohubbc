import * as fs from 'fs';
import * as Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Alter the project table:
 * - add spatial columns
 * - geom (geometry)
 * - geog (geography)
 *
 * Regenerate the dapi views.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE project ADD COLUMN geom geometry(Geometry,3005) CHECK (st_isValid(geom));
    COMMENT ON COLUMN project.geom IS 'Spatial geometry';

    ALTER TABLE project ADD COLUMN geog geography(Geometry);
    COMMENT ON COLUMN project.geog IS 'Geography type containing a geometry.';
  `);

  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_dapi_views}
  `);
}

/**
 * Alter the project table:
 * - remove spatial columns
 * - geom (geometry)
 * - geog (geography)
 *
 * Regenerate the dapi views.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    ALTER TABLE project DROP COLUMN geom;
    ALTER TABLE project DROP COLUMN geog;
  `);

  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_dapi_views}
  `);
}
