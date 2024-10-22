import { Knex } from 'knex';

/**
 *  add crew member and crew lead
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    
    SET SEARCH_PATH=biohub;
    
    ----------------------------------------------------------------------------------------
    -- Adding survey participant roles
    ----------------------------------------------------------------------------------------
        INSERT INTO survey_job (name, record_effective_date, description)
        VALUES
          ('Crew lead', NOW(), 'A participant of a survey in a crew lead role.'),
          ('Crew member', NOW(), 'A participant of a survey in a crew member role.');

    ----------------------------------------------------------------------------------------
    -- Reassigning sims biologist roles to crew member
    ----------------------------------------------------------------------------------------
      
        UPDATE survey_participation
        SET survey_job_id = (
            SELECT survey_job_id 
            FROM survey_job
            WHERE name = 'Crew member'
        )
        WHERE survey_job_id = (
            SELECT survey_job_id 
            FROM survey_job
            WHERE name = 'Biologist'
        );

    ----------------------------------------------------------------------------------------
    -- deleting sime biologist role 
    ----------------------------------------------------------------------------------------
          DELETE FROM survey_job
          WHERE name = 'Biologist';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
