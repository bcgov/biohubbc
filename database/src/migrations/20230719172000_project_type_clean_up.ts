import { Knex } from 'knex';

/**
 * // add new table for region lookup and connection table to project and survey
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  // await knex.raw(`
  //   set search_path= biohub, public;
  //   -- Get existing types and insert them into programs in order
  //   INSERT INTO "program" (name, record_effective_date, description, record_end_date)
  //   SELECT name, record_effective_date, description, record_end_date
  //   FROM project_type
  //   ORDER BY project_type_id;
  //   -- then take all the existing projects and they're types and insert into new join table
  //   INSERT INTO project_program (project_id, program_id)
  //   SELECT project_id, project_type_id FROM project;
  //   -- drop current column
  //   DROP VIEW project;
  //   ALTER TABLE project DROP COLUMN project_type_id;
  //   -- drop project types table
  //   DROP VIEW project_type;
  //   DROP TABLE project_type;
  // `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
