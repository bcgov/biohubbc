import { Knex } from 'knex';

/**
 * Function Name: do_sample_period_dates_overlap
 *
 * Trigger Name: tr_before_do_sample_period_dates_overlap
 *
 * Affected Tables: Survey Sample Period
 *
 * Purpose: Checks if a new/updated survey sample period overlaps with an
 * existing survey sample period with the same method technique and sample site.
 *
 * Note: `COALESCE(start_date + start_time, start_date::timestamp)` is used
 * to generate timestamps safely while handling cases where `start_time` is null.
 *
 * Note: This will only detect the first overlapping sample period and will not
 * check for multiple overlapping sample periods.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    -- Function to check if a sample period overlaps with an existing sample period
    -- with the same method technique and sample site

    CREATE OR REPLACE FUNCTION biohub.do_sample_period_dates_overlap()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      DECLARE
        _sample_period biohub.survey_sample_period%rowtype;
      BEGIN

        -- Get the sample periods that overlap with the new sample period
        SELECT *
        FROM survey_sample_period
        WHERE survey_id = NEW.survey_id
        AND method_technique_id IS NOT DISTINCT FROM NEW.method_technique_id
        AND survey_sample_site_id IS NOT DISTINCT FROM NEW.survey_sample_site_id
        AND (
          (
            COALESCE(NEW.start_date + NEW.start_time, NEW.start_date::timestamp),
            COALESCE(NEW.end_date   + NEW.end_time,   NEW.end_date::timestamp)
          )
          OVERLAPS
          (
            COALESCE(start_date + start_time, start_date::timestamp),
            COALESCE(end_date   + end_time,   end_date::timestamp)
          )
        )
        INTO _sample_period
        LIMIT 1;

        IF found AND TG_OP = 'INSERT' THEN
          RAISE EXCEPTION 'Failed to create Survey sample period. The new sample period overlaps with an existing sample period (id: %).', _sample_period.survey_sample_period_id;
        END IF;

        IF found AND TG_OP = 'UPDATE' THEN
          RAISE EXCEPTION 'Failed to update Survey sample period. The new sample period overlaps with an existing sample period (id: %).', _sample_period.survey_sample_period_id;
        END IF;

        -- Return the new survey sample period record
        RETURN NEW;
      END;
    $function$;

    -- Drop the existing trigger, if one exists, and create a new one
    DROP TRIGGER IF EXISTS tr_before_do_sample_period_dates_overlap ON biohub.survey_sample_period;
    CREATE TRIGGER tr_before_do_sample_period_dates_overlap BEFORE INSERT OR UPDATE ON biohub.survey_sample_period FOR EACH ROW EXECUTE PROCEDURE do_sample_period_dates_overlap();
  `);
}
