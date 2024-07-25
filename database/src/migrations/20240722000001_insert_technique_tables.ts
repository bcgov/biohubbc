import { Knex } from 'knex';

/**
 * Populate lookup values for the environment_quantitative, environment_qualitative, and
 * environment_qualitative_option tables.
 *
 * This migration file inserts values into method lookup table, technique attribute qual and quant tables,
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
  --Deleting and editing previous rows that no longer apply to the method_technique table
  ----------------------------------------------------------------------------------------
    UPDATE method_technique
    SET method_lookup_id = (SELECT method_lookup_id FROM method_lookup WHERE name = 'Visual encounter')
    WHERE method_lookup_id IN (SELECT method_lookup_id FROM method_lookup WHERE name IN ('Aerial transect', 'Ground transect', 'Aquatic transect', 'Underwater transect'));

    DELETE FROM method_lookup
    WHERE name IN ('Aerial transect', 'Ground transect', 'Aquatic transect', 'Underwater transect');  


    ----------------------------------------------------------------------------------------
    -- Edit enum list
    ----------------------------------------------------------------------------------------

    ALTER TYPE environment_unit ADD VALUE 'seconds';
    ALTER TYPE environment_unit ADD VALUE 'meters squared';
    ALTER TYPE environment_unit ADD VALUE 'count';
    ALTER TYPE environment_unit ADD VALUE 'GHz';
    ALTER TYPE environment_unit ADD VALUE 'Hz';
    ALTER TYPE environment_unit ADD VALUE 'amps';
    ALTER TYPE environment_unit ADD VALUE 'volts';
    ALTER TYPE environment_unit ADD VALUE 'megapixels';
    COMMIT;

    ----------------------------------------------------------------------------------------
    -- Populate lookup tables.
    ----------------------------------------------------------------------------------------

    INSERT INTO technique_attribute_quantitative
    (
      name,
      description
    )
    VALUES
    (
      'Height above ground',
      'The height above ground.'),
    (
      'Images per trigger',
      'The number of images captured per trigger.'),
    (
      'Trigger speed',
      'The time it takes for a camera trap to capture an image or start recording after detecting motion.'),
    (
      'Detection distance',
      'The maximum range at which a camera trap can detect motion to trigger a photo or video capture.'),
    (
      'Field of view',
      'The extent of the observable area that a camera trap can capture.'),
    (
      'Length',
      'The measurement from the front to the back fo the device'),
    (
      'Width',
      'The measurement across the trap from one side to the other, determining the horizontal space available for capturing and containing wildlife.'),
    (
      'Height',
      'The measurement from the bottom to the top of the trap, determining the vertical space available for capturing and containing wildlife.'),
    (
      'Net size',
      'The overall dimensions calculated as length times height, determining the total area available for capturing aquatic species.'),
    (
      'Mesh size',
      'The measurement of the distance between two opposite knots when the net is pulled taut, determining the maximum opening for capturing species.'),
    (
      'Set depth',
      'The vertical distance from the water surface to the position where the net is deployed, indicating how deep the net is placed in the water column.'),
    (
      'Trawling depth',
      'The vertical distance from the water surface to the position where the trawl net is towed, indicating the depth at which the net is operating in the water column.'),
    (
      'Shelves',
      'The number of horizontal tiers or pockets in the net, which help entangle and hold captured animals.'),
    (
      'Depth',
      'The vertical measurement from the top to the bottom.'),
    (
      'Diameter of opening',
      'The size of the entry point of the capture mechanism.'),
    (
      'Number of entrances',
      'The count of entry points into the capture mechanism.'),
    (
      'Leader length',
      'The length of the guiding structure that directs fish into the trap net.'),
    (
      'Hook size',
      'Numerical scale where smaller numbers indicate larger hooks based on the gap and shank length.'),
    (
      'Radio frequency',
      'Frequency refers to the specific radio wave band at which the transmitter on the animal and the receiver on the tower communicate to ensure accurate tracking and data transmission.'),
    (
      'Pulse repetition frequency',
      'The number of radar pulses transmitted per second, measured in hertz (Hz), and is a key parameter that affects the range resolution and target detection capabilities.'),
    (
      'Range resolution',
      'Measured in meters and indicates the minimum distance between two distinct targets that the radar can differentiate. It is determined by the pulse width, with shorter pulses providing better (smaller) range resolution.'),
    (
      'Current',
      'Current is the flow of electric charge through a conductor, typically measured in amperes.'),
    (
      'Voltage',
      'Voltage is the electric potential difference between two points in a circuit which drives the flow of electric current.'),
    (
      'Electrical frequency', 
      'The frequency of the electrical pulses, measured in Hz.'),
    (
      'Duty cycle',
      'The duty cycle is measured as a percentage (%), representing the proportion of time the electrical current is active (on) versus the total time of the cycle.'),
    (
      'Number of hooks',
      'The number of hooks included in the device'),
    (
      'Surface area',
      'Width x Height of the device'),
    (
      'Camera resolution',
      'The level of detail captured in a photo.'
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
        method_lookup_id,
        min,
        max,
        unit
      )
    VALUES
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height above ground'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
      0,
      10000,
      'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Images per trigger'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
        0,
        50,
        'count'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Field of view'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Camera trap'),
        0,
        360,
        'degrees'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Box or live trap'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Net size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net'),
        0,
        100,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Set depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Gill net'),
        0,
        10000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Net size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling'),
        0,
        500,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling'),
        0,
        100,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Trawling depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trawling'),
        0,
        10000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net'),
        0,
        250,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net'),
        0,
        100,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Mist net'),
        0,
        100,
        'millimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap'),
        0,
        100,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Pitfall trap'),
        0,
        100,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        100,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        10000,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        100,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        200,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Number of entrances'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        10,
        'count'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Leader length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        10,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Trap net'),
        0,
        10000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Rotary screw trap'),
        0,
        10,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Depth'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Handheld net'),
        0,
        30,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Diameter of opening'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Handheld net'),
        0,
        1000,
        'centimeter'
      ), 
      (
       (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Hook size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Angling'),
        0,
        64,
        'count'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Radio frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radio signal tower'),
        0,
        30,
        'GHz'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Pulse repetition frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar'),
        0,
        10000,
        'Hz'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Range resolution'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Radar'),
        0,
        1000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Current'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing'),
        5,
        0,
       'amps'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Voltage'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing'),
        0,
        1000,
        'volts'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Electrical frequency'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing'),
        0,
        1000,
        'Hz'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Duty cycle'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Electrofishing'),
        0,
        100,
        'seconds'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net'),
        0,
        10000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Height'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net'),
        0,
        1000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Mesh size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Seine net'),
        0,
        100,
        'centimeter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Width'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Fish weir'),
        0,
        10,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Surface area'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Egg mats'),
        0,
        400,
        'meters squared'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Length'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline'),
        0,
        100000,
        'meter'
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Hook size'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline'),
        0,
        64,
        NULL
      ),
      (
        (SELECT technique_attribute_quantitative_id FROM technique_attribute_quantitative WHERE name = 'Number of hooks'),
        (SELECT method_lookup_id FROM method_lookup WHERE name = 'Setline'),
        0,
        1000,
        'count'
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
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Trawl net type'),
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
        (SELECT technique_attribute_qualitative_id FROM technique_attribute_qualitative WHERE name = 'Orientation'),
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
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Reconyx Hyperfire',
          'Hyperfire manufactured by Reconyx.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Bushnell',
          NULL
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Spypoint',
          NULL
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Browning',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Stealth Cam',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Model' AND ml.name = 'Camera trap'
        
        ),
          'Other',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Infrared type' AND ml.name = 'Camera trap'
        
        ),
          'None',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Infrared type' AND ml.name = 'Camera trap'
        
        ),
          'No-glow',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Infrared type' AND ml.name = 'Camera trap'
        
        ),
          'Low-glow',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Infrared type' AND ml.name = 'Camera trap'
        
        ),
          'White flash',
          NULL
        ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Box or live trap'
        ),
          'Wood',
          'A natural, organic material derived from trees, known for its strength and ease of manipulation. Often used in construction due to its durability and availability.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Box or live trap'
        ),
          'Metal',
          'A hard, solid material typically derived from ores. It is known for its high strength, durability, and resistance to damage and deformation.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Box or live trap'
        ),
        'Plastic',
        'A synthetic material made from polymers. It is lightweight, versatile, resistant to corrosion, and can withstand various weather conditions.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trap entrance mechanism' AND ml.name = 'Box or live trap'
        ),
         'One-way door',
         'A door mechanism that allows entry but not exit. It typically uses a hinge or flap that moves in only one direction, preventing the animal from leaving once inside.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trap entrance mechanism' AND ml.name = 'Box or live trap'
        ),
          'Drop door',
          'A door that is held open and drops down to close when triggered. This mechanism relies on gravity and a trigger system to release the door quickly, trapping the animal inside.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trap entrance mechanism' AND ml.name = 'Box or live trap'
        ),
        'Swing door',
        'A door that swings shut when an animal enters. It uses hinges to move back and forth, and locks into place once closed, preventing the animal from exiting.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trap entrance mechanism' AND ml.name = 'Box or live trap'
        ),
        'Slide door',
        'A door that slides horizontally or vertically into place to close the trap. It often uses rails or grooves to guide the door movement, activated by a trigger mechanism.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trap entrance mechanism' AND ml.name = 'Box or live trap'
        ),
        'Funnel entrance',
        'An entrance that tapers inward, making it easy for the animal to enter but difficult to exit. The design typically narrows towards the interior, creating a one-way path.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trigger mechanism' AND ml.name = 'Box or live trap'
        ),
        'Pressure plate',
        'A flat surface that activates the trap when enough weight is applied. The plate is connected to a trigger mechanism that releases the trap door or closure system upon activation.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trigger mechanism' AND ml.name = 'Box or live trap'
        ),
        'Trip wire',
        'A thin wire or string that, when disturbed or pulled, activates the trap. The wire is typically connected to a trigger mechanism that sets off the trap closing mechanism.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trigger mechanism' AND ml.name = 'Box or live trap'
        ),
        'Bait hook',
        'A hook or holder for bait that activates the trap when the bait is moved or taken by the animal. The movement of the bait triggers the mechanism that closes the trap.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trigger mechanism' AND ml.name = 'Box or live trap'
        ),
        'Infrared sensor',
        'An electronic device that detects the presence of an animal through infrared radiation. When an animal breaks the infrared beam, the sensor activates the trap mechanism.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trigger mechanism' AND ml.name = 'Box or live trap'
        ),
        'String pull',
        'A trigger mechanism that relies on the animal pulling a string or cord. The tension or movement of the string activates the trap, causing it to close.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Gill net'
        ),
        'Nylon',
        'A synthetic polymer known for its strength, durability, and resistance to wear and tear.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Gill net'
        ),
        'Polyethylene',
        'A lightweight, flexible material resistant to UV radiation and chemical damage.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Gill net'
        ),
        'Polypropylene',
        'A robust and inexpensive material, often used for its buoyancy and resistance to moisture.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Gill net'
        ),
        'Monofilament',
        'A single, continuous strand of synthetic fiber, offering transparency and strength.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Trawling'
        ),
        'Nylon',
        'Durable and strong, often used in commercial fishing nets for its resilience.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Trawling'
        ),
        'Polyethylene',
        'Light and flexible, commonly used for its resistance to chemicals and UV light.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Trawling'
        ),
        'Polypropylene',
        'Known for its toughness and buoyancy, frequently used in fishing gear.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Trawling'
        ),
        'Dyneema',
        'A high-performance polyethylene fiber known for its exceptional strength-to-weight ratio.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trawl net type' AND ml.name = 'Trawling'
        ),
        'Beam trawl',
        'A trawl net held open by a rigid beam used in shallow waters for catching bottom dwelling species'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trawl net type' AND ml.name = 'Trawling'
        ),
        'Otter Trawl',
        'A trawl net held open by otter boards (doors) that spread the net horizontally.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trawl net type' AND ml.name = 'Trawling'
        ),
          'Pair Trawl',
          'A trawl net towed by two boats, used to cover a wider area.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Trawl net type' AND ml.name = 'Trawling'
        ),
        'Midwater Trawl',
        'A trawl net designed to operate in the midwater column, targeting pelagic species.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Otter board type' AND ml.name = 'Trawling'
        ),
         'Rectangular Boards',
         'Simple, flat boards with a rectangular shape, used to spread the net horizontally.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id FROM method_lookup_attribute_qualitative mlaq INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Otter board type' AND ml.name = 'Trawling'
        ),
          'V-Shaped Boards',
          'Boards with a V-shaped design to provide more efficient spreading and stability.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Otter board type' AND ml.name = 'Trawling'
        ),
         'Oval Boards',
         'Oval-shaped boards that offer a balance between spreading force and stability.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Otter board type' AND ml.name = 'Trawling'
        ),
        'High Aspect Ratio Boards',
        'Designed for deep-sea trawling, these boards have a higher aspect ratio for better performance in strong currents.'
      ), 
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Mist net'
        ),
        'Nylon',
        'A synthetic polymer known for its strength, durability, and resistance to wear and tear.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Mist net'
        ),
        'Polyester',
        'A strong, lightweight, and UV-resistant material, commonly used in mist nets for bird capture.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Orientation' AND ml.name = 'Mist net'
        ),
        'Vertical',
        'Positioned upright to intercept flying birds and bats.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Orientation' AND ml.name = 'Mist net'
        ),
        'Horizontal',
        'Positioned horizontally to intercept birds and bats flying at low heights.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Pitfall trap'
        ),
        'Plastic',
        'A lightweight, durable material commonly used for constructing pitfall traps.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Pitfall trap'
        ),
        'Metal',
        'A strong, durable material used for making long-lasting pitfall traps.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Type of trap cover' AND ml.name = 'Pitfall trap'
        ),
        'Lid',
        'A removable cover used to protect the trap from debris and prevent non-target animals from entering.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Type of trap cover' AND ml.name = 'Pitfall trap'
        ),
        'Mesh',
        'A mesh cover that allows air flow while preventing larger animals from entering the trap.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Trap net'
        ),
         'Nylon',
         'A synthetic polymer known for its strength, durability, and resistance to wear and tear.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Rotary screw trap'
        ),
         'Metal',
         'A strong, durable material used for making long-lasting rotary screw traps.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Handheld net'
        ),
         'Polyester',
         'A strong, lightweight, and UV-resistant material, commonly used in handheld nets.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Angling tool' AND ml.name = 'Angling'
        ),
         'Graphite Rod',
         'A lightweight, strong, and sensitive rod material used for a variety of fishing techniques.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Angling tool' AND ml.name = 'Angling'
        ),
         'Telescopic pole',
         'Designed to collapse down to a shorter length for easy transportation and storage, then extend to a full-length rod for fishing, offering convenience and portability for anglers.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Bait' AND ml.name = 'Angling'
        ),
        'Worms',
        'Bait commonly used for attracting a variety of fish species.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Bait' AND ml.name = 'Angling'
        ),
        'Maggots',
        'Bait commonly used for attracting a variety of fish species.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Bait' AND ml.name = 'Angling'
        ),
        'Fly',
        'An artificial lure designed to imitate insects or other prey, typically made with feathers, thread, and other materials, used primarily in fly fishing to attract fish.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Fishing technique' AND ml.name = 'Angling'
        ),
        'Float fishing',
        'A floating device used to keep bait at a desired depth and indicate when a fish bites.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Fishing technique' AND ml.name = 'Angling'
        ),
         'Bottom fishing',
         'A weight used to take the bait to the bottom or to a specific depth in the water.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Transmitter make and model' AND ml.name = 'Radio signal tower'
        ),
        'Model X1000',
        'A high-performance transmitter known for its reliability and long-range signal transmission.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Radar make and model' AND ml.name = 'Radar'
        ),
        'Radar Model Z200',
        'A state-of-the-art radar system with advanced detection and tracking capabilities.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Seine net'
        ),
        'Nylon',
        'A synthetic polymer known for its strength, durability, and resistance to wear and tear.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Seine net'
        ),
        'Polyethylene',
        'A lightweight, flexible material resistant to UV radiation and chemical damage.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Fish weir'
        ),
        'Wood',
        'A traditional material used for constructing durable and effective fish weirs.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Fish weir'
        ),
        'Metal',
        'A strong, corrosion-resistant material used for modern fish weirs, providing durability and longevity.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Anchored or floating' AND ml.name = 'Fish wheel'
        ),
        'Anchored',
        'A fish wheel that is secured to the riverbed or bank to prevent movement.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Anchored or floating' AND ml.name = 'Fish wheel'
        ),
        'Floating',
        'A fish wheel that is allowed to move with the current, usually secured by ropes or chains.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Fish wheel'
        ),
        'Wood',
        'A traditional material used for constructing fish wheels, known for its buoyancy and ease of construction.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Fish wheel'
        ),
        'Metal',
        'A durable and strong material used in modern fish wheels, offering longevity and resistance to water damage.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Egg mats'
        ),
        'Synthetic Fiber',
        'A man-made material known for its durability and resistance to water, commonly used in egg mats.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Egg mats'
        ),
        'Metal',
        ' A strong, durable material used in egg mats to provide structural support and longevity'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Egg mats'
        ),
        'Plastic',
        'A lightweight, flexible material used in egg mats for its resistance to water and ease of cleaning.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Egg mats'
        ),
        'Wood',
        'A traditional material used in egg mats for its natural properties and ability to blend into aquatic environments.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Substrate type' AND ml.name = 'Egg mats'
        ),
        'Gravel',
        'Small stones and pebbles used as a substrate for egg mats to mimic natural riverbed conditions.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Substrate type' AND ml.name = 'Egg mats'
        ),
        'Sand',
        'Fine particles used as a substrate for egg mats to provide a soft and supportive environment for eggs.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Setline'
        ),
        'Nylon',
        'A synthetic polymer used in setlines for its strength and resistance to abrasion.'
      ),
      (
        (
          SELECT method_lookup_attribute_qualitative_id 
          FROM method_lookup_attribute_qualitative mlaq 
          INNER JOIN technique_attribute_qualitative taq ON taq.technique_attribute_qualitative_id = mlaq.technique_attribute_qualitative_id 
          INNER JOIN method_lookup ml ON ml.method_lookup_id = mlaq.method_lookup_id
          WHERE taq.name = 'Material' AND ml.name = 'Setline'
        ),
        'Polyethylene',
        'A lightweight, durable material used in setlines for its flexibility and resistance to UV light.'
      );
    ----------------------------------------------------------------------------------------

    INSERT INTO attractant_lookup
      (
        name,
        description
      )
    VALUES
      (
        'Call playback',
        'An audio recording of a species used to attract species.'
      ),
      (
        'Food bait',
        'Using specific foods to attract animals. This can include fruits, vegetables, seeds, fish, meat, or other food items depending on the target species.'
      ),
      (
        'Scent bait',
        'Using scents or pheromones to attract animals. Scents can be from natural sources like animal urine or commercial scent lures.'
      ),
      (
        'Salt or mineral bait',
        'Providing mineral licks to attract herbivores and other animals needing minerals.'
      ),
      (
        'Decoys',
        'Using life-like models of animals to attract specific species.'
      ),
      (
        'Reflective materials',
        'Using shiny or reflective objects to catch the attention of curious animals.'
      ),
      (
        'Light',
        'Using artificial lights to attract nocturnal insects or other animals.'
      );

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
