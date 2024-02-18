import { Knex } from 'knex';

/**
 * Migrate spatial geography data to geometry columns.
 * Drop geography columns.
 * Add spatial index to geometry columns.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Drop views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW submission_spatial_component;

    DROP VIEW survey_spatial_component;

    DROP VIEW survey_location;

    DROP VIEW region_lookup;

    DROP VIEW survey_sample_site;

    DROP VIEW project;

    ----------------------------------------------------------------------------------------
    -- Migrate data from geography columns to geometry columns, and limit decimals to 6 places (0.111 meter precision)
    -- Note: Not limiting the region_lookup decimals to 6 places as it is a copy of data from the BCGW, and not user 
    -- generated
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    UPDATE submission_spatial_component SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography, 6), 4326), 3005);

    UPDATE survey_spatial_component SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography, 6), 4326), 3005);

    UPDATE survey_location SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography, 6), 4326), 3005);

    UPDATE region_lookup SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography), 4326), 3005);

    UPDATE survey_sample_site SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography, 6), 4326), 3005);

    UPDATE project SET geometry = public.ST_Transform(public.ST_GeomFromText(public.ST_AsText(geography, 6), 4326), 3005);

    ----------------------------------------------------------------------------------------
    -- Drop geography columns
    ----------------------------------------------------------------------------------------
    ALTER TABLE submission_spatial_component DROP COLUMN geography;

    ALTER TABLE survey_spatial_component DROP COLUMN geography;

    ALTER TABLE survey_location DROP COLUMN geography;

    ALTER TABLE region_lookup DROP COLUMN geography;

    ALTER TABLE survey_sample_site DROP COLUMN geography;

    ALTER TABLE project DROP COLUMN geography;

    ----------------------------------------------------------------------------------------
    -- Add spatial index to geometry columns
    ----------------------------------------------------------------------------------------
    CREATE INDEX submission_spatial_component_idx1 ON submission_spatial_component using GIST(geometry);

    CREATE INDEX survey_spatial_component_idx1 ON survey_spatial_component using GIST(geometry);

    CREATE INDEX survey_location_idx2 ON survey_location using GIST(geometry);

    CREATE INDEX region_lookup_idx1 ON region_lookup using GIST(geometry);

    CREATE INDEX survey_sample_site_idx2 ON survey_sample_site using GIST(geometry);

    CREATE INDEX project_idx1 ON project using GIST(geometry);

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW submission_spatial_component AS SELECT * FROM biohub.submission_spatial_component;

    CREATE OR REPLACE VIEW survey_spatial_component AS SELECT * FROM biohub.survey_spatial_component;

    CREATE OR REPLACE VIEW survey_location AS SELECT * FROM biohub.survey_location;

    CREATE OR REPLACE VIEW region_lookup AS SELECT * FROM biohub.region_lookup;

    CREATE OR REPLACE VIEW survey_sample_site AS SELECT * FROM biohub.survey_sample_site;

    CREATE OR REPLACE VIEW project AS SELECT * FROM biohub.project;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
