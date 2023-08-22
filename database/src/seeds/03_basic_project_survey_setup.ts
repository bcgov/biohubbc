import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;
const PROJECT_SEEDER_USER_IDENTIFIER = process.env.PROJECT_SEEDER_USER_IDENTIFIER;

/**
 * Add spatial transform
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA}, ${DB_SCHEMA_DAPI_V1};
  `);

  const response = await knex.raw(`
    ${checkAnyProjectExists()}
  `);

  if (!response?.rows?.[0]) {
    await knex.raw(`
      ${insertProjectData()}
      ${insertProjectTypeData()}
      ${insertProjectFirstNationData()}
      ${insertProjectIUCNData()}
      ${insertProjectParticipationData()}
      ${insertProjectStakeholderData()}
      ${insertFundingData()}
      ${insertSurveyData()}
      ${insertSurveyPermitData()}
      ${insertSurveySpeciesData()}
      ${insertSurveyFundingData()}
      ${insertSurveyProprietorData()}
      ${insertSurveyVantageData()}
      ${insertProjectProgramData()}
      ${insertSurveyParticipationData()}
      `);
  }
}

const checkAnyProjectExists = () => `
  SELECT
    project_id
  FROM
    project;
`;

/**
 * SQL to insert Project Program data
 *
 */
const insertProjectProgramData = () => `
  INSERT into project_program
    (
      project_id,
      program_id
    )
  VALUES (
    1, 3
  );
`;

const insertSurveyParticipationData = () => `
  INSERT into survey_participation
    ( survey_id, system_user_id, survey_job_id )
  VALUES
    (
      1,
      (
        SELECT COALESCE((
          SELECT
            system_user_id
          FROM
            system_user su
          WHERE
            su.user_identifier = '${PROJECT_SEEDER_USER_IDENTIFIER}'
        ), 1)
      ),
      (SELECT survey_job_id FROM survey_job WHERE name = 'Pilot' LIMIT 1)
    )
  ;
`;


/**
 * SQL to insert Survey Vantage data
 *
 */
const insertSurveyVantageData = () => `
  INSERT into survey_vantage
    (
      survey_id,
      vantage_id
    )
  VALUES (
    1, 1
  );
`;

/**
 * SQL to insert Survey Proprietor data
 *
 */
const insertSurveyProprietorData = () => `
  INSERT into survey_proprietor
    (
      survey_id,
      proprietor_type_id,
      rationale,
      proprietor_name,
      disa_required
    )
  VALUES (
    1, 4, 'Category Rationale', 'Proprietor Name', 'Y'
  );
`;

const insertFundingData = () => `
  INSERT into funding_source
  (
    name,
    description,
    record_effective_date
  )
  VALUES (
    'Funding Source Name',
    'Funding Source Description',
    '2021-01-01'
  );
`;

/**
 * SQL to insert Survey funding data
 *
 */
const insertSurveyFundingData = () => `
  INSERT into survey_funding_source
    (
      survey_id,
      funding_source_id,
      amount
    )
  VALUES (
    1, 1, 1000
  );
`;

/**
 * SQL to insert Survey study species data
 *
 */
const insertSurveySpeciesData = () => `
  INSERT into study_species
    (
      survey_id,
      wldtaxonomic_units_id,
      is_focal
    )
  VALUES (
    1, 2065, 'Y'
  );
`;

/**
 * SQL to insert Survey permit data
 *
 */
const insertSurveyPermitData = () => `
  INSERT into permit
    (
      survey_id,
      number,
      type
    )
  VALUES (
    1, 1234, 'Park Use Permit'
  );
`;

/**
 * SQL to insert Survey data
 *
 */
const insertSurveyData = () => `
  INSERT into survey
    (
      project_id,
      field_method_id,
      name,
      additional_details,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      location_name,
      geography,
      geojson,
      ecological_season_id,
      intended_outcome_id
    )
  VALUES (
    1,
    12,
    'Survey Name',
    'Additional Details',
    '2023-01-02',
    '2023-01-30',
    'First Name',
    'Last Name',
    'Survey Area Name',
    'POLYGON ((-121.904297 50.930738, -121.904297 51.971346, -120.19043 51.971346, -120.19043 50.930738, -121.904297 50.930738))',
    '[
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -121.904297,
                50.930738
              ],
              [
                -121.904297,
                51.971346
              ],
              [
                -120.19043,
                51.971346
              ],
              [
                -120.19043,
                50.930738
              ],
              [
                -121.904297,
                50.930738
              ]
            ]
          ]
        },
        "properties": {}
      }
    ]',
    1,
    1
  );
`;

/**
 * SQL to insert Project participation data
 *
 */
const insertProjectParticipationData = () => `
  INSERT into project_participation
    ( project_id, system_user_id, project_role_id )
  VALUES
    (
      1,
      (
        SELECT COALESCE((
          SELECT
            system_user_id
          FROM
            system_user su
          WHERE
            su.user_identifier = '${PROJECT_SEEDER_USER_IDENTIFIER}'
        ), 1)
      ),
      (SELECT project_role_id FROM project_role WHERE name = 'Coordinator' LIMIT 1)
    )
  ;
`;

/**
 * SQL to insert Project iucn data
 *
 */
const insertProjectIUCNData = () => `
  INSERT into project_iucn_action_classification
    ( project_id, iucn_conservation_action_level_3_subclassification_id )
  VALUES
    ( 1, 34 )
  ;
`;

/**
 * SQL to insert Project Type data
 *
 */
const insertProjectTypeData = () => `
  INSERT into project_type
    ( project_id, type_id )
  VALUES
    ( 1, 5 )
  ;
`;

/**
 * SQL to insert Project First Nation data
 *
 */
const insertProjectFirstNationData = () => `
  INSERT into project_first_nation
    ( project_id, first_nations_id )
  VALUES
    ( 1, 206 )
  ;
`;

/**
 * SQL to insert Project Stakeholder data
 *
 */
const insertProjectStakeholderData = () => `
  INSERT into stakeholder_partnership
    ( project_id, name )
  VALUES
    ( 1, 'BC Hydro' )
  ;
`;

/**
 * SQL to insert Project data
 *
 */
const insertProjectData = () => `
  INSERT into project
    (
      name,
      objectives,
      location_description,
      start_date,
      end_date,
      coordinator_first_name,
      coordinator_last_name,
      coordinator_email_address,
      coordinator_agency_name,
      coordinator_public,
      geography,
      geojson
    )
  VALUES (
    'Default Project',
    'Objectives',
    'Location Description',
    '2023-01-01',
    '2023-01-31',
    'First Name',
    'Last Name',
    'EMAIL@address.com',
    'A Rocha Canada',
    'Y',
    'POLYGON ((-121.904297 50.930738, -121.904297 51.971346, -120.19043 51.971346, -120.19043 50.930738, -121.904297 50.930738))',
    '[
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -121.904297,
                50.930738
              ],
              [
                -121.904297,
                51.971346
              ],
              [
                -120.19043,
                51.971346
              ],
              [
                -120.19043,
                50.930738
              ],
              [
                -121.904297,
                50.930738
              ]
            ]
          ]
        },
        "properties": {}
      }
    ]'
  );
`;
