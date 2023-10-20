import { Knex } from 'knex';

/**
 * Replace/enhance the old (unused) survey_location table.
 * Migrate existing spatial data from survey table into new survey_location table.
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

    DROP VIEW IF EXISTS survey_location;
  
    SET SEARCH_PATH=biohub,public;
  
    DROP TABLE IF EXISTS survey_location;
  
    -------------------------------------------------------------------------
    -- Create new tables
    -------------------------------------------------------------------------
  
    CREATE TABLE survey_location(
      survey_location_id       integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                integer                     NOT NULL,
      name                     varchar(100)                NOT NULL,
      description              varchar(250)                NOT NULL,
      geometry                 geometry(geometry, 3005),
      geography                geography(geometry)         NOT NULL,
      geojson                  jsonb                       NOT NULL,
      create_date              timestamptz(6)              DEFAULT now() NOT NULL,
      create_user              integer                     NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer                     DEFAULT 0 NOT NULL,
      CONSTRAINT survey_location_pk PRIMARY KEY (survey_location_id)
    );
  
    COMMENT ON COLUMN survey_location.survey_location_id      IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_location.name                    IS 'The name of the spatial record.';
    COMMENT ON COLUMN survey_location.description             IS 'The description of the spatial record.';
    COMMENT ON COLUMN survey_location.geometry                IS 'The containing geometry of the record.';
    COMMENT ON COLUMN survey_location.geography               IS 'The containing geography of the record.';
    COMMENT ON COLUMN survey_location.geojson                 IS 'A GeoJSON representation of the geometry which may contain additional metadata.';
    COMMENT ON COLUMN survey_location.create_date             IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_location.create_user             IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_location.update_date             IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_location.update_user             IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_location.revision_count          IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  survey_location                         IS 'Spatial records associated to a survey.';
  
    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints
    ----------------------------------------------------------------------------------------
  
    ALTER TABLE survey_location ADD CONSTRAINT survey_location_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);
  
    -- Add indexes on foreign key columns
    CREATE INDEX survey_location_idx1 ON survey_location(survey_id);
  
    -------------------------------------------------------------------------
    -- Create audit and journal triggers
    -------------------------------------------------------------------------

    CREATE TRIGGER audit_survey_location BEFORE INSERT OR UPDATE OR DELETE ON survey_location for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_location AFTER INSERT OR UPDATE OR DELETE ON survey_location for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Migrate existing spatial data from survey table into new survey spatial components table
    ----------------------------------------------------------------------------------------

    INSERT INTO survey_location (
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
  
    CREATE OR REPLACE VIEW survey_location AS SELECT * FROM biohub.survey_location;
    CREATE OR REPLACE VIEW survey AS SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
