import { Knex } from 'knex';

/**
 * Update method_lookup vlaues and associated attributes to accomodate spi-migration data and for other future data. 
 *
 * This migration file updates  values into method lookup table, technique attribute qual and quant tables,
 * method lookup quant and qual and qualitative options and attractants
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  SET SEARCH_PATH=biohub, public;

----------------------------------------------------------------------------------------
---------------------------------Insert new ml values--------------------------------------
----------------------------------------------------------------------------------------
-- In this sesction. I have inserted the method lookup values for drone , hair snag and undetermined. 
-- along with all the appropriate attributes and units.
----------------------------------------------------------------------------------------

-- Insert into method_lookup table
INSERT INTO method_lookup (name, description)
VALUES
    ('Drone', 'Using drones for ecological data collection involves capturing high-resolution imagery and spatial data to monitor wildlife and habitats efficiently and non-invasively.'),
    ('Hair snag', 'Hair snag involves collecting hair samples from wildlife using specially designed devices to non-invasively monitor species presence, genetic diversity, and health.'),
    ('Undetermined', 'Method of data collection not specified or insufficient data to determine the method.'),
    ('Audio encounter', 'A method of collecting ecological data by recording or listening to sounds in the environment to monitor and identify species presence, behavior, and interactions.');

-- Insert into technique_attribute_quantitative table
INSERT INTO technique_attribute_quantitative (name, description)
VALUES
    ('Altitude', 'The elevation above sea level at which ecological data is collected, influencing environmental conditions and species distribution.'),
    ('Height of snag', 'The vertical distance from the ground to the placement of the hair snagging device, which can influence the likelihood of collecting hair samples from different species.'),
    ('Number of snags', 'The total count of hair snagging devices deployed within a study area, used to estimate sampling effort and potential data coverage.'),
    ('Audio frequency range','The range of frequencies captured during the audio encounter, important for detecting different species vocalizations, from low-frequency calls to high-pitched signals.');

----------------------------------------------------------------------------------------
--Inserting quant attributtes for all the above. 
----------------------------------------------------------------------------------------


INSERT INTO method_lookup_attribute_quantitative (technique_attribute_quantitative_id, method_lookup_id, min, max, unit)
VALUES
    (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Altitude'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Drone'),
        0, 10000, 'meter'
    ),
    (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height of snag'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag'),
        0, 1000, 'centimeter'
    ),
    (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Number of snags'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag'),
        0, 100, 'count'
    ),
    (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Audio frequency range'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Audio encounter'),
        0, 20000, 'Hz'
    );


INSERT INTO technique_attribute_qualitative (name, description)
VALUES
    ('Drone model', 'The specific make and model of the drone used in ecological studies, important for documenting the capabilities and limitations of the equipment.'),
    ('Drone camera type', 'The type of camera mounted on the drone, such as RGB, thermal, or multispectral, which determines the kind of data captured during ecological surveys.'),
    ('Hair snag trap type', 'The specific design or material of the hair snagging device, including options like barbed wire, adhesive strips, or brush stations, which influence the effectiveness of sample collection.'),
    ('Hair snag substrate type', 'The type of surface or material on which the hair snag device is placed, such as soil, rock, or vegetation, affecting the likelihood of successful sample collection.'),
    ('Hair snag material', 'Material the snag is comprised of.'),
    ('Audio device type', 'The specific tool or equipment used to capture or detect sounds during an audio encounter, including handheld recorders, fixed microphones, parabolic microphones, or unaided human listening.');

-- Insert into method_lookup_attribute_qualitative table
INSERT INTO method_lookup_attribute_qualitative (technique_attribute_qualitative_id, method_lookup_id)
VALUES
    (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Drone model'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Drone')
    ),
    (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Drone camera type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Drone')
    ),
    (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Hair snag trap type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag')
    ),
    (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Hair snag substrate type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag')
    ),
        (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Hair snag material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Hair snag')
    ),
        (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Audio device type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Audio encounter')
    );


INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'DJI',
        'A leading Chinese manufacturer known for consumer and professional drones like the Phantom, Mavic, and Matrice series.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'Parrot',
        'A French company known for its Bebop and Anafi drone models.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'Yuneec',
        'A Chinese company that offers drones such as the Typhoon and H520 models.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'Autel Robotics',
        'An American company known for the EVO series drones.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'Skydio',
        'An American manufacturer recognized for its autonomous drones like the Skydio 2.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone model' AND ml.name = 'Drone'
        ),
        'Other',
        'Other Manufacturer that is not listed. Please consider recording the manufacturer details in the technique description.'
    );


INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone camera type' AND ml.name = 'Drone'
        ),
        'RGB camera',
        'A standard color camera that captures high-resolution images and videos in the visible light spectrum, commonly used for general photography and videography.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone camera type' AND ml.name = 'Drone'
        ),
        'Thermal camera',
        'A camera that detects infrared radiation and captures temperature variations, useful for monitoring wildlife, detecting heat sources, and conducting search and rescue operations.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone camera type' AND ml.name = 'Drone'
        ),
        'Multispectral camera',
        'A camera that captures data across multiple wavelengths, including visible and near-infrared, enabling detailed analysis of vegetation health, water quality, and land use.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Drone camera type' AND ml.name = 'Drone'
        ),
        'LiDAR',
        'A remote sensing technology that uses laser pulses to create precise 3D models of landscapes, vegetation, and structures, often used in topographic mapping and forestry.'
    );
-- Insert qualitative options for Hair snag trap type
INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag trap type' AND ml.name = 'Hair snag'
        ),
        'Barbed wire',
        'A trap type using strands of barbed wire to snag hair samples from passing animals, commonly used in large mammal studies.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag trap type' AND ml.name = 'Hair snag'
        ),
        'Adhesive Strips',
        'Sticky strips placed strategically to capture hair samples from animals as they brush against them, useful for small to medium-sized mammals.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag trap type' AND ml.name = 'Hair snag'
        ),
        'Brush Station',
        'A trap setup involving brushes that collect hair samples as animals rub against them, often used for non-invasive sampling of species.'
    );
-- Insert qualitative options for Hair snag substrate type
INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag substrate type' AND ml.name = 'Hair snag'
        ),
        'Soil',
        'The trap is placed on or near the soil surface, targeting ground-dwelling species and those with low-ranging movements.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag substrate type' AND ml.name = 'Hair snag'
        ),
        'Rock',
        'The trap is set on or near rocky terrain, suitable for species that inhabit or traverse rocky landscapes.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag substrate type' AND ml.name = 'Hair snag'
        ),
        'Vegetation',
        'The trap is situated within or near vegetation, ideal for capturing samples from species that frequent wooded or bushy areas.'
    );

    -- Insert qualitative options for Hair snag material
INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag material' AND ml.name = 'Hair snag'
        ),
        'Metal',
        'The trap or snagging device is made of metal, providing durability and resistance to environmental conditions.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag material' AND ml.name = 'Hair snag'
        ),
        'Plastic',
        'The trap is constructed from plastic, offering a lightweight and often more affordable option for various ecological studies.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Hair snag material' AND ml.name = 'Hair snag'
        ),
        'Natural Fiber',
        'The trap is made from natural fibers, blending into the environment and minimizing impact on the ecosystem.'
    );

    INSERT INTO method_lookup_attribute_qualitative_option (method_lookup_attribute_qualitative_id, name, description)
VALUES
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Audio device type' AND ml.name = 'Audio encounter'
        ),
        'Handheld Recorder',
        'A portable device used for capturing audio in the field, offering flexibility but potentially influenced by the operators movements.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Audio device type' AND ml.name = 'Audio encounter'
        ),
        'Fixed Microphone',
        'A stationary microphone placed in a specific location to continuously capture audio, often used for long-term monitoring.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Audio device type' AND ml.name = 'Audio encounter'
        ),
        'Parabolic Microphone',
        'A specialized microphone that uses a parabolic reflector to capture distant sounds with high directionality, ideal for isolating specific vocalizations.'
    ),
    (
        (
            SELECT method_lookup_attribute_qualitative_id 
            FROM method_lookup_attribute_qualitative mlaq 
            INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
            INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
            WHERE taq.name = 'Audio device type' AND ml.name = 'Audio encounter'
        ),
        'Unaided Ear',
        'Direct human auditory observation without the use of recording devices, relying on the observers hearing to detect and identify sounds in the environment.'
    );

----------------------------------------------------------------------------------------
------------------------------Update Radar Tower Entry.---------------------------------
----------------------------------------------------------------------------------------
--In this section, I updated the previous value of radio signal tower to incorporate handheld radios
--Broadening the higher classifaction and creating attributes for the user to refine their modality as an attribute


    UPDATE method_lookup
    SET name = 'Radio',
        description = 'The use of radio waves as a method to track, monitor, or communicate with tagged animals or devices, including handheld and other radio wave-based equipment.'
    WHERE name = 'Radio signal tower';

    UPDATE technique_attribute_quantitative
    SET description = 'Frequency refers to the specific radio wave band at which the transmitter on the animal and the receiver communicate to ensure accurate tracking and data transmission.'
    WHERE name = 'Radio frequency';

    INSERT INTO technique_attribute_qualitative
    (name, description)
        VALUES
            ('Modality', 'The form which radio technology is utilized for recording ecological data, such as handheld radios or radio towers.');


    INSERT INTO method_lookup_attribute_qualitative
    (technique_attribute_qualitative_id, method_lookup_id)
        VALUES
        (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Modality'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio'));

    INSERT INTO method_lookup_attribute_qualitative_option
    (method_lookup_attribute_qualitative_id, name, description)
        VALUES
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Modality' AND ml.name = 'Radio'
            ),
            'Handheld radio',
            'A portable, handheld radio device used for communication and data transmission in ecological studies.'
    );


    INSERT INTO method_lookup_attribute_qualitative_option
    (method_lookup_attribute_qualitative_id, name, description)
        VALUES
        (
            (
                SELECT method_lookup_attribute_qualitative_id 
                FROM method_lookup_attribute_qualitative mlaq 
                INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
                INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
                WHERE taq.name = 'Modality' AND ml.name = 'Radio'
            ),
            'Radio tower',
            'A stationary structure equipped with a radio transmitter and receiver used for long-range data communication in ecological monitoring.'
    );
      
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
