import { Knex } from 'knex';

/**
 * Added new program and project_program for tracking programs (used to be project type)
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ------------------------------------------------------------------------------------------------------------------
    ------------------------------------- Turning Activities -> Types ------------------------------------------------
    ------------------------------------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- drop old views
    DROP VIEW activity;
    DROP VIEW project_activity;

    -------------------------------------------------------------------------
    -- Remove old indexes and constraints 
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub, public;
    
    -- drop foreign key constraints
    ALTER TABLE project_activity DROP CONSTRAINT "Refproject127";
    ALTER TABLE project_activity DROP CONSTRAINT "Refactivity128";

    -- drop primary key constraints
    ALTER TABLE activity DROP CONSTRAINT activity_pk;
    DROP INDEX activity_nuk1;

    ALTER TABLE project_activity DROP CONSTRAINT project_activity_pk;
    DROP INDEX project_activity_uk1;
    
    -- drop indexes
    DROP INDEX "Ref136128";
    DROP INDEX "Ref45127";

    -------------------------------------------------------------------------
    -- Rename table and columns
    -------------------------------------------------------------------------
    -- rename columns
    ALTER TABLE activity RENAME COLUMN activity_id to type_id;
    ALTER TABLE project_activity RENAME COLUMN activity_id TO type_id;
    ALTER TABLE project_activity RENAME COLUMN project_activity_id TO project_type_id;

    -- rename tables
    ALTER TABLE activity RENAME TO type;
    ALTER TABLE project_activity RENAME TO project_type;

    -------------------------------------------------------------------------
    -- Add constraints and indexes
    -------------------------------------------------------------------------    
    -- add primary keys
    ALTER TABLE type ADD CONSTRAINT  type_pk PRIMARY KEY (type_id);
    ALTER TABLE project_type ADD CONSTRAINT  project_type_pk PRIMARY KEY (project_type_id);

    -- add foreign key constraints
    ALTER TABLE project_type ADD CONSTRAINT project_type_fk1 FOREIGN KEY (type_id) REFERENCES type(type_id);
    ALTER TABLE project_type ADD CONSTRAINT project_type_fk2 FOREIGN KEY (project_id) REFERENCES project(project_id);

    CREATE INDEX type_id_idx1 ON project_type(type_id);
    CREATE INDEX project_id_idx1 ON project_type(project_id);

    -- Add unique end-date index
    CREATE UNIQUE INDEX type_nuk1 ON type(name, (record_end_date is NULL)) where record_end_date is null;

    -------------------------------------------------------------------------
    -- Rename triggers and sequence
    -------------------------------------------------------------------------    
    ALTER SEQUENCE project_activity_project_activity_id_seq RENAME TO project_type_project_type_id_seq;


    ALTER TRIGGER audit_activity ON type RENAME TO audit_type;
    ALTER TRIGGER journal_activity ON type RENAME TO journal_type;
    
    ALTER TRIGGER audit_project_activity ON project_type RENAME TO audit_project_type;
    ALTER TRIGGER journal_project_activity ON project_type RENAME TO journal_project_type;
    
    -------------------------------------------------------------------------
    -- Update table comments
    -------------------------------------------------------------------------    
    COMMENT ON TABLE type IS 'A list of project types.';
    COMMENT ON COLUMN type.name IS 'Name of the type.';
    COMMENT ON TABLE project_type IS 'A associative entity that joins projects and project types.';

    -------------------------------------------------------------------------
    -- Recreate views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    CREATE OR REPLACE VIEW type as select * from biohub.type;
    CREATE OR REPLACE VIEW project_type as select * from biohub.project_type;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
