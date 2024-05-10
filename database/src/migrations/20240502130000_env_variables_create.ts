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
    'Previous 48 hr Air Temp (C)',
    'The air temperature during the previous 48 hours, in degrees Celsius.',
    -50,
    200,
    'celsius'
),
(
    'Rainfall over 24 hours (mm)',
    'The amount of rainfall that fell within the last 24 hours (mm).',
    0,
    200,
    'millimeter'
),
(
    'Rainfall over 48 hours (mm)',
    'The amount of rain that fell within the last 48 hours (mm).',
    0,
    400,
    'millimeter'
),
(
    'Sea Surface Temperature (C)',
    'The sea water surface temperature in degrees Celsius.',
    0,
    30,
    'celsius'
),
(
    'Swell Height(m)',
    'The current swell height in meters (m).',
    0,
    20,
    'meter'
),
(
    'Sea Surface Salinity (ppt)',
    'The sea water surface salinity in parts per thousand (ppt).',
    32,
    38,
    'ppt'
),
(
    'Wavelet Height (cm)',
    'The current wavelet height in centimeters (cm).',
    0,
    100,
    'centimeter'
),
(
    'Ground Temperature (C)',
    'The ground surface temperature in degrees Celsius.',
    -50,
    100,
    'celsius'
),
(
  'Turbidity (cm)',
  'The turbidity of the water as represented by centimeters of visibility measured with a secchi disk (cm) or other instrument.',
  0,
  100,
  'centimeter'
),
(
  'Temperature Variance (C)',
  'The water temperature variance in +/- degrees Celsius.',
  0,
  50,
  'celsius'
),
(
  'Sightability Correction Factor.',
  'Sightability Correction Factor (SCF) is a quantitative coefficient which is estimated or derived and applied to a sample-based count in order to adjust for visibility or sightability bias of the observers.',
  0,
  1,
  'SCF'
),
(
  'Elevation (m)',
  'The elevation of the site in metres.',
  0,
  5000,
  'meter'
),
(
  'Slope (percent)',
  'The slope gradient measured in percent.',
  0,
  100,
  'percent'
),
(
  'Aspect (degrees)',
  'The orientation of the slope, in degrees.',
  0,
  360,
  'degrees'
),
(
  'Rooting Zone Coarse Fragment %',
  'The particle size distribution within the mineral portion of the rooting zone.',
  0,
  100,
  'percent'
),
(
  'Root Restiriction Depth (cm)',
  'The depth of the layer that restricts root penetration.',
  0,
  100,
  'centimeter'
),
(
  'SPI Site Observations.Soil pH',
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

INSERT INTO environment_qualitative
  (
    name,
    description
  )
VALUES
(
  'Previous 48 hr Wind Speed',
  'The wind speed during the previous 48 hours.'
),
(
  'Previous 48 hr Precip',
  'The type of precipitation that occurred during the preceding 48 hours.'
),
(
  'Cloud Type',
  'The type of clouds e.g. ST.'
),
(
  'Cloud Cover Code',
  'A code indicating the extent of cloud cover at the start, or end, of sampling.'
),
(
  'Cloud Ceiling Code',
  'A code indicating the height of cloud cover relative to trees and ridges.'
),
(
  'Previous 48hr Cloud Cover',
  'A code indicating the extent of cloud cover during the preceding 48 hours.'
),
(
  'Snow Depth Code',
  'A code indicating the depth of snow.'
),
(
  'Snow Cover Code',
  'An code indicating the extent of snow cover on the ground.'
),
(
  'Time Since 5cm Snow Code',
  'A code indicating the number of days since 5 cm of snow fell.'
),
(
  'Sea Wind Condition Code',
  'A code indicating the strength of the wind over the sea, using the beaufort scale.'
),
(
  'Tide Direction Code',
  'A code indicating the tide direction.'
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
  'The 1st terrain texture of the upper stratigraphic layer'
),
(
  'Terrain Texture 2 - Upper',
  'The 2nd terrain texture of the upper stratigraphic layer'
),
(
  'Terrain Texture 3 - Upper',
  'The 3rd terrain texture of the upper stratigraphic layer'
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
  'The 1st surface expression of the upper stratigraphic layer'
),
(
  'Surface Expression 2 - Upper',
  'The 2nd surface expression of the upper stratigraphic layer'
),
(
  'Surface Expression 3 - Upper',
  'The 3rd surface expression of the upper stratigraphic layer'
),
(
  'Geomorphological Process 1 - Upper',
  'The 1st geomorphological process of the upper stratigraphic layer'
),
(
  'Geomorphological Process 2 - Upper',
  'The 2nd geomorphological process of the upper stratigraphic layer'
),
(
  'Geomorphological Process 3 - Upper',
  'The 3rd geomorphological process of the upper stratigraphic layer'
),
(
  'Soil Drainage',
  'The speed and extent to which water is removed from a mineral soil.'
),
(
  'Humus Form',
  'The structure of the humus'
),
(
  'Root Restriction Layer',
  'The type of layer that prevents the penetration of roots'
),
(
  'Vegetation Layer',
  'The vegetation layer that the plant species was found in'
);

INSERT INTO environment_qualitative_option
(
  environment_qualitative_id,
  name,
  description
)
VALUES
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Calm',
  'Less than 2 km/h.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Light Air',
  '2-5 km/h.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Light Breeze',
  'Leaves rustle (6-12km/h).'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Gentle Breeze',
  'Leaves and twigs constantly move (13-19 km/h).'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Moderate Breeze',
  'Small branches move, dust rises (20 - 29 km/h).'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Fresh Breeze',
  'Small trees sway (30 - 39 km/h).'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
  'Strong Breeze',
  'Large branches moving, wind whistling (40 - 50 km/h).'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'No Precipitation',
  'No precipitation.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Foggy',
  'Reduced visibility, like a cloud.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Misty Drizzle',
  'No distinct rain drops but can dampen clothing.',
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Drizzle',
  'Fine rain drops (<0.5mm diameter), visible on ground.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Light Rain',
  'Puddles not forming quickly < 2.5mm rain per hour.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Hard Rain',
  'Puddles form quickly, > 2.5mm rain per hour.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Snow',
  ''
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Snow - Light',
  ''
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Precip'),
  'Snow - Heavy',
  ''
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
  'Stratus',
  'Low, continuous-cover clouds.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
  'Nimbostratus',
  'Low, heavy rain clouds.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
  'Stratocumulus',
  'Low fluffy clouds.'
),
(
  (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Type'),
  'Cumulus',
  'Big, tall fluffy clouds.'
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
  'Very high altitude whispy clouds.'
);

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

