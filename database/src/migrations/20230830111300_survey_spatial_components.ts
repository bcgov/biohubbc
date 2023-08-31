import { Knex } from 'knex';

/**
 * Replace/enhance the old (unused) survey_spatial_component table.
 * Migrate existing spatial data from survey table into new survey_spatial_component table.
 * Drop old spatial data columns from survey table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    -------------------------------------------------------------------------
    -- Drop views/tables/constraints
    -------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;
  
    DROP VIEW IF EXISTS survey;

    DROP VIEW IF EXISTS survey_spatial_component;
  
    SET SEARCH_PATH=biohub,public;
  
    DROP TABLE IF EXISTS survey_spatial_component;
  
    -------------------------------------------------------------------------
    -- Create new tables
    -------------------------------------------------------------------------
  
    CREATE TABLE survey_spatial_component(
      survey_spatial_component_id   integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                     integer                     NOT NULL,
      name                          varchar(100)                NOT NULL,
      description                   varchar(250)                NOT NULL,
      geometry                      geometry(geometry, 3005),
      geography                     geography(geometry)         NOT NULL,
      geojson                       jsonb                       NOT NULL,
      create_date                   timestamptz(6)              DEFAULT now() NOT NULL,
      create_user                   integer                     NOT NULL,
      update_date                   timestamptz(6),
      update_user                   integer,
      revision_count                integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT survey_spatial_component_pk PRIMARY KEY (survey_spatial_component_id)
    );
  
    COMMENT ON COLUMN survey_spatial_component.survey_spatial_component_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_spatial_component.name                          IS 'The name of the spatial record.';
    COMMENT ON COLUMN survey_spatial_component.description                   IS 'The description of the spatial record.';
    COMMENT ON COLUMN survey_spatial_component.geometry                      IS 'The containing geometry of the record.';
    COMMENT ON COLUMN survey_spatial_component.geography                     IS 'The containing geography of the record.';
    COMMENT ON COLUMN survey_spatial_component.geojson                       IS 'A GeoJSON representation of the geometry which may contain additional metadata.';
    COMMENT ON COLUMN survey_spatial_component.create_date                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_spatial_component.create_user                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_spatial_component.update_date                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_spatial_component.update_user                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_spatial_component.revision_count                IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  survey_spatial_component                               IS 'Spatial records associated to a survey.';
  
    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints
    ----------------------------------------------------------------------------------------
  
    ALTER TABLE survey_spatial_component ADD CONSTRAINT survey_spatial_component_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);
  
    -- Add indexes on foreign key columns
    CREATE INDEX survey_spatial_component_idx1 ON survey_spatial_component(survey_id);
  
    -------------------------------------------------------------------------
    -- Create audit and journal triggers
    -------------------------------------------------------------------------

    CREATE TRIGGER audit_survey_spatial_component BEFORE INSERT OR UPDATE OR DELETE ON survey_spatial_component for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_spatial_component AFTER INSERT OR UPDATE OR DELETE ON survey_spatial_component for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Migrate existing spatial data from survey table into new survey spatial components table
    ----------------------------------------------------------------------------------------

    INSERT INTO survey_spatial_component (
      survey_id,
      name,
      description,
      geometry,
      geography,
      geojson,
      create_date,
      create_user
    )(
      select
        survey.survey_id,
        survey.location_name,
        'Insert description here' as description,
        survey.geometry,
        survey.geography,
        survey.geojson,
        survey.create_date,
        survey.create_user
      FROM
        survey
    );

    ----------------------------------------------------------------------------------------
    -- Drop old spatial data columns from survey table
    ----------------------------------------------------------------------------------------

    ALTER TABLE survey DROP COLUMN geometry;
    ALTER TABLE survey DROP COLUMN geography;
    ALTER TABLE survey DROP COLUMN geojson;
    ALTER TABLE survey DROP COLUMN location_description;
    ALTER TABLE survey DROP COLUMN location_name;

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;
  
    CREATE OR REPLACE VIEW survey_spatial_component AS SELECT * FROM biohub.survey_spatial_component;
    CREATE OR REPLACE VIEW survey AS SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
