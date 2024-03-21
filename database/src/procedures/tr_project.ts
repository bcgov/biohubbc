import { Knex } from 'knex';

/**
 * Inserts a trigger function that validates the start and end date of a project.
 *
 * - The project start date cannot be greater than the project end date.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    CREATE OR REPLACE FUNCTION biohub.tr_project()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      BEGIN
      -- Assert project start date is not greater than the end date, if the end date is not null.
      IF (new.end_date IS NOT NULL) THEN
        IF (new.end_date < new.start_date) THEN
          RAISE EXCEPTION 'The project start date cannot be greater than the end date.';
        END IF;
      END IF;
  
      RETURN new;
      END;
    $function$;

    DROP TRIGGER IF EXISTS project_val ON biohub.project;
    CREATE TRIGGER project_val BEFORE INSERT OR UPDATE ON biohub.project FOR EACH ROW EXECUTE PROCEDURE tr_project();
  `);
}
