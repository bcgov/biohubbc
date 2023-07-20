import { Knex } from 'knex';

/**
 * // add new table for region lookup and connection table to project and survey
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path= biohub, public;
    
    -- Get existing types and insert them into programs in order
    INSERT INTO "program" (name, record_effective_date, description, record_end_date)
    SELECT name, record_effective_date, description, record_end_date
    FROM project_type
    ORDER BY project_type_id;
    
    -- then take all the existing projects and they're types and insert into new join table
    INSERT INTO project_program (project_id, program_id)
    SELECT project_id, project_type_id FROM project;
    
    set search_path= biohub_dapi_v1;
    -- drop old views
    DROP VIEW project;
    DROP VIEW project_type;

    set search_path= biohub, public;
    -- drop old column and table
    ALTER TABLE project DROP COLUMN project_type_id;
    DROP TABLE project_type;
    
    set search_path= biohub_dapi_v1;
    CREATE OR REPLACE VIEW project as select * from biohub.project;
    CREATE OR REPLACE VIEW project_program as select * from biohub.project_program;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
