import { Knex } from 'knex';

/**
 * Added new program and project_program for tracking programs (used to be project type)
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ------------------------------------------------------------------------------------------------------------------
    -------------------------------------  ------------------------------------------------
    ------------------------------------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- drop old views
    DROP VIEW activity;
    DROP VIEW project_activity;

    -- Project Lead ---> Coordinator
    -- All read/write permissions
    -- Editor ---> Collaborator
    -- All read/write permissions
    -- Viewer ---> Observer
    -- read only permissions


    -- end datae existing roles
    -- 3 new roles
    -- create permissions 3
    -- update end auth work look at permissions/ guards
    -- permission enum

    -------------------------------------------------------------------------
    -- End date old roles
    -------------------------------------------------------------------------
    UPDATE project_roles SET record_end_date = NOW();

    -------------------------------------------------------------------------
    -- Add new roles to project_role table
    -------------------------------------------------------------------------
    INSERT INTO project_role (name, record_effective_date, description)
    VALUES 
      ('Coordinator', NOW(), 'The administrative lead of the project.'),
      ('Collaborator', NOW(), 'A participant team member of the project.'),
      ('Observer', NOW(), 'A reviewer of the project.');

    -------------------------------------------------------------------------
    -- Update existing project_participation with new project roles
    -------------------------------------------------------------------------

    -- process for each of these:
    -- select the role id for the old role
    -- select the role id for the new role
    -- update the existing project_participation row for the old role id with the new role id
    UPDATE project_participation SET project_role_id = (
      SELECT project_role_id 
      FROM project_role 
      WHERE name = 'Coordinator')
    WHERE project_participation.project_participation_id = (
      SELECT pp.project_participation_id 
      FROM project_participation pp, (
        SELECT project_role_id 
        FROM project_role 
        WHERE name = 'Project Lead') as pr
      WHERE pp.project_role_id = pr.project_role_id
    );

    UPDATE project_participation SET project_role_id = (
      SELECT project_role_id 
      FROM project_role 
      WHERE name = 'Collaborator')
    WHERE project_participation.project_participation_id = (
      SELECT pp.project_participation_id 
      FROM project_participation pp, (
        SELECT project_role_id 
        FROM project_role 
        WHERE name = 'Editor') as pr
      WHERE pp.project_role_id = pr.project_role_id
    );

    UPDATE project_participation SET project_role_id = (
      SELECT project_role_id 
      FROM project_role 
      WHERE name = 'Observer')
    WHERE project_participation.project_participation_id = (
      SELECT pp.project_participation_id 
      FROM project_participation pp, (
        SELECT project_role_id 
        FROM project_role 
        WHERE name = 'Viewer') as pr
      WHERE pp.project_role_id = pr.project_role_id
    );



    -------------------------------------------------------------------------
    -- Remove old indexes and constraints 
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub, public;

    -------------------------------------------------------------------------
    -- Recreate views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
