import { Knex } from 'knex';

/**
 * UPDATES TO EXISTING CONCEPTS:
 *
 * - Adds pit reader station as a sampling method
 * - Adds camera trap and pit tag reader attributes
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ---------------------------------------------------------------------------------------------------
    ---------------------- Add pit tag as a sampling method option ------------------------------------
    ---------------------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    INSERT INTO method_lookup (name, description, record_effective_date)
    VALUES ('Pit Reader Station','Recording an observation of a species through its interaction with a pit tag reader', now());

    --------------------------------------------------------------------------------------------------
    --------------------- Insert attributes for camera trap and pit readers --------------------------
    --------------------------------------------------------------------------------------------------

    INSERT INTO technique_attribute_quantitative (name, description)
    VALUES 
    ('Quiet Period Duration', 'The set minimum time span permitted between the end of a recording event and the triggering of a subsequent recording event.'),
    ('Video Length per Trigger', 'The set minimum length of video time, in seconds, that a camera should record when triggered.'),
    ('Trigger Timing','The set time span between automated regularly timed recording events.');

    INSERT INTO method_lookup_attribute_quantitative (technique_attribute_quantitative_id, method_lookup_id, min, max, unit)
    VALUES
        (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Quiet Period Duration'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
            0,
            10000, 
            'seconds'
        ),
        (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Video Length per Trigger'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
            0, 
            10000, 
            'seconds'
        ),
         (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Trigger Timing'),
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
