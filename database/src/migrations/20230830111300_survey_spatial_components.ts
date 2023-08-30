import { Knex } from 'knex';

/**
 * Add new spatial_component_type table and replace/enhance the old (unused) survey_spatial_component table.
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
    CREATE TABLE spatial_component_type(
      spatial_component_type_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                        varchar(50)       NOT NULL,
      description                 varchar(250)      NOT NULL,
      record_effective_date       date              NOT NULL,
      record_end_date             date,
      create_date                 timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                 integer           NOT NULL,
      update_date                 timestamptz(6),
      update_user                 integer,
      revision_count              integer           DEFAULT 0 NOT NULL,
      CONSTRAINT spatial_component_type_pk PRIMARY KEY (spatial_component_type_id)
    );
  
    COMMENT ON COLUMN spatial_component_type.spatial_component_type_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN spatial_component_type.name                        IS 'The name of the spatial type.';
    COMMENT ON COLUMN spatial_component_type.description                 IS 'The description of the spatial type.';
    COMMENT ON COLUMN spatial_component_type.record_effective_date       IS 'Record level effective date.';
    COMMENT ON COLUMN spatial_component_type.record_end_date             IS 'Record level end date.';
    COMMENT ON COLUMN spatial_component_type.create_date                 IS 'The datetime the record was created.';
    COMMENT ON COLUMN spatial_component_type.create_user                 IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN spatial_component_type.update_date                 IS 'The datetime the record was updated.';
    COMMENT ON COLUMN spatial_component_type.update_user                 IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN spatial_component_type.revision_count              IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  spatial_component_type                             IS 'Spatial record type.';
  
    -------------------------------------------------------------------------
  
    CREATE TABLE survey_spatial_component(
      survey_spatial_component_id   integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                     integer                     NOT NULL,
      spatial_component_type_id     integer                     NOT NULL,
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
    COMMENT ON COLUMN survey_spatial_component.spatial_component_type_id     IS 'The type of this spatial record. A foreign key to the spatial_component_type table.';
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
  
    -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX spatial_component_type_nuk1 ON spatial_component_type(name, (record_end_date is NULL)) where record_end_date is null;
  
    ----------------------------------------------------------------------------------------
  
    ALTER TABLE survey_spatial_component ADD CONSTRAINT survey_spatial_component_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);
  
    ALTER TABLE survey_spatial_component ADD CONSTRAINT survey_spatial_component_fk2
    FOREIGN KEY (spatial_component_type_id)
    REFERENCES spatial_component_type(spatial_component_type_id);
  
    -- Add indexes on foreign key columns
    CREATE INDEX survey_spatial_component_idx2 ON survey_spatial_component(survey_id);
    CREATE INDEX survey_spatial_component_idx1 ON survey_spatial_component(spatial_component_type_id);
  
    -------------------------------------------------------------------------
    -- Create audit and journal triggers
    -------------------------------------------------------------------------
    CREATE TRIGGER audit_spatial_component_type BEFORE INSERT OR UPDATE OR DELETE ON spatial_component_type for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_spatial_component_type AFTER INSERT OR UPDATE OR DELETE ON spatial_component_type for each ROW EXECUTE PROCEDURE tr_journal_trigger();
  
    CREATE TRIGGER audit_survey_spatial_component BEFORE INSERT OR UPDATE OR DELETE ON survey_spatial_component for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_spatial_component AFTER INSERT OR UPDATE OR DELETE ON survey_spatial_component for each ROW EXECUTE PROCEDURE tr_journal_trigger();
  
    ----------------------------------------------------------------------------------------
    -- Populate lookup table
    ----------------------------------------------------------------------------------------

    INSERT INTO spatial_component_type (name, description, record_effective_date) values ('Boundary', 'A boundary. Typically one or more polygons.', now());
    INSERT INTO spatial_component_type (name, description, record_effective_date) values ('Transect', 'A transect. Typically one or more linestrings.', now());
    INSERT INTO spatial_component_type (name, description, record_effective_date) values ('Block', 'A block. Typically a single polygon.', now());
    INSERT INTO spatial_component_type (name, description, record_effective_date) values ('Flight Path', 'A flight path. Typically one or more linestrings.', now());

    ----------------------------------------------------------------------------------------
    -- Migrate existing spatial data from survey table into new survey spatial components table
    ----------------------------------------------------------------------------------------

    INSERT INTO survey_spatial_component (
      survey_id,
      spatial_component_type_id,
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
        (
          SELECT 
            spatial_component_type_id
          FROM
            spatial_component_type
          WHERE
            name = 'Boundary'
        ),
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
  
    CREATE OR REPLACE VIEW spatial_component_type AS SELECT * FROM biohub.spatial_component_type;
    CREATE OR REPLACE VIEW survey_spatial_component AS SELECT * FROM biohub.survey_spatial_component;
    CREATE OR REPLACE VIEW survey AS SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
