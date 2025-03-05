import { Knex } from 'knex';

/**
 * Create triggers for validating survey habitat feature values.
 *
 * These ensure that the incoming habitat feature qualitative / quantitative values are valid for the
 * habitat_feature_type_id of the parent survey_habitat_feature record.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    -- Validate quantitative values
    CREATE OR REPLACE FUNCTION biohub.tr_survey_habitat_feature_quantitative_value_check()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY invoker
    AS
    $$
    BEGIN
      -- Check that the incoming habitat_feature_quantitative_definition_id exists in 
      -- the habitat_feature_type_quantitative_option table for the parent survey_habitat_feature_id
      IF EXISTS (
        SELECT
          1
        FROM
          habitat_feature_type_quantitative_option
        INNER JOIN
          survey_habitat_feature ON survey_habitat_feature.habitat_feature_type_id = habitat_feature_type_quantitative_option.habitat_feature_type_id
        WHERE
          survey_habitat_feature.survey_habitat_feature_id = NEW.survey_habitat_feature_id
        AND
          habitat_feature_type_quantitative_option.habitat_feature_quantitative_definition_id = NEW.habitat_feature_quantitative_definition_id
      ) THEN
        -- Found a matching record, return the new record
        RETURN NEW;    
      END IF;
      
      -- No matching record found, raise an exception
      RAISE EXCEPTION 'The habitat_feature_type_id of the incoming survey_habitat_feature_id does not support the incoming habitat_feature_quantitative_definition_id.';
    END;
    $$;

    -- Validate qualitative values
    CREATE OR REPLACE FUNCTION biohub.tr_survey_habitat_feature_qualitative_value_check()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY invoker
    AS
    $$
    BEGIN
      -- Check that the incoming habitat_feature_qualitative_definition_id exists in 
      -- the habitat_feature_type_qualitative_option table for the parent survey_habitat_feature_id
      IF EXISTS (
        SELECT
          1
        FROM
          habitat_feature_type_qualitative_option
        INNER JOIN
            survey_habitat_feature ON survey_habitat_feature.habitat_feature_type_id = habitat_feature_type_qualitative_option.habitat_feature_type_id
        WHERE
            survey_habitat_feature.survey_habitat_feature_id = NEW.survey_habitat_feature_id
        AND
            habitat_feature_type_qualitative_option.habitat_feature_qualitative_definition_id = NEW.habitat_feature_qualitative_definition_id
        LIMIT 1
      ) 
      THEN
        -- Found a matching record, return the new record
        RETURN NEW;
      END IF;

      -- No matching record found, raise an exception
      RAISE EXCEPTION 'The habitat_feature_type_id of the incoming survey_habitat_feature_id does not support the incoming habitat_feature_qualitative_definition_id.';    
    END;
    $$;

    DROP TRIGGER IF EXISTS tr_before_survey_habitat_feature_quantitative_value ON biohub.survey_habitat_feature_quantitative_value;
    CREATE TRIGGER tr_before_survey_habitat_feature_quantitative_value BEFORE INSERT OR UPDATE ON biohub.survey_habitat_feature_quantitative_value FOR EACH ROW EXECUTE FUNCTION biohub.tr_survey_habitat_feature_quantitative_value_check();

    DROP TRIGGER IF EXISTS tr_before_survey_habitat_feature_qualitative_value ON biohub.survey_habitat_feature_qualitative_value;
    CREATE TRIGGER tr_before_survey_habitat_feature_qualitative_value BEFORE INSERT OR UPDATE ON biohub.survey_habitat_feature_qualitative_value FOR EACH ROW EXECUTE FUNCTION biohub.tr_survey_habitat_feature_qualitative_value_check();
  `);
}
