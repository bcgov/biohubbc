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
    set search_path= biohub_dapi_v1;

    -- drop old views
    DROP VIEW activity;
    DROP VIEW project_activity;

    -- drop old triggers 
    set search_path= biohub, public;
    DROP TRIGGER audit_activity ON activity;
    DROP TRIGGER journal_activity ON activity;

    DROP TRIGGER audit_project_activity ON project_activity;
    DROP TRIGGER journal_project_activity ON project_activity;

    -- remove foreign key constraints
    ALTER TABLE project_activity DROP CONSTRAINT Refproject127;
    ALTER TABLE project_activity DROP CONSTRAINT Refactivity128;

    -- rename columns  
    ALTER TABLE activity RENAME COLUMN activity_id to type_id;
    ALTER TABLE project_activity RENAME COLUMN activity_id TO type_id;
    ALTER TABLE project_activity RENAME COLUMN project_activity_id TO project_type_id;

    -- rename constraints and index (primary keys, end date constraint)
    ALTER TABLE activity RENAME CONSTRAINT activity_pk TO type_pk;
    ALTER INDEX activity_nuk1 RENAME TO type_nuk1;
    ALTER INDEX project_activity_pk RENAME TO project_type_pk;
    ALTER INDEX project_activity_uk1 RENAME TO project_type_nuk1;

    -- rename tables
    ALTER TABLE activity RENAME TO type;
    ALTER TABLE project_activity RENAME TO project_type;

    -- add foreign key constraints
    -- ALTER TABLE project_type ADD CONSTRAINT project_type_fk1 FOREIGN KEY (type_id) REFERENCES type(type_id);
    -- ALTER TABLE project_type ADD CONSTRAINT project_type_fk2 FOREIGN KEY (project_id) REFERENCES project(project_id);

    -- add triggers to type table
    CREATE TRIGGER audit_type BEFORE INSERT OR UPDATE OR DELETE ON type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_type BEFORE INSERT OR UPDATE OR DELETE ON type FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    -- add triggers to project_type table
    CREATE TRIGGER audit_project_type BEFORE INSERT OR UPDATE OR DELETE ON project_type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_project_type BEFORE INSERT OR UPDATE OR DELETE ON project_type FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    set search_path= biohub_dapi_v1;
    CREATE OR REPLACE VIEW type as select * from biohub.type;
    CREATE OR REPLACE VIEW project_type as select * from biohub.project_type;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
