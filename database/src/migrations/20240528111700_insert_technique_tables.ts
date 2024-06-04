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
  SET SEARCH_PATH=biohub;
  ----------------------------------------------------------------------------------------
  --Adding more values to the method lookup table. 
  ----------------------------------------------------------------------------------------
    INSERT into method_lookup (name, description)
    VALUES
    (
        'Gill net',
        'A fishing net that hangs vertically in the water, trapping fish by their gills when they try to swim through its mesh openings.'
    ),
    (
        'Trawling',
        'Trawling is a fishing method where a large net is dragged along the sea floor or through the water column to catch fish and other marine organisms.'
    ),
    (
        'Trap net',
        'A trap net is a stationary fishing device consisting of a series of nets and funnels designed to guide and capture fish or other aquatic animals as they swim through it.'
    ),
    (
        'Rotary screw trap',
        'A rotary screw trap is a cylindrical, cone-shaped device used in rivers and streams to capture juvenile fish, particularly salmonids, as they are carried downstream by the current.'
    ),
    (
        'Handheld net',
        'Using a handheld net as a sampling method involves manually capturing aquatic organisms from water bodies for research or monitoring by sweeping or dipping the net through the water.'
    ),
    (
        'Angling',
        'Angling is a method of fishing that involves using a rod, line, and hook to catch fish.'
    ),
    (
        'Radio signal tower',
        'Using a radio signal tower as a sampling method involves tracking the movements and behavior of tagged animals by receiving signals from radio transmitters attached to the animals.'
    ),
    (
        'Radar',
        'Using radar as a sampling method involves detecting and tracking the movement and behavior of animals, particularly birds and bats, by emitting radio waves and analyzing the reflected signals.'
    ),
    (
        'Seine net',
        'A seine net is used in sample collection to capture fish and other aquatic organisms by encircling them with a vertical net wall, allowing for efficient population and biodiversity assessments in marine and freshwater environments.'
    ),
    (
        'Fish weir',
        'A fish weir is used in sample collection to guide and trap fish by directing their movement through a series of barriers or enclosures, enabling researchers to monitor fish populations and migrations in rivers and streams.'
    ),
    (
        'Fish wheel',
        'A fish wheel is used in sample collection to automatically capture fish as they swim into rotating baskets or compartments, allowing for continuous and passive monitoring of fish populations and migrations in rivers.'
    ),
    (
        'Egg mats',
        'Egg mats are used in sample collection to provide a substrate for fish eggs to adhere to, enabling researchers to monitor and assess spawning activities and egg deposition in aquatic environments.'
    ),
    (
        'Setline',
        'Setlines are used in sample collection to capture fish by baiting hooks attached to a long fishing line anchored in place, allowing for targeted sampling of specific fish species over a period of time.'
    ),
    (
        'Visual encounter',
        'An observer systematically watches and records species seen within a defined area or along a specific transect, often used to estimate population size and distribution.'
    );
    
  ----------------------------------------------------------------------------------------
  --Deleting and editing previous rows that no longer apply to the method_lookup table
  ----------------------------------------------------------------------------------------
    UPDATE survey_sample_method
    SET method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Visual encounter')
    WHERE method_lookup_id IN (SELECT method_lookup_id FROM method_lookup WHERE name IN ('Aerial transect', 'Ground transect', 'Aquatic transect', 'Underwater transect'));

    DELETE FROM method_lookup
    WHERE name IN ('Aerial transect', 'Ground transect', 'Aquatic transect', 'Underwater transect');  


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
      'Detection distance',
      'The maximum range at which a camera trap can detect motion to trigger a photo or video capture.',
      0,
      200,
      'meter'
    ),
    (
      'Field of view',
      'The extent of the observable area that a camera trap can capture.',
      0,
      360,
      'degrees'
    ),
    (
      'Length',
      'The measurement from the front to the back fo the device',
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
      'Radio frequency',
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
      'Range resolution',
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
    ),
    (
      'Surface area',
      'Width x Height of the device',
      0,
      1000,
      'meters squared'
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
      'Video resolution',
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
      'Trap entrance mechanism',
      'The design and type of door or opening (e.g., gravity-operated, spring-loaded) that allows animals to enter the trap but prevents them from escaping.'
    ),
    (
      'Trigger mechanism',
      'The mechanism (e.g., pressure plate, trip wire) that activates the closing of the entrance, ensuring the animal is securely captured once inside.'
    ),
    (
      'Trawl net type',
      'The specific design or style of the trawl net (e.g., bottom trawl, midwater trawl) tailored to target particular species and habitats.'
    ),
    (
      'Otter board type',
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
      'Substance used to attract and catch wildlife.'
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
    ),
    (
      'Net type',
      'The type of net used.'
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
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Images per trigger'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Trigger speed'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Detection distance'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Field of view'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Net size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Set depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Net size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Trawling depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Shelves'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Number of entrances'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Leader length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Rotary screw trap')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Handheld net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Handheld net')
      ), 
      (
       (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Hook size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Angling')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Radio frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Pulse repetition frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Range resolution'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Current'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Voltage'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Electrical frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Duty cycle'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Fish weir')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Surface area'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Egg mats')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Hook size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline')
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Number of hooks'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline')
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
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Image resolution'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Video resolution'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Infrared type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Trap entrance mechanism'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Trigger mechanism'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Net type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Otter board type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap')
      ),
      (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Type of trap cover'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Rotary screw trap')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Handheld net')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Angling tool'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Angling')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Bait'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Angling')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Fishing technique'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Angling')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Transmitter make and model'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Radar make and model'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Fish weir')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Anchored or floating'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Fish wheel')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Fish wheel')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Egg mats')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Substrate type'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Egg mats')
       ),
       (
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Material'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline')
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
