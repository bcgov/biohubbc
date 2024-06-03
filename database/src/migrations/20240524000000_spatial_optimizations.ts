import { Knex } from 'knex';

/**
 * Optimize geometry related columns
 *
 * Switching to geometry because spatial queries are faster using geometry vs geography.
 * Indexing geometry column will also greatly improve spatial queries.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SCHEMA 'biohub';

    ----------------------------------------------------------------------------------------
    -- Region Lookup
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH='biohub,biohub_dapi_v1';
    DROP VIEW IF EXISTS biohub_dapi_v1.region_lookup;

    -- Setting search path here to prevent "spatial_ref_sys" does not exist error
    SET SEARCH_PATH='public';
    SELECT UpdateGeometrySRID('biohubbc', 'biohub', 'region_lookup', 'geometry', 4326);

    SET SEARCH_PATH='biohub';
    -- Copy the geography to geometry column and cast to correct type
    UPDATE biohub.region_lookup SET geometry = geography::public.geometry;
    CREATE INDEX IF NOT EXISTS lookup_region_geom_idx1 ON biohub.region_lookup USING GIST(geometry);
    ALTER TABLE biohub.region_lookup DROP COLUMN IF EXISTS geography;

    CREATE OR REPLACE VIEW biohub_dapi_v1.region_lookup AS SELECT * FROM biohub.region_lookup;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
