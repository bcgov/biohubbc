import { Knex } from 'knex';

/**
 * Update method_lookup values and associated attributes to accomodate spi-migration data and for other future data.
 *
 * This migration file inserts or updates values into method lookup table, technique attribute qual and quant tables,
 * method lookup quant and qual and qualitative options and attractants
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
    ALTER TABLE method_lookup ADD COLUMN record_end_date;
    ALTER TABLE method_lookup ADD COLUMN record_effective_date DEFAULT now();

    COMMENT ON COLUMN method_lookup.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup.record_effective_date IS 'Record level effective date.';

    CREATE OR REPLACE VIEW biohub_dapi_v1.method_lookup AS SELECT * FROM biohub.method_lookup;

    ----------------------------------------------------------------------------------------
    -- Insert new method lookup values necessary for the SPI ETL
    ----------------------------------------------------------------------------------------
    INSERT INTO method_lookup (name, description, record_end_date)
    VALUES
        ('Drone', 'Detecting species using cameras or sensors mounted to a drone.', NULL),
        ('Hair snag', 'Detecting species using barbs or similar devices that collect species hair or fur.', NULL),
        -- Add an end date to filter undetermined from the list of options that users can pick; undetermined should only be used for the SPI ETL
        ('Undetermined', 'Insufficient information to determine the method.', now()),
        ('Audio encounter', 'Detecting species by songs, calls, or other noises made by the species.', NULL);

    ----------------------------------------------------------------------------------------
    -- Insert quantitative attributes for the new method lookup values
    ----------------------------------------------------------------------------------------
    INSERT INTO technique_attribute_quantitative (name, description)
    VALUES
        ('Altitude', 'Elevation above sea level.');

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
        );


    INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
    VALUES
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Trap type' AND ml.name = 'Hair snag'
            ),
            'Barbed wire',
            'A metal wire used to collect hair from passing species.'
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
    -- Update the radio tower method lookup option
    ----------------------------------------------------------------------------------------
    UPDATE method_lookup
    SET name = 'Radio receiver or transmitter',
        description = 'Detecting species using radio waves.'
    WHERE name = 'Radio signal tower';

    UPDATE technique_attribute_quantitative
    SET description = 'The frequency at which radio waves are transmitted or received.'
    WHERE name = 'Radio frequency';

    INSERT INTO technique_attribute_qualitative (name, description)
    VALUES ('Station type', 'The type of station used to transmit or receive signals.');

    INSERT INTO method_lookup_attribute_qualitative (technique_attribute_qualitative_id, method_lookup_id)
    VALUES (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Station type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio receiver or transmitter')
    );

    INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
    VALUES
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Station type' AND ml.name = 'Radio receiver or transmitter'
            ),
            'Receiver',
            'A device used to receive radio signals from passing species.'
        ),
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Station type' AND ml.name = 'Radio receiver or transmitter'
            ),
            'Transmitter',
            'A device used to transmit radio signals to detect passing species.'
        );

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
