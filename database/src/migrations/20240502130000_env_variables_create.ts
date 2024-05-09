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
        'The air temperature during the previous 48 hours, in degrees Celsius.'
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
    )
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
    )
    (
        'Swell Height(m)',
        'The current swell height in meters (m).'
        0,
        20,
        'meter'
    )
    (
        'Sea Surface Salinity (ppt)',
        'The sea water surface salinity in parts per thousand (ppt).',
        32,
        38,
        'ppt'
    )
    (
        'Wavelet Height (cm)',
        'The current wavelet height in centimeters (cm).',
        0,
        100,
        'centimeter'
    )
    (
        'Ground Temperature (C)',
        'The ground surface temperature in degrees Celsius.',
        -50,
        100,
        'celsius'
    )
    (
        'Turbidity (cm)',
        'The turbidity of the water as represented by centimeters of visibility measured with a secchi disk (cm) or other instrument.',
        0,
        100,
        'centimeter'
    )
    (
        'Temperature Variance (C)',
        'The water temperature variance in +/- degrees Celsius.',
        0,
        50,
        'celsius'
    )
    (
        'Sightability Correction Factor.',
        'E.g. 0.80. Sightability Correction Factor (SCF) is a quantitative coefficient which is estimated or derived and applied to a sample-based count in order to adjust for visibility or sightability bias of the observers.
        The SCF must be provided here as a probability. The probability of seeing or catching an animal must  be less than 1. 
        To translate a sample-based count into an estimate of total count, the  observed count must be divided by the probabilty of seeing or catching an animal (sightability). For example, if we count 40 birds during a Survey and we know that we only see 80% of the total number of birds actually present, then population estimate = 40 * 1/0.80 = 50 birds. The Sightability Correction Factor in this example is 0.80. (Source: Univerisity of Idaho, https://www.webpages.uidaho.edu/wlf448/aerial.htm)
        INSTRUCTIONS: This should be provided as a number, e.g., 0.80.',
        0,
        1,
        'SCF'
    )
    (
        'Elevation (m)',
        'The elevation of the site in metres.',
        0,
        5000,
        'meter'
    )
    (
        'Slope (percent)',
        'The slope gradient measured in percent.',
        0,
        100,
        'percent'
    )
    (
        'Aspect (degrees)',
        'The orientation of the slope, in degrees.',
        0,
        360,
        'degrees'
    )
    (
        'Rooting Zone Coarse Fragment %',
        'The particle size distribution within the mineral portion of the rooting zone.',
        0,
        100,
        'percent'
    )
    (
        'Root Restiriction Depth (cm)',
        'The depth of the layer that restricts root penetration.',
        0,
        100,
        'centimeter'
    )
    (
        'SPI Site Observations.Soil pH',
        'Concentration of hydrogen ions in the mineral soil.',
        0,
        14,
        'pH'
    )
    (
        'Crown Closure',
        'The percentage of the ground surface covered when the crowns are projected vertically.',
        0,
        100,
        'percent'
    )
    (
        'Percent Cover',
        'The percentage of the ground surface, of a plot or area occupied, covered when a species' aboveground-vegetation is projected vertically onto the ground.',
        0,
        100,
        'percent'
    )
    (
        'Official Sunrise Time',
        'The official sunrise time.',
        00:00,
        23:59,
        'time'
    ),
    (
      'Snow Cover Code',
      'A code indicating the extent of snow cover on the ground.'
    );

------------------------------------------------------------------------------------------------------

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
      'A code indicating the extent of cloud cover at the start, or end, of sampling,'
    ),
    (
      'Cloud Ceiling Code',
      'A code indicating the height of cloud cover relative to trees and ridges',
    ),
    (
      'Previous 48hr Cloud Cover',
      'A code indicating the extent of cloud cover during the preceding 48 hours'
    ),
    (
      'Snow Depth Code',
      'A code indicating the depth of snow'
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
      'A code indicating hte strength of the wind over the sea, using the beaufort scale'
    ),
    (
      'Tide Direction Code',
      'A code indicating the tide direction'
    ),
    (
      'Ground Moisture'
      'Ground moisture class',
    ),
    (
      'Leaf Moisture',
      'Leaf moisture class'
    ),
    (
      'Lunar Phase'
      'Lunar phase class'
    ),
    (
      'Soil Moisture Regime',
      'The moisture class of the soil'
    ),
    (
      'Soil Nutrient Regime'
      'The nutrient class of the soil'
    ),
    (
      'Rooting Zone Soil Texture',,
      'The size distribution of the primary mineral particles (2mm diameter or less)
    ),
    (
      'Meso Slope Position',
      'The position of the site relative to the localized catchment area',
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
      'Geomorphological Process 1 - Upper'
      'The 1st geomorphological process of the upper stratigraphic layer'
    ),
    (
      'Geomorphological Process 2 - Upper'
      'The 2nd geomorphological process of the upper stratigraphic layer'
    ),
    (
      'Geomorphological Process 3 - Upper'
      'The 3rd geomorphological process of the upper stratigraphic layer'
    )

    ;
------------------------------------------------------------------------------------------------------
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
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed)',
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
      'Leaves and twiga constantly move (13-19 km/h).'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
      'Moderate Breeze',
      'Small branches move, dust rises ( 20 - 29 km/h ).'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
      'Fresh Breeze',
      'Small trees sway ( 30 - 39 km/h ).'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Wind Speed'),
      'Strong Breeze',
      'Large branches moving, wind whistling ( 40 - 50 km/h ).'
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
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover Code'),
      'Clear',
      'Clear sky, no clouds'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover Code'),
      'Scattered (<50%)',
      'Scattered clouds covering less than 50% of the sky'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover Code'),
      'Scattered (>50%)',
      'Scattered clouds covering more than 50% of the sky'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Cover Code'),
      'Unbroken Clouds',
      'Unbroken cloud cover'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'Very High',
      ''
    ),
    (
      (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'High',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'Above Ridge Tops',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'Below Ridge Tops',
      ''
    ),
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'Above Tree Tops',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Cloud Ceiling Code'),
      'Below Tree Tops',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Cloud Cover'),
      'Clear',
      'Clear sky; no clouds'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Cloud Cover'),
      'Scattered (<50%)',
      'Scattered clouds covering less than 50% of sky'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Cloud Cover'),
      'Scattered (>50%)',
      'Scattered clouds covering more than 50% of sky'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Previous 48 hr Cloud Cover'),
      'Unbroken clouds',
      'Unbroken cloud cover'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '0cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '1-5cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '6-25cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '26-50cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '51-75cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '76-100cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '101-150cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Depth Code'),
      '>150cm',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '0%',
      '0% of the ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '1-5%',
      '1-5% of ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '6-25%',
      '6-25% of the ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '26-50%',
      '26-50% of the ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '51-75%',
      '51-75% of the ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Snow Cover Code'),
      '76-100%',
      '76-100% of the ground covered'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
      '< 1/2 day',
      'Less than half a day since it snowed last'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
      '< 3 days',
      'Less than 3 days since it snowed last'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
      '< 14 days',
      'Less than 14 days since it last snowed'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Time Since 5cm Snow'),
      'NR',
      'Not recorded because information is no value'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Calm',
      'Calm 0-1 knots, sea like a mirror'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Light Air',
      'Light Air 1-3 knots, 1/4 ft waves, ripples with appearance of scales, no foam crests.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Light Breeze',
      'Light Breeze, 4-6 knots, 1/3 ft. waves, small wavelets, crests of glassy appearance not breaking.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Gentle Breeze',
      'Gentle Breeze,  7-10 knots, 2 ft. waves, large wavelets, crests begin to break, scattered whitecaps.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Gentle Breeze',
      'Moderate Breeze, 11-16 knots, 4 ft waves, small waves, becoming longer, numerous whitecaps.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Fresh Breeze',
      'Fresh Breeze, 17-21 knots, 16 ft waves, moderate waves, taking longer form, many whitecaps, some spray.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Strong Breeze',
      'Strong Breeze, 22-27 knots, 10 ft. waves, longer waves forming, whitecaps everywhere, more spray.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Near Gale',
      'Near Gale, 28-32 knots. 14 ft. waves.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Gale',
      'Gale, 34-40 knots, 18 ft. waves.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Strong Gale',
      'Strong Gale, 41-47 knots, 23 ft waves.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Storm',
      'Storm 48-55 knots, 29 ft waves'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Violent Storm',
      'Violent Storm 53-63 knots, 37 ft waves'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Sea Wind Condition Code'),
      'Hurricane',
      'Hurricane, 64-71 knots, 45 ft waves.'
    ),
     (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction Code'),
      'High',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction Code'),
      'Intermediate Ebb',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction Code'),
      'Intermediate Flood',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Tide Direction Code'),
      'Low',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
      'Dry',
      'no apparent moisture on ground/vegetation. Surface litter is dry and will not stain fingers when rubbed'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
      'Moist',
      'moisture is not apparent on ground/vegetation, but soil is moist. Surface litter will stain fingers when rubbed, but no water is apparent when soil/litter is squeezed'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Ground Moisture'),
      'Wet',
      'moisture is apparent on ground/vegetation; water is observed if soil/litter is squeezed'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Leaf Moisture'),
      'Dry',
      'No moisture nor droplets detected on leaves' surfaces.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Leaf Moisture'),
      'Moist',
      'Moisture and/or droplets detected on leaves' surfaces.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
      'New Moon',
      'The moon is dark. Also called 'dark moon'.'
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
      'Also called 'half moon', and is waning.'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Lunar Phase'),
      'Waning Crescent',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
      'Very xeric',
      'Water supply removed very rapidly in relation to supply. Soil is moist for a negliglibe time after precipiation.'
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
      'Water removed slowly enough to keep soil wet for a significant part of growing season; some temporary seepage and possibly mottling below 20 cm'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
      'Hydric',
      'Water removed slowly enough to keep soil wet for most of growing season; permanent seepage and mottling; gleyed colours common'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
      'Subhydric',
      'Water removed slowly enough to keep water table at or near surface for most of year; gleyed mineral or organic soils; permanent seepage < 30 cm below surface'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Moisture Regime'),
      'Hydric',
      'Water removed so slowly that water table is at or above soil surface all year; gleyed mineral or organic soils'
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Very Poor',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Poor',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Medium',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Rich',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Very Rich',
      ''
    ),
    (
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Soil Nutrient Regime'),
      'Saline',
      ''
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
      (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Geomorphological Process 3 - Upper'),
      'Periglacial processes',
      ''
    ),
    
    

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
