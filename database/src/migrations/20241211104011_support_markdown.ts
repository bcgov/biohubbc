import { Knex } from 'knex';

/**
 * Adds multiple new markdown_type records, then adds new markdown records using a join on markdown_type.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub, public;

    ----------------------------------------------------------------------------------------
    -- Insert into markdown_type
    ----------------------------------------------------------------------------------------
    INSERT INTO markdown_type (name, description)
    VALUES
      ('Animal Entity', 'Animal entity markdown text details the fields that form an animal'),
      ('Animal Event', 'Animal event markdown text details the fields that form animal events'),
      ('Animal Bulk Upload', 'Animal bulk upload markdown text details');

----------------------------------------------------------------------------------------
-- Insert into markdown by selecting markdown_type_id based on markdown_type.name
----------------------------------------------------------------------------------------
INSERT INTO markdown (markdown_type_id, data)
SELECT
    mt.markdown_type_id,
    CASE
        WHEN mt.name = 'Animal Entity' THEN
            'An animal entity is comprised of a few base attributes: species, animal name, an animal description, animal sex, and ecological units where applicable.\n\n##### Species\nThe available species list in SIMS is derived from the Integrated Taxonomic Information System (ITIS).\n\n##### Nickname\nThe name for an animal is a required field. The contents for this field can be an informal nickname you give your animal, or whichever official identifier you use to distinguish it.\n\n##### Sex\nSex is not a required field, but including this information can enrich the quality of your dataset. The drop-down values for sex are unique to your selected species.\n\n##### Description\nAnimal description is a free-form comment box where you are welcome to add any information pertinent to your individual.\n\n##### Ecological Unit\nThe ecological unit options are tailored to your selected species.\n- An ecological unit may represent classifications such as an animal''s ecotype or population unit.'
        WHEN mt.name = 'Animal Event' THEN
            'Once your animal has been created, you can start attributing events to your animal. Events include both animal captures and animal mortalities.\n\n##### Capture Events\nCapture events, also referred to as animal handling events, are directly associated with an individual animal.\n Each capture event records key details such as the date, location, comments, release information, and any markings or measurements recorded for the animal at that specific point in time.\n\n##### Mortality Events\nMortality events can be reported for individual animals in your dataset.\n Each mortality event records key details such as the date, location, comments, cause of death, and any markings or measurements taken at that specific point in time.\n\nBy managing animal data and mortality events with a long-term perspective in SIMS, you can choose to contribute to building a robust dataset that supports survival analysis and informs conservation and management strategies.\n\n##### Measurements\nBody and life history measurements for an animal can be linked to its animal event, providing a detailed record of changes over time.\n The measurements are tailored to your selected species and will differ depending on the animal loaded to your surveys.\n\n##### Markings\nMarking information, whether current or newly placed, can be recorded during an event and attributed to a specific body marking location on the animal.\n These marking locations are tailored to specific taxa and will vary based on the species selected.'
        WHEN mt.name = 'Animal Bulk Upload' THEN
            'When using the bulk import option, the following fields can be included:\n\n##### ANIMAL\n- **Nickname**\n- **Species**: Must use ITIS numeric codes for species identification.\n- **Sex**\n- **Description**\n- **Ecological Unit Value and Option**\n\n##### CAPTURES\n- **Animal Alias**: A reference to the associated animal.\n- **Capture and Release Date**: In YYYY-MM-DD format.\n- **Capture and Release Time**: In military time, HH:MM:SS format.\n- **Capture and Release Comments**: in WGS 1984 decimal degrees format.\n\n##### MEASUREMENTS\n- **Animal Alias**: A reference to the associated animal.\n- **Capture Date and Time**: To associate the measurement with the correct capture event.\n- **Measurement Options**: A list of valid measurements for your chosen species can be found on the SIMS Standards page.\n\n##### MARKINGS\n- **Animal Alias**: A reference to the associated animal.\n- **Capture Date and Time**: To associate the marking with the correct capture event.\n- **Marking Type**: A list of valid markings can be found on the SIMS Standards page.\n- **Marking Body Location**: A list of valid marking body locations for your chosen species can be found on the SIMS Standards page.\n- **Marking Identifier**\n- **Marking Colours**: A list of valid colours can be found on the SIMS Standards page.'
    END AS data
FROM
    markdown_type mt
WHERE
    mt.name IN ('Animal Entity', 'Animal Event', 'Animal Bulk Upload');

  `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }
