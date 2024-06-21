import { Knex } from 'knex';

/**
 * Inserts a procedure that makes all of the necessary deletions when a project is deleted (deleting all child records
 * before deleting the project record itself).
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    CREATE OR REPLACE PROCEDURE
      api_delete_project(p_project_id integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $procedure$

    DECLARE
        _survey_id survey.survey_id%type;

    BEGIN
      for _survey_id in (select survey_id from survey where project_id = p_project_id) loop
        call api_delete_survey(_survey_id);
      end loop;

      delete from survey where project_id = p_project_id;
      delete from project_management_actions where project_id = p_project_id;
      delete from project_iucn_action_classification where project_id = p_project_id;
      delete from project_attachment_publish where project_attachment_id in (select project_attachment_id from project_attachment where project_id = p_project_id);
      delete from project_attachment where project_id = p_project_id;
      delete from project_report_author where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
      delete from project_report_publish where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
      delete from project_report_attachment where project_id = p_project_id;
      delete from project_participation where project_id = p_project_id;
      delete from project_metadata_publish where project_id = p_project_id;
      delete from grouping_project where project_id = p_project_id;
      delete from project where project_id = p_project_id;

      exception
        when others THEN
          raise;
      END;
    $procedure$;
  `);
}
