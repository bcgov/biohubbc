import { Knex } from 'knex';

/**
 * Inserts a trigger function that validates the start and end date of a survey.
 *
 * - The survey start date cannot be greater than the survey end date.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    CREATE OR REPLACE FUNCTION biohub.tr_survey()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      BEGIN
      -- Assert survey start date is not greater than the end date, if the end date is not null.
      IF (new.end_date IS NOT NULL) THEN
        IF (new.end_date < new.start_date) THEN
          RAISE EXCEPTION 'The survey start date cannot be greater than the end date.';
        END IF;
      END IF;

      RETURN new;
      END;
    $function$;

    DROP TRIGGER IF EXISTS survey_val ON biohub.survey;
    CREATE TRIGGER survey_val BEFORE INSERT OR UPDATE ON biohub.survey FOR EACH ROW EXECUTE PROCEDURE tr_survey();
  `);
}
