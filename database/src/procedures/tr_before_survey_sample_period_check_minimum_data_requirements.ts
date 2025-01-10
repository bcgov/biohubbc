import { Knex } from 'knex';

/**
 * Function Name: check_survey_sample_period_minimum_data_requirements
 *
 * Trigger Name: tr_before_survey_sample_period_check_minimum_data_requirements
 *
 * Affected Tables: survey_sample_period
 *
 * Purpose: Asserts that the incoming record meets the minimum data requirements for the survey_sample_period table.
 * Specifically, checks that at least one of the following columns is not null:
 * - survey_sample_site_id
 * - method_technique_id
 * - start_date, end_date (both must be not null)
 *
 * Note: The reason this trigger is necessary is because all of the above columns can be null, by design, but not all of
 * them at the same time. If all of them were null, then the record would contain no useful information.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    CREATE OR REPLACE FUNCTION biohub.check_survey_sample_period_minimum_data_requirements()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      BEGIN
        IF ((NEW.survey_sample_site_id IS NULL) AND (NEW.method_technique_id IS NULL) AND (NEW.start_date IS NULL OR NEW.end_date IS NULL)) THEN
          RAISE EXCEPTION 'At least one of survey_sample_site_id, method_technique_id, or both start_date and end_date must not be null';
        END IF;

        RETURN NEW;
      END;
    $function$;

    -- Drop the existing trigger, if one exists, and create a new one
    DROP TRIGGER IF EXISTS tr_before_survey_sample_period_check_minimum_data_requirements ON biohub.survey_sample_period;
    CREATE TRIGGER tr_before_survey_sample_period_check_minimum_data_requirements BEFORE INSERT OR UPDATE ON biohub.survey_sample_period FOR EACH ROW EXECUTE PROCEDURE check_survey_sample_period_minimum_data_requirements();
  `);
}
