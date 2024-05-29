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
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
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
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO method_lookup_attribute_qualitative_option
      (
        method_lookup_attribute_qualitative_id,
        name,
        description
      )
    VALUES
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        ),
        'Reconyx Hyperfire',
        'Hyperfire manufactured by Reconyx.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        ),
        'Bushnell',
        NULL
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO attractant_lookup
      (
        name,
        description
      )
    VALUES
      (
        'Light',
        'A light used to attract species.'
      ),
      (
        'Call playback',
        'An audio recording of a species used to attract species.'
      );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
