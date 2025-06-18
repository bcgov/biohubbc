import { Knex } from 'knex';

/**
 * - Adds pit reader station as a sampling method
 * - Adds camera trap and pit tag reader attributes
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ---------------------------------------------------------------------------------------------------
    ---------------------- Add pit tag as a sampling method option ------------------------------------
    ---------------------------------------------------------------------------------------------------

    INSERT INTO method_lookup (name, description, record_effective_date)
    VALUES ('PIT Tag Reader', 'Detecting species using a PIT tag reader', now());

    --------------------------------------------------------------------------------------------------
    --------------------- Insert attributes for camera trap and pit readers --------------------------
    --------------------------------------------------------------------------------------------------

    INSERT INTO technique_attribute_quantitative (name, description)
    VALUES 
    ('Quiet Period Duration', 'The delay time between consecutive images.');

    INSERT INTO method_lookup_attribute_quantitative (technique_attribute_quantitative_id, method_lookup_id, min, max, unit)
    VALUES
        (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Quiet Period Duration'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
            0,
            10000, 
            'seconds'
        );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
