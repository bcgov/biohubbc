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
    -- Edit enum list
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub, public;

    BEGIN;
    ALTER TYPE environment_unit ADD VALUE 'seconds';
    ALTER TYPE environment_unit ADD VALUE 'meters squared';
    ALTER TYPE environment_unit ADD VALUE 'count';
    ALTER TYPE environment_unit ADD VALUE 'MHz';
    ALTER TYPE environment_unit ADD VALUE 'Hz';
    ALTER TYPE environment_unit ADD VALUE 'amps';
    ALTER TYPE environment_unit ADD VALUE 'volts';


    COMMIT;


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
    ),
    (
      'Trigger speed',
      'The time it takes for a camera trap to capture an image or start recording after detecting motion.',
      0,
      100,
      'seconds'
    ),
    (
      'Detection Distance',
      'The maximum range at which a camera trap can detect motion to trigger a photo or video capture.',
      0,
      200,
      'meter'
    ),
    (
      'Field of View',
      'The extent of the observable area that a camera trap can capture.',
      0,
      360,
      'degrees'
    ),
    (
      'Length',
      'The measurement from the front opening to the back end of the trap, determining the horizontal space available for capturing and containing wildlife.',
      0,
      25,
      'meter'
    ),
    (
      'Width',
      'The measurement across the trap from one side to the other, determining the horizontal space available for capturing and containing wildlife.',
      0,
      25,
      'meter'
    ),
    (
      'Height',
      'The measurement from the bottom to the top of the trap, determining the vertical space available for capturing and containing wildlife.',
      0,
      25,
      'meter'
    ),
    (
      'Net size',
      'The overall dimensions calculated as length times height, determining the total area available for capturing aquatic species.',
      0,
      100000,
      'meters squared'
    ),
    (
      'Mesh size',
      'The measurement of the distance between two opposite knots when the net is pulled taut, determining the maximum opening for capturing species.',
      0,
      100,
      'centimeter'
    ),
    (
      'Set depth',
      'The vertical distance from the water surface to the position where the net is deployed, indicating how deep the net is placed in the water column.',
      0,
      1500,
      'meter'
    ),
    (
      'Trawling depth',
      'The vertical distance from the water surface to the position where the trawl net is towed, indicating the depth at which the net is operating in the water column.',
      0,
      1500,
      'meter'
    ),
    (
      'Shelves',
      'The number of horizontal tiers or pockets in the net, which help entangle and hold captured animals.',
      0,
      20,
      'count'
    ),
    (
      'Depth',
      'The vertical measurement from the top to the bottom.',
      0,
      100,
      'meter'
    ),
    (
      'Diameter of opening',
      'The size of the entry point of the capture mechanism.',
      0,
      100,
      'meter'
    ),
    (
      'Number of entrances',
      'The count of entry points into the capture mechanism.',
      0,
      100,
      'count'
    ),
    (
    'Leader length',
    'The length of the guiding structure that directs fish into the trap net.',
    0,
    100,
    'meter'
    ),
    (
      'Hook size',
      'Numerical scale where smaller numbers indicate larger hooks based on the gap and shank length.',
      1,
      32,
      'count'
    ),
    (
      'Radio Frequency',
      'Frequency refers to the specific radio wave band at which the transmitter on the animal and the receiver on the tower communicate to ensure accurate tracking and data transmission.',
      100,
      450,
      'MHz'
    ),
    (
      'Pulse repetition frequency',
      'The number of radar pulses transmitted per second, measured in hertz (Hz), and is a key parameter that affects the radar''s range resolution and target detection capabilities.',
      0,
      100000,
      'Hz'
    ),
    (
      'Range Resolution',
      'Measured in meters and indicates the minimum distance between two distinct targets that the radar can differentiate. It is determined by the radar''s pulse width, with shorter pulses providing better (smaller) range resolution.',
      0,
      1000,
      'meter'
    ),
    (
      'Current',
      'Current is the flow of electric charge through a conductor, typically measured in amperes.',
      0,
      10,
      'amps'
    ),
    (
      'Voltage',
      'Voltage is the electric potential difference between two points in a circuit which drives the flow of electric current.',
      0,
      1000,
      'volts'
    ),
    (
      'Electrical frequency', 
      'The frequency of the electrical pulses, measured in Hz.',
      0,
      1000,
      'Hz'
    ),
    (
      'Duty cycle',
      'The duty cycle is measured as a percentage (%), representing the proportion of time the electrical current is active (on) versus the total time of the cycle.',
      0,
      100,
      'percent'
    ),
    (
      'Number of hooks',
      'The number of hooks included in the device',
      0,
      10000,
      'count'
    );

INSERT INTO technique_attribute_qualitative
    (
      name,
      description
    )
  VALUES
    (
      'Model',
      'The model of the device.'
    ),
    (
      'Image resolution',
      'The level of detail captured in a photo.'
    ),
    (
      'Video Resolution',
      'The clarity and detail of recorded video footage.'
    ),
    (
      'Infrared type',
      'The kind of infrared illumination used for night-time images such as low-glow no-glow or white flash which affects visibility to wildlife and image quality in darkness.'
    ),
    (
      'Material',
      'The type of material (e.g., metal, plastic, wood) used to construct the item, affecting its durability and suitability for different environments.'
    ),
    (
      'Trap Entrance Mechanism',
      'The design and type of door or opening (e.g., gravity-operated, spring-loaded) that allows animals to enter the trap but prevents them from escaping.'
    ),
    (
      'Trigger Mechanism',
      'The mechanism (e.g., pressure plate, trip wire) that activates the closing of the entrance, ensuring the animal is securely captured once inside.'
    ),
    (
      'Trawl Net type',
      'The specific design or style of the trawl net (e.g., bottom trawl, midwater trawl) tailored to target particular species and habitats.'
    ),
    (
      'Otter Board type',
      'The type of otter boards (e.g., rectangular, oval) used to keep the trawl net open horizontally while it is being towed, affecting the efficiency and spread of the net.'
    ),
    (
      'Orientation',
      'The direction in which a mist net is positioned relative to cardinal points (e.g., north-south, east-west), influencing capture success based on factors like prevailing winds and animal movement patterns.'
    ),
    (
      'Type of trap cover',
      'The design and material of any cover used to protect the trap (e.g., to prevent rainwater entry or minimize disturbance), impacting the trap functionality and animal welfare.'
    ),
    (
      'Angling tool',
      'Device or implement used in the sport of fishing, such as a rod, pole, or lure, designed to assist in the capture of fish.'
    ),
    (
      'Bait',
      'Substance used to attract and catch fish, typically consisting of natural or artificial materials such as worms, insects, small fish, or specially designed synthetic lures.'
    ),
    (
      'Transmitter make and model',
      'The specific manufacturer and the particular design or version of the device, which determine its features, capabilities, and compatibility with other equipment in wildlife tracking systems.'
    ),
    (
      'Radar make and model',
      'The specific brand and version of the radar equipment used, which determine its technical specifications, capabilities, and suitability for tracking and monitoring wildlife.'
    ),
    (
      'Fishing technique',
      'The specific method or approach used in fishing, such as float fishing, lure fishing, or bottom fishing, each involving distinct equipment and strategies to catch fish.'
    ),
    (
      'Anchored or floating',
      'Whether or not the device is anchored or floating.'
    ),
    (
      'Substrate type',
      'Substrate type refers to the material on which the egg mats are placed, affecting the adherence and development of fish or amphibian eggs.'
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
      ),
      (
          (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Image Resolution'),
          (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera Trap')
      ),
      (
          (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Video Resolution'),
          (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera Trap')
      ),
      (
          (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Infrared type'),
          (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera Trap')
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
