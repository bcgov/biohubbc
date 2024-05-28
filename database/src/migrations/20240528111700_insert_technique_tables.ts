import { Knex } from 'knex';

/**
 * Populate lookup values for the environment_quantitative, environment_qualitative, and
 * environment_qualitative_option tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Populate lookup tables.
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub, public;

    INSERT INTO technique_attribute_quantitative
      (
        name,
        description,
        min,
        max,
        unit
      )
    VALUES
      (
        'Height above ground',
        'The height above ground.',
        0,
        10000,
        'centimeter'
      ),
      (
        'Images per trigger',
        'The number of images captured per trigger.',
        0,
        10000,
        NULL
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO technique_attribute_qualitative
      (
        name,
        description
      )
    VALUES
      (
        'Model',
        'The model of the device.'
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO method_lookup_attribute_quantitative
      (
        technique_attribute_quantitative_id,
        method_lookup_id
      )
    VALUES
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height above ground'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO method_lookup_attribute_qualitative
      (
        technique_attribute_qualitative_id,
        method_lookup_id
      )
    VALUES
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Model'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO method_lookup_attribute_qualitative_option
      (
        technique_attribute_qualitative_id,
        name,
        description
      )
    VALUES
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Model'),
        'Reconyx Hyperfire',
        'Hyperfire manufactured by Reconyx.'
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Model'),
        'Bushnell',
        NULL
      );
    
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
