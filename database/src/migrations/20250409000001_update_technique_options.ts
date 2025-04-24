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
    ('Quiet Period Duration'),
    ('Video Length per Trigger'),
    ('Trigger Timing');
    ')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
