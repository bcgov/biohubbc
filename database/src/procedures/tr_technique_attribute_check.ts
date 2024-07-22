import { Knex } from 'knex';

/**
 * Create triggers for validating technique attributes.
 *
 * These ensure that the incoming attribute is valid for the method_lookup_id.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    -- Validate qualitative attributes
    CREATE OR REPLACE FUNCTION biohub.tr_technique_qual_attribute_check()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY invoker
    AS
    $$
    BEGIN
      IF NOT EXISTS (
        SELECT
          1
        FROM
          method_technique mt
        INNER JOIN 
          method_lookup_attribute_qualitative mlaq ON mt.method_lookup_id = mlaq.method_lookup_id
        WHERE
          mt.method_technique_id = NEW.method_technique_id
        AND
          mlaq.method_lookup_attribute_qualitative_id = NEW.method_lookup_attribute_qualitative_id
      ) THEN
          RAISE EXCEPTION 'The method_lookup_id does not support the incoming attribute.';
      END IF;
      RETURN NEW;
    END;
    $$;

    -- Validate quantitative attributes
    CREATE OR REPLACE FUNCTION biohub.tr_technique_quant_attribute_check()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY invoker
    AS
    $$
    BEGIN
      IF NOT EXISTS (
        SELECT
          1
        FROM
          method_technique mt
        INNER JOIN 
          method_lookup_attribute_quantitative mlaq ON mt.method_lookup_id = mlaq.method_lookup_id
        WHERE
          mt.method_technique_id = NEW.method_technique_id
        AND
          mlaq.method_lookup_attribute_quantitative_id = NEW.method_lookup_attribute_quantitative_id
      ) THEN
          RAISE EXCEPTION 'The method_lookup_id does not support the incoming attribute.';
      END IF;
      RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS technique_qual_attribute_val ON biohub.method_technique_attribute_qualitative;
    CREATE TRIGGER technique_qual_attribute_val BEFORE INSERT OR UPDATE ON biohub.method_technique_attribute_qualitative FOR EACH ROW EXECUTE FUNCTION biohub.tr_technique_qual_attribute_check();

    DROP TRIGGER IF EXISTS technique_quant_attribute_val ON biohub.method_technique_attribute_quantitative;
    CREATE TRIGGER technique_quant_attribute_val BEFORE INSERT OR UPDATE ON biohub.method_technique_attribute_quantitative FOR EACH ROW EXECUTE FUNCTION biohub.tr_technique_quant_attribute_check();
  `);
}
