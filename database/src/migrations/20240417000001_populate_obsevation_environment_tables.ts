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

    INSERT INTO environment_quantitative
      (
        name,
        description,
        min,
        max,
        unit
      )
    VALUES
      (
        'Snow cover',
        'The percent snow cover.',
        0,
        100,
        'percent'
      ),
      (
        'Air temperature',
        'The ambient air temperature.',
        -50,
        200,
        'celsius'
      ),
      (
        'Water temperature',
        'The water temperature.',
        -50,
        200,
        'celsius'
      ),
      (
        'Vegetation cover',
        'The percent vegetation cover.',
        0,
        100,
        'percent'
      ),
      (
        'Previous 48 hour Air Temperature',
        'The air temperature during the previous 48 hours.',
        -50,
        200,
        'celsius'
    ),
    (
        'Rainfall over 24 hours',
        'The amount of rainfall that fell within the last 24 hours.',
        0,
        200,
        'millimeter'
    ),
    (
        'Rainfall over 48 hours',
        'The amount of rain that fell within the last 48 hours.',
        0,
        400,
        'millimeter'
    ),
    (
        'Sea Surface Temperature',
        'The sea water surface temperature.',
        0,
        30,
        'celsius'
    ),
    (
        'Swell Height',
        'The current swell height.',
        0,
        20,
        'meter'
    ),
    (
        'Sea Surface Salinity',
        'The sea water surface salinity.',
        32,
        38,
        'ppt'
    ),
    (
        'Wavelet Height',
        'The current wavelet height.',
        0,
        100,
        'centimeter'
    ),
    (
        'Ground Temperature',
        'The ground surface temperature.',
        -50,
        100,
        'celsius'
    ),
    (
      'Turbidity',
      'The turbidity of the water measured with a secchi disk or other instrument.',
      0,
      100,
      'centimeter'
    ),
    (
      'Temperature Variance',
      $$The water temperature variance.$$,
      0,
      50,
      'celsius'
    ),
    (
      'Sightability Correction Factor',
      'Sightability Correction Factor (SCF) is a quantitative coefficient which is estimated or derived and applied to a sample-based count in order to adjust for visibility or sightability bias of the observers.',
      0,
      1,
      'SCF'
    ),
    (
      'Elevation',
      'The elevation of the site.',
      -1000,
      5000,
      'meter'
    ),
    (
      'Slope',
      'The slope gradient.',
      0,
      100,
      'percent'
    ),
    (
      'Aspect',
      'The orientation of the slope.',
      0,
      360,
      'degrees'
    ),
    (
      'Rooting Zone Coarse Fragment',
      'The particle size distribution within the mineral portion of the rooting zone.',
      0,
      100,
      'percent'
    ),
    (
      'Root Restiriction Depth',
      'The depth of the layer that restricts root penetration.',
      0,
      100,
      'centimeter'
    ),
    (
      'Soil pH',
      'Concentration of hydrogen ions in the mineral soil.',
      0,
      14,
      'pH'
    ),
    (
      'Crown Closure',
      'The percentage of the ground surface covered when the crowns are projected vertically.',
      0,
      100,
      'percent'
    ),
    (
      'Percent Cover',
      'The percentage of the ground surface, of a plot or area occupied, covered when a species above-ground-vegetation is projected vertically onto the ground.',
      0,
      100,
      'percent'
    ),
    (
      'Snow Cover',
      'Percentage indicating the extent of snow cover on the ground.',
      0,
      100,
      'percent'
    );

    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative
      (
        name,
        description
      )
    VALUES
      (
        'Wind direction',
        'The compass direction of the wind.'
      ),
      (
        'Wind speed',
        'The wind speed category.'
      ),
      (
        'Precipitation',
        'The precipitation category.'
      ),
      (
        'Previous 48 hour Wind Speed',
        'The wind speed during the previous 48 hours.'
      ),
      (
        'Previous 48 hour Precipitation',
        'The type of precipitation that occurred during the preceding 48 hours.'
      ),
      (
        'Cloud Type',
        'The type of clouds e.g. ST.'
      ),
      (
        'Cloud Cover',
        'The extent of cloud cover at the start, or end, of sampling.'
      ),
      (
        'Cloud Ceiling',
        'The height of cloud cover relative to trees and ridges.'
      ),
      (
        'Previous 48 hour Cloud Cover',
        'The extent of cloud cover during the previous 48 hours.'
      ),
      (
        'Snow Depth',
        'The depth of snow.'
      ),
      (
        'Snow Cover',
        'The extent of snow cover on the ground.'
      ),
      (
        'Time Since 5cm Snow',
        'The number of days since 5 cm of snow fell.'
      ),
      (
        'Sea Wind Condition',
        'The strength of the wind over the sea, using the beaufort scale.'
      ),
      (
        'Tide Direction',
        'The tide direction.'
      ),
      (
        'Ground Moisture',
        'Ground moisture class.'
      ),
      (
        'Leaf Moisture',
        'Leaf moisture class.'
      ),
      (
        'Lunar Phase',
        'Lunar phase class.'
      ),
      (
        'Soil Moisture Regime',
        'The moisture class of the soil.'
      ),
      (
        'Soil Nutrient Regime',
        'The nutrient class of the soil.'
      ),
      (
        'Rooting Zone Soil Texture',
        'The size distribution of the primary mineral particles - 2mm diameter or less.'
      ),
      (
        'Meso Slope Position',
        'The position of the site relative to the localized catchment area.'
      ),
      (
        'Structual Stage',
        'The appearance of a stand or community using the characteristic life form and certain physical attributes.'
      ),
      (
        'Terrain Texture 1 - Upper',
        'The 1st terrain texture of the upper stratigraphic layer.'
      ),
      (
        'Terrain Texture 2 - Upper',
        'The 2nd terrain texture of the upper stratigraphic layer.'
      ),
      (
        'Terrain Texture 3 - Upper',
        'The 3rd terrain texture of the upper stratigraphic layer.'
      ),
      (
        'Surficial Material 1 - Upper',
        'The 1st surficial material of the upper stratigraphic layer.'
      ),
      (
        'Surficial Material 2 - Upper',
        'The 2nd surficial material of the upper stratigraphic layer.'
      ),
      (
        'Surficial Material 3 - Upper',
        'The 3rd surficial material of the upper stratigraphic layer.'
      ),
      (
        'Surface Expression 1 - Upper',
        'The 1st surface expression of the upper stratigraphic layer.'
      ),
      (
        'Surface Expression 2 - Upper',
        'The 2nd surface expression of the upper stratigraphic layer.'
      ),
      (
        'Surface Expression 3 - Upper',
        'The 3rd surface expression of the upper stratigraphic layer.'
      ),
      (
        'Geomorphological Process 1 - Upper',
        'The 1st geomorphological process of the upper stratigraphic layer.'
      ),
      (
        'Geomorphological Process 2 - Upper',
        'The 2nd geomorphological process of the upper stratigraphic layer.'
      ),
      (
        'Geomorphological Process 3 - Upper',
        'The 3rd geomorphological process of the upper stratigraphic layer.'
      ),
      (
        'Soil Drainage',
        'The speed and extent to which water is removed from a mineral soil.'
      ),
      (
        'Humus Form',
        'The structure of the humus.'
      ),
      (
        'Root Restriction Layer',
        'The type of layer that prevents the penetration of roots.'
      ),
      (
        'Vegetation Layer',
        'The vegetation layer that the plant species was found in.'
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative_option
      (
        environment_qualitative_id,
        name,
        description
      )
    VALUES
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'North',
        'North direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Northeast',
        'Northeast direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Northwest',
        'Northwest direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'East',
        'East direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'South',
        'South direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Southeast',
        'Southeast direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Southwest',
        'Southwest direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'West',
        'West direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Still air',
        'No detectable wind (0-5 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Weak',
        'Leaves rustle (6-12 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Moderate',
        'Leaves and twigs constantly move (13-19 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Strong',
        'Small branches move, dust rises (20-29 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Very strong',
        'Small trees sway (30-39 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Intense',
        'Large branches moving, wind whistling (>39 km/hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'None',
        'No precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Misty drizzle',
        'No distinct rain drops but can dampen clothing.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Drizzle',
        $$Fine rain drops (< 0.5 mm diameter), visible on ground.$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Light Rain',
        $$Puddles not forming quickly, < 2.5 mm rain/hour.$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Heavy Rain',
        $$Puddles form quickly, > 2.5 mm rain/hour.$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Light snow',
        'Snow falling but not accumulating.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Heavy snow',
        'Snow accumulating on the ground.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Hail',
        'Solid ice falling.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev - Calm',
        $$Less than 2 km/h.$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev - Light Air',
        $$2-5 km/h.$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev - Light Breeze',
        $$Leaves rustle (6-12km/h).$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev Gentle Breeze',
        $$Leaves and twigs constantly move (13-19 km/h).$$
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev Moderate Breeze',
        'Small branches move, dust rises (20 - 29 km/h).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev Fresh Breeze',
        'Small trees sway (30 - 39 km/h).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Wind Speed'),
        'Prev Strong Breeze',
        'Large branches moving wind whistling (40 - 50 km/h).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev No Precipitation',
        'No precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev Foggy',
        'Reduced visibility like a cloud.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev Misty Drizzle',
        'No distinct rain drops but can dampen clothing.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev Drizzle',
        'Finee rain drops <0.5mm diameter visible on ground.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev Light Rain',
        'Puddles not forming quickly < 2.5mm rain per hour.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Prev Hard Rain',
        'Puddles form quickly > 2.5mm rain per hour.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Previous Snow',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Previous Snow - Light',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Precipitation'),
        'Previous Snow - Heavy',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Stratus',
        'Low continuous-cover clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Nimbostratus',
        'Low heavy rain clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Stratocumulus',
        'Low fluffy clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Cumulus',
        'Big tall fluffy clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Altocumulus',
        'Mid altitude fluffy clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Atostratus',
        'Mid altitude continuous clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Cirrocumulus',
        'High altitude bands of fluffy clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
        'Cirrus',
        'Very high altitude wispy clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover'),
        'Clear',
        'Clear sky no clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover'),
        'Scattered (<50%)',
        'Scattered clouds covering less than 50% of the sky.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover'),
        'Scattered (>50%)',
        'Scattered clouds covering more than 50% of the sky.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover'),
        'Unbroken Clouds',
        'Unbroken cloud cover.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'Very High',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'High',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'Above Ridge Tops',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'Below Ridge Tops',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'Above Tree Tops',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling'),
        'Below Tree Tops',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Cloud Cover'),
        'Clear',
        'Clear sky; no clouds.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Cloud Cover'),
        'Scattered (<50%)',
        'Scattered clouds covering less than 50% of sky.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Cloud Cover'),
        'Scattered (>50%)',
        'Scattered clouds covering more than 50% of sky.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hour Cloud Cover'),
        'Unbroken clouds',
        'Unbroken cloud cover.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '0cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '1-5cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '6-25cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '26-50cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '51-75cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '76-100cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '101-150cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth'),
        '>150cm',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '0%',
        '0% of the ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '1-5%',
        '1-5% of ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '6-25%',
        '6-25% of the ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '26-50%',
        '26-50% of the ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '51-75%',
        '51-75% of the ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover'),
        '76-100%',
        '76-100% of the ground covered.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
        '< 1/2 day',
        'Less than half a day since it snowed last.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
        '< 3 days',
        'Less than 3 days since it snowed last.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
        '< 14 days',
        'Less than 14 days since it last snowed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
        'NR',
        'Not recorded because information is no value.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Calm',
        'Calm 0-1 knots, sea like a mirror.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Light Air',
        'Light Air, 1-3 knots, 1/4 ft waves, ripples with appearance of scales, no foam crests.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Light Breeze',
        'Light Breeze, 4-6 knots, 1/3 ft. waves, small wavelets, crests of glassy appearance not breaking.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Gentle Breeze',
        'Gentle Breeze, 7-10 knots, 2 ft. waves, large wavelets, crests begin to break, scattered whitecaps.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Moderate Breeze',
        'Moderate Breeze, 11-16 knots, 4 ft waves, small waves, becoming longer, numerous whitecaps.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Fresh Breeze',
        'Fresh Breeze, 17-21 knots, 16 ft waves, moderate waves, taking longer form, many whitecaps, some spray.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Strong Breeze',
        'Strong Breeze, 22-27 knots, 10 ft waves, longer waves forming, whitecaps everywhere, more spray.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Near Gale',
        'Near Gale, 28-32 knots, 14 ft waves.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Gale',
        'Gale, 34-40 knots, 18 ft waves.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Strong Gale',
        'Strong Gale, 41-47 knots, 23 ft waves.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Storm',
        'Storm, 48-55 knots, 29 ft waves'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Violent Storm',
        'Violent Storm, 53-63 knots, 37 ft waves'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition'),
        'Hurricane',
        'Hurricane, 64-71 knots, 45 ft waves.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction'),
        'High',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction'),
        'Intermediate Ebb',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction'),
        'Intermediate Flood',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction'),
        'Low',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
        'Dry',
        'No apparent moisture on ground/vegetation. Surface litter is dry and will not stain fingers when rubbed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
        'Moist',
        'Moisture is not apparent on ground/vegetation, but soil is moist. Surface litter will stain fingers when rubbed but no water is apparent when soil/litter is squeezed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
        'Wet',
        'Moisture is apparent on ground/vegetation water is observed if soil/litter is squeezed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Leaf Moisture'),
        'Dry',
        'No moisture nor droplets detected on leaves surfaces.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Leaf Moisture'),
        'Moist',
        'Moisture and/or droplets detected on leaves surfaces.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'New Moon',
        'The moon is dark. Also called dark moon.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Waxing Crescent',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'First Quarter',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Waxing Gibbous',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Full Moon',
        'The entire illuminated portion of the moon is visible.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Waning Gibbous',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Third Quarter',
        'Also called half moon, and is waning.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
        'Waning Crescent',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Very xeric',
        'Water supply removed very rapidly in relation to supply. Soil is moist for a negligible time after precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Xeric',
        'Water removed very rapidly in relation to supply; soilis moidt for brief periods following precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Subxeric',
        'Water removed rapidly in relation to supply; soil is moist for short periods following precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Submesic',
        'Water removed readily in relation to supply; water available for moderately short periods following precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Mesic',
        'Water removed somewhat slowly in relation to supply; soil may remain moist for a significant, but sometimes short period of the year. Available soil moisture reflects climatic inputs.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Subhygric',
        'Water removed slowly enough to keep soil wet for a significant part of growing season; some temporary seepage and possibly mottling below 20 cm.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'Hydric',
        'Water removed slowly enough to keep soil wet for most of growing season; permanent seepage and mottling; gleyed colours common.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'duplicate Subhydric',
        'Water removed slowly enough to keep water table at or near surface for most of year; gleyed mineral or organic soils; permanent seepage < 30 cm below surface.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
        'duplicate Hydric',
        'Water removed so slowly that water table is at or above soil surface all year; gleyed mineral or organic soils.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Rooting Zone Soil Texture'),
        'Clayey',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Rooting Zone Soil Texture'),
        'Loamy',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Rooting Zone Soil Texture'),
        'Organic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Rooting Zone Soil Texture'),
        'Sandy',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Rooting Zone Soil Texture'),
        'Silty',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Crest',
        'The generally convex uppermost portion of a hill; usually convex in all directions with no distinct aspect.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Upper slope',
        'The generally convex upper portion of the slope immediately below the crest of a hill; has a specific aspect.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Middle slope',
        'Area between the upper and lower slope; the surface profile is generally neither distinctly concave nor convex; has a straight or somewhat sigmoid surface profile with a specific aspect.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Lower Slope',
        'The area toward the base of a slope; generally has a concave surface profile with a specific aspect.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Toe',
        'The area demarcated from the lower slope by an abrupt decrease in slope gradient; seepage is typically present.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Depression',
        'Any area concave in all directions; may be at the base of a mesoscale slope or in a generally level area.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Level',
        'Any level meso-scale area not immediately adjacent to a meso-scale slope; the surface profile is generally horizontal and straight with no significant aspect.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Meso Slope Position'),
        'Gully',
        'An area in a double toe slope position where the receiving area is also sloped (perpendicular to the toe slopes).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Non-vegetated/sparse',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Non-vegetated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Sparse',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Bryoid',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Herb',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Forb-dominated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Graminoid-dominated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Aquatic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Dwarf shrub',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Shrub/herb',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Low shrub',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Tall shrub',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Pole/Sapling',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Young Forest',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Mature Forest',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Structual Stage'),
        'Old Forest',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Blocks',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Boulders',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Clay',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Mixed fragments',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Fabric',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Gravel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Humic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Cobble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Mud',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Pebbles',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Rubble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Sand',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Mesic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Angular',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Shells',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 1 - Upper'),
        'Silt',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Blocks',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Boulders',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Clay',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Mixed fragments',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Fabric',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Gravel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Humic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Cobble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Mud',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Pebbles',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Rubble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Sand',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Mesic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Angular',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Shells',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 2 - Upper'),
        'Silt',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Blocks',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Boulders',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Clay',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Mixed fragments',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Fabric',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Gravel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Humic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Cobble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Mud',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Pebbles',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Rubble',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Sand',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Mesic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Angular',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Shells',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Terrain Texture 3 - Upper'),
        'Silt',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Anthopogenic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Colluvium',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Weathered bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Eolian',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Fluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Glaciofluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Ice',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Lacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Glaciolacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Morainal',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Organic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Undifferentiated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Volcanic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Marine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 1 - Upper'),
        'Glaciomarine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Anthopogenic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Colluvium',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Weathered bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Eolian',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Fluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Glaciofluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Ice',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Lacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Glaciolacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Morainal',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Organic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Undifferentiated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Volcanic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Marine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 2 - Upper'),
        'Glaciomarine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Anthopogenic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Colluvium',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Weathered bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Eolian',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Fluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Glaciofluvial',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Ice',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Lacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Glaciolacustrine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Morainal',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Organic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Bedrock',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Undifferentiated',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Volcanic',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Marine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surficial Material 3 - Upper'),
        'Glaciomarine',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Moderate Slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Blanket',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Cone(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Depression(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Fan(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Hummock(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Gentle slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Moderately steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Rolling',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Plain',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Ridge(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Terrace(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Undulating',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Mantle of variable thickness',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 1 - Upper'),
        'Thin Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Moderate Slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Blanket',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Cone(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Depression(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Fan(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Hummock(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Gentle slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Moderately steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Rolling',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Plain',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Ridge(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Terrace(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Undulating',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Mantle of variable thickness',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 2 - Upper'),
        'Thin Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Moderate Slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Blanket',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Cone(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Depression(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Fan(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Hummock(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Gentle slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Moderately steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Rolling',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Plain',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Ridge(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Steep slope',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Terrace(s)',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Undulating',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Mantle of variable thickness',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Surface Expression 3 - Upper'),
        'Thin Veneer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Avalanches',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Braiding',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Cryoturbation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Deflation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Channeled',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Slow Mass',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Kettle',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Irregular channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Anastamosing channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Karst',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Surface seepage',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Meandering channels',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Nivation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Piping',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Rapid mass movement',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Solifluction',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Inundation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Gully erosion',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Washing',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Permafrost',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 1 - Upper'),
        'Periglacial processes',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Avalanches',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Braiding',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Cryoturbation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Deflation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Channeled',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Slow Mass',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Kettle',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Irregular channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Anastamosing channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Karst',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Surface seepage',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Meandering channels',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Nivation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Piping',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Rapid mass movement',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Solifluction',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Inundation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Gully erosion',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Washing',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Permafrost',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 2 - Upper'),
        'Periglacial processes',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Avalanches',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Braiding',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Cryoturbation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Deflation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Channeled',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Slow Mass',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Kettle',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Irregular channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Anastamosing channel',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Karst',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Surface seepage',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Meandering channels',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Nivation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Piping',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Rapid mass movement',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Solifluction',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Inundation',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Gully erosion',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Washing',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
        'Permafrost',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Very rapidly drained',
        'Water is removed from the soil so slowly that the water table remains at or near the surface for most of the time the soil is not frozen. Groundwater flow and subsurface flow are the major water sources. Precipitation is less important, except where there is a perched water table with precipitation exceeding evapotranspiration. Typically associated with wetlands.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Rapidly drained',
        'Water is removed from the soil so slowly that the water table remains at or near the surface for most of the time the soil is not frozen. Groundwater flow and subsurface flow are the major water sources. Precipitation is less important, except where there is a perched water table with precipitation exceeding evapotranspiration. Typically associated with wetlands.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Well drained',
        'Water is removed from the soil so slowly that the water table remains at or near the surface for most of the time the soil is not frozen. Groundwater flow and subsurface flow are the major water sources. Precipitation is less important, except where there is a perched water table with precipitation exceeding evapotranspiration. Typically associated with wetlands.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Moderately well drained',
        'Water is removed from the soil somewhat slowly in relation to supply because of imperviousness or lack of gradient. Precipitation is the dominant water source in medium- to fine- textured soils; precipitation and significant additions by subsurface flow are necessary in coarse-textured soils.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Imperfectly drained',
        'Water is removed from the soil sufficiently slowly in relation to supply to keep the soil wet for a significant part of the growing season. Excess water moves slowly downward if precipitation is the major source. If subsurface water or groundwater (or both) is the main source, the flow rate may vary but the soil remains wet for a significant part of the growing season.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Poorly drained',
        'Water is removed so slowly in relation to supply that the soil remains wet for much of the time that it is not frozen. Excess water is evident in the soil for a large part of the time. Subsurface or groundwater flow (or both), in addition to precipitation, are the main water sources. A perched water table may be present. Soils are generally mottled and/or gleyed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Drainage'),
        'Very poorly drained',
       'Water is removed so slowly in relation to supply that the soil remains wet for much of the time that it is not frozen. Excess water is evident in the soil for a large part of the time. Subsurface or groundwater flow (or both), in addition to precipitation, are the main water sources. A perched water table may be present. Soils are generally mottled and/or gleyed.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Mor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Hemimor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Humimor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Resimor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Lignomor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Hydromor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Fibrimor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Mesimor',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Moder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Mormoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Leptomoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Mullmoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Lignomoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Hydromoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Saprimoder',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Mull',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Vermimull',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Rhizomull',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Humus Form'),
        'Hydromull',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Strongly cemented horizon',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Clay pan or restriction due to fines',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Compacted morainal material',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Lithic Contact',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Excessive Moisture',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Excessive accumulation of chemicals',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'Permafrost',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Root Restriction Layer'),
        'No root restriction evident',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Vegetation Layer'),
        'Tree layer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Vegetation Layer'),
        'Shrub layer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Vegetation Layer'),
        'Herb layer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Vegetation Layer'),
        'Moss layer',
        ''
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Vegetation Layer'),
        'Epiphyte layer',
        ''
      )
      ;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
