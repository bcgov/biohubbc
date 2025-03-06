import { Knex } from 'knex';

/**
 * Update method_lookup values and associated attributes for SPI ETL.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Allow method lookup options to be soft deleted
    ----------------------------------------------------------------------------------------
    ALTER TABLE method_lookup ADD COLUMN record_end_date DATE;
    ALTER TABLE method_lookup ADD COLUMN record_effective_date DATE DEFAULT now();

    COMMENT ON COLUMN method_lookup.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup.record_effective_date IS 'Record level effective date.';

    CREATE OR REPLACE VIEW biohub_dapi_v1.method_lookup AS SELECT * FROM biohub.method_lookup;

    ----------------------------------------------------------------------------------------
    -- Insert new method lookup values
    ----------------------------------------------------------------------------------------
    INSERT INTO method_lookup (name, description)
    VALUES
        ('Drone', 'Detecting species using cameras or sensors mounted to a drone.'),
        ('Hair snag', 'Detecting species using barbs or similar devices that collect species hair or fur.'),
        ('Undetermined', 'Insufficient information to determine the method.'),
        ('Audio encounter', 'Detecting species by songs, calls, or other noises made by the species.');

    ----------------------------------------------------------------------------------------
    -- Insert quantitative attributes for the new method lookup values
    ----------------------------------------------------------------------------------------
    INSERT INTO technique_attribute_quantitative (name, description)
    VALUES ('Altitude', 'Elevation above sea level.');

    INSERT INTO method_lookup_attribute_quantitative (technique_attribute_quantitative_id, method_lookup_id, min, max, unit)
    VALUES
        (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Altitude'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Drone'),
            0,
            10000, 
            'meter'
        ),
        (
            (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height above ground'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag'),
            0, 
            1000, 
            'centimeter'
        );

    ----------------------------------------------------------------------------------------
    -- Insert qualitative attributes for the new method lookup values
    ----------------------------------------------------------------------------------------
    INSERT INTO technique_attribute_qualitative (name, description)
    VALUES
        ('Camera type', 'The type of camera mounted on the drone, such as RGB, thermal, or multispectral.'),
        ('Trap type', 'The specific design or material of the hair snagging device.');

    INSERT INTO method_lookup_attribute_qualitative (technique_attribute_qualitative_id, method_lookup_id)
    VALUES
        (
            (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Camera type'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Drone')
        ),
        (
            (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Trap type'),
            (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag')
        );

    INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
    VALUES
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Camera type' AND ml.name = 'Drone'
            ),
            'RGB',
            'Captures images in the visible light spectrum using three color channels (red, green, blue).'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Camera type' AND ml.name = 'Drone'
            ),
            'Thermal',
            'Captures infrared radiation emitted by objects.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Camera type' AND ml.name = 'Drone'
            ),
            'Multispectral',
            'Captures data across a limited number of spectral bands (typically between 3 and 15 bands) in the electromagnetic spectrum.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Camera type' AND ml.name = 'Drone'
            ),
            'Hyperspectral',
            'Captures data across numerous spectral bands, providing continuous coverage of a broad spectral range.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Camera type' AND ml.name = 'Drone'
            ),
            'LiDAR',
            'Uses laser pulses to measure distances to the Earth''s surface and other objects.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Trap type' AND ml.name = 'Hair snag'
            ),
            'Barbed wire',
            'A barbed wire used to collect hair from passing species.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Trap type' AND ml.name = 'Hair snag'
            ),
            'Adhesive strip',
            'A sticky strip used to collect hair from passing species.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Trap type' AND ml.name = 'Hair snag'
            ),
            'Brush',
            'A brush used to collect hair from passing species.'
        );

    ----------------------------------------------------------------------------------------
    -- Drop the radio signal tower option and reassign existing data to the radar option
    ----------------------------------------------------------------------------------------
    
    -- Reassign existing attributes for radio signal tower to the radar option
    UPDATE method_technique
    SET method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
    WHERE method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower');

    UPDATE method_lookup_attribute_qualitative
    SET method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
    WHERE method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower');

    UPDATE method_lookup_attribute_quantitative
    SET method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
    WHERE method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower');
    
    DELETE FROM method_lookup
    WHERE name = 'Radio signal tower';

    UPDATE technique_attribute_quantitative
    SET name = 'Frequency', 
        description = 'The frequency at which a signal is transmitted or received.'
    WHERE name = 'Radio frequency';

    ----------------------------------------------------------------------------------------
    -- Insert new subcount sign option
    ----------------------------------------------------------------------------------------
    INSERT INTO biohub.observation_subcount_sign (name, description)
    VALUES ('Rub or scratch mark', 'A rubbing or scratch mark created by a species');
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
