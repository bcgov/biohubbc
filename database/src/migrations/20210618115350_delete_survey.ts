import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop procedure if exists api_delete_survey;

    create or replace procedure api_delete_survey(__survey_id survey.id%type)
    language plpgsql
    security definer
    as 
    $$
    -- *******************************************************************
    -- Procedure: api_delete_survey
    -- Purpose: deletes a survey and dependencies
    --
    -- MODIFICATION HISTORY
    -- Person           Date        Comments
    -- ---------------- ----------- --------------------------------------
    -- shreyas.devalapurkar@quartech.com
    --                  2021-06-18  initial release
    -- *******************************************************************
    begin
      delete from survey_proprietor where s_id = __survey_id;
      delete from survey_attachment where s_id = __survey_id;
      delete from study_species where s_id = __survey_id;
      delete from block_observation where s_id = __survey_id;
      delete from survey where id = __survey_id;
    exception
      when others THEN
        raise;    
    end;
    $$;
  `);
}

/**
 * Drop the `api_delete_survey` procedure.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop procedure if exists api_delete_survey;
  `);
}
