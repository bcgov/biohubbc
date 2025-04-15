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
    INSERT INTO technique_attribute_qualitative (name, description)
    VALUES ('Make','The vendor that makes the device.');

    INSERT INTO technique_attribute_qualitative_option (name, description)
    VALUES('Avid Identification Systems Inc.',''),
    ('Biomark',''),
    ('Identification Solutions',''),
    ('Oregon RFID',''),
    ('Trovan Ltd.',''),
    ('Eidap Inc.',''),
    ('Pacific Veterinary Sales','');

    INSERT INTO technique_attribute_quantitative (name, description)
    VALUES ('Device Model',''),
    ('Quiet Period'),
    ('Video Length per Trigger'),
    ('Trigger Sensitivity'),
    ('Trigger Timing');

    ')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
