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
      ('Animal Bulk Upload', 'Animal bulk upload markdown text details'),
      ('Observation Data Load', 'Observation data loading instructions markdown text'),
      ('Telemetry Manual Upload', 'Manual telemetry data loading instructions markdown text'),
      ('Telemetry Automated', 'Automated telemetry data instructions markdown text'),
      ('SPI Data', 'General information about SPI to SIMS data management');

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
        WHEN mt.name = 'Observation Data Load' THEN
            'Individual records can be added to your survey by clicking the record button on the top of the pane, and then specifying information such as species, sampling information, sign of observation, date, count, location, and any additional attributes for your configured columns.\n\n##### Bulk Uploading\n For a bulk import of observations record, a template can be downloaded with the applicable columns. The download button for this template exists at the top right of your observations pane. If you have configured any additional columns, they will also be included in your downloaded template. Guidance for the formatting of column values can be found on the SIMS Standards page. Templates can be loaded either to the survey (with your sampling information specified), or to an individual period on a sampling site (in which case your sampling information will auto populate onto your observation).'
        WHEN mt.name = 'Telemetry Manual Upload' THEN
            'Manual data can either be uploaded in bulk or through single record creation. \n\n##### Single Record Creation\n To create a single telemetry record, select the ADD RECORD button, and input your deployment information, your date, time, latitude and longitude of your collected record. Then, save your changes. If you are unhappy with the data you have loaded at any time, you can select your record(s) and then delete them using the vertical ellipses on the righthand side of the telemetry pane. \n\n##### Bulk Upload\n Static files of GPS location data can be loaded onto the telemetry page by csv through the large IMPORT button. The CSV is looking for the following five fields: \n- **DEVICE_ID**: as specified in your created deployment(s). \n- **DATE**: In YYYY-MM-DD format. \n- **TIME**: In military time, HH:MM:SS format. \n- **LATITUDE** and **LONGITUDE**: In WGS 1984 (CRS 4326) decimal degrees format. \n\n If your date/time falls outside of the start and end date constraints defined in your deployment for your device, the data will not submit properly.'
        WHEN mt.name = 'Telemetry Automated' THEN
            'SIMS has the functionality to automatically retrieve your GPS data from the vendor that sold you your device. So long as the vendor has not deleted their data, this process can occur even years after the inactivation of your device. \n\n For SIMS to retrieve these data, you will need to define your deployments first and then load the device keys you would have received upon the purchase of your telemetry device, onto the platform. These can be loaded through the large DEVICE KEYS button on the telemetry page. \n\n SIMS will retrieve your data on a nightly basis, allowing for close to real-time data population into your survey. SIMS will only retrieve the data from the device within the timeframe specified on your deployments. If you do not end your deployment once the device has been removed from your animal, the data will continue to populate into your survey. If you end your deployment, the data falling outside of your defined deployment dates will be removed.'
         WHEN mt.name = 'SPI Data' THEN
            'For decades, species data were submitted through the Species Inventory (SPI) database. SPI has historically been more submissions-centric, where data contributors could place pre-formatted templates of completed studies and send data off for submissions. SIMS is meant to replace SPI, and provide a tool for data management, where data contributors can directly interact with and load into the database, interact with their data at any stage of their study progress, and ammend data as necessary. \n\nAny data previously submitted using SPI will be migrated over to projects and surveys in SIMS, and assigned to team leads wherever possible. Thus eliminating any need to submit data twice. \n\nSPI has been around far longer than SIMS and has been developed to allow for data submissions for many specific scenarios. If you are finding that SIMS does not yet have the same capability of allowing your data in as SPI, please contact our team and we will work with you to figure out the best current avenue for your data, as well as modify SIMS to be more flexible for all studies.'
        END AS data
FROM
    markdown_type mt
WHERE
    mt.name IN ('Animal Entity', 'Animal Event', 'Animal Bulk Upload', 'Observation Data Load', 'Telemetry Manual Upload', 'Telemetry Automated','SPI Data');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
