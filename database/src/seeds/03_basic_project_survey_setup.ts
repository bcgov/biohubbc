import { faker } from '@faker-js/faker';
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
    SET SEARCH_PATH=${DB_SCHEMA},${DB_SCHEMA_DAPI_V1};
  `);

  // Check if at least 1 funding sources already exists
  const response1 = await knex.raw(`
    ${checkAnyFundingSourceExists()}
  `);

  if (!response1.rows.length) {
    // Insert funding source data
    await knex.raw(`
      ${insertFundingData()}
    `);
  }

  // Check if at least 1 project already exists
  const response2 = await knex.raw(`
    ${checkAnyProjectExists()}
  `);

  if (!response2.rows.length) {
    // Insert project data
    const response3 = await knex.raw(`${insertProjectData()}`);
    const projectId = response3.rows[0].project_id;
    await knex.raw(`
      ${insertProjectFirstNationData(projectId)}
      ${insertProjectFirstNationData(projectId)}
      ${insertProjectIUCNData(projectId)}
      ${insertProjectParticipationData(projectId)}
      ${insertProjectStakeholderData(projectId)}
      ${insertProjectProgramData(projectId)}
    `);

    // Insert survey data
    const response4 = await knex.raw(`
      ${insertSurveyData(projectId)}
    `);
    const surveyId = response4.rows[0].survey_id;
    await knex.raw(`
      ${insertSurveyTypeData(surveyId)}
      ${insertSurveyPermitData(surveyId)}
      ${insertSurveyFocalSpeciesData(surveyId)}
      ${insertSurveyAncillarySpeciesData(surveyId)}
      ${insertSurveyFundingData(surveyId)}
      ${insertSurveyProprietorData(surveyId)}
      ${insertSurveyVantageData(surveyId)}
    `);
  }
}

const checkAnyFundingSourceExists = () => `
  SELECT
    funding_source_id
  FROM
    funding_source;
`;

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
const insertProjectProgramData = (projectId: number) => `
  INSERT into project_program
    (
      project_id,
      program_id
    )
  VALUES (
    ${projectId}, 
    (select program_id from program order by random() limit 1)
  );
`;

/**
 * SQL to insert Survey Vantage data
 *
 */
const insertSurveyVantageData = (surveyId: number) => `
  INSERT into survey_vantage
    (
      survey_id,
      vantage_id
    )
  VALUES (
    ${surveyId},
    (select vantage_id from vantage order by random() limit 1)
  );
`;

/**
 * SQL to insert Survey Proprietor data
 *
 */
const insertSurveyProprietorData = (surveyId: number) => `
  INSERT into survey_proprietor
    (
      survey_id,
      proprietor_type_id,
      rationale,
      proprietor_name,
      disa_required
    )
  VALUES (
    ${surveyId},
    (select proprietor_type_id from proprietor_type order by random() limit 1),
    $$${faker.company.catchPhraseDescriptor()}$$,
    $$${faker.company.name()}$$,
    'Y'
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
    $$${faker.company.name()}$$,
    $$${faker.lorem.lines(2)}$$,
    $$${faker.date.between({ from: '2000-01-01T00:00:00-08:00', to: '2020-01-01T00:00:00-08:00' }).toISOString()}$$
  );
`;

/**
 * SQL to insert Survey funding data
 *
 */
const insertSurveyFundingData = (surveyId: number) => `
  INSERT into survey_funding_source
    (
      survey_id,
      funding_source_id,
      amount
    )
  VALUES (
    ${surveyId},
    (select funding_source_id from funding_source order by random() limit 1),
    ${faker.commerce.price({ min: 100, max: 99999999, dec: 0 })}
  );
`;

/**
 * SQL to insert Survey study species data
 *
 */
const focalTaxonIdOptions = [2065, 2066, 2067, 2068];
const insertSurveyFocalSpeciesData = (surveyId: number) => `
  INSERT into study_species
    (
      survey_id,
      wldtaxonomic_units_id,
      is_focal
    )
  VALUES (
    ${surveyId},
    ${focalTaxonIdOptions[Math.floor(Math.random() * focalTaxonIdOptions.length)]},
    'Y'
  );
`;
const ancillaryTaxonIdOptions = [1666, 1667, 1668, 1669];
const insertSurveyAncillarySpeciesData = (surveyId: number) => `
  INSERT into study_species
    (
      survey_id,
      wldtaxonomic_units_id,
      is_focal
    )
  VALUES (
    ${surveyId},
    ${ancillaryTaxonIdOptions[Math.floor(Math.random() * ancillaryTaxonIdOptions.length)]},
    'N'
  );
`;

/**
 * SQL to insert Survey permit data
 *
 */
const insertSurveyPermitData = (surveyId: number) => `
  INSERT into permit
    (
      survey_id,
      number,
      type
    )
  VALUES (
    ${surveyId},
    $$${faker.number.int({ min: 10000, max: 999999 })}$$,
    'Park Use Permit'
  );
`;

/**
 * SQL to insert Survey data
 *
 */
const insertSurveyData = (projectId: number) => `
  INSERT into survey
    (
      project_id,
      name,
      field_method_id,
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
    ${projectId},
    'Seed Survey',
    (select field_method_id from field_method order by random() limit 1),
    $$${faker.lorem.sentences(2)}$$,
    $$${faker.date.between({ from: '2010-01-01T00:00:00-08:00', to: '2015-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2020-01-01T00:00:00-08:00', to: '2025-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.person.firstName()}$$,
    $$${faker.person.lastName()}$$,
    $$${faker.lorem.words(6)}$$,
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
    (select ecological_season_id from ecological_season order by random() limit 1),
    (select intended_outcome_id from intended_outcome order by random() limit 1)
  )
  RETURNING survey_id;
`;

/**
 * SQL to insert Project participation data
 *
 */
const insertProjectParticipationData = (projectId: number) => `
  INSERT into project_participation
    ( 
      project_id,
      system_user_id,
      project_role_id
    )
  VALUES
    (
      ${projectId},
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
const insertProjectIUCNData = (projectId: number) => `
  INSERT into project_iucn_action_classification
    (
      project_id,
      iucn_conservation_action_level_3_subclassification_id
    )
  VALUES
    (
      ${projectId},
      (select iucn_conservation_action_level_3_subclassification_id from iucn_conservation_action_level_3_subclassification order by random() limit 1)
    )
  ;
`;

/**
 * SQL to insert Project Type data
 *
 */
const insertSurveyTypeData = (surveyId: number) => `
  INSERT into survey_type
    (
      survey_id,
      type_id
    )
  VALUES
    (
      ${surveyId}, 
      (SELECT type_id from type order by random() limit 1)
    )
  ;
`;

/**
 * SQL to insert Project First Nation data
 *
 */
const insertProjectFirstNationData = (projectId: number) => `
  INSERT into project_first_nation
    (
      project_id,
      first_nations_id
    )
  VALUES
    (
      ${projectId},
      (SELECT first_nations_id from first_nations order by random() limit 1)
    )
  ;
`;

/**
 * SQL to insert Project Stakeholder data
 *
 */
const insertProjectStakeholderData = (projectId: number) => `
  INSERT into stakeholder_partnership
    (
      project_id,
      name
    )
  VALUES
    (
      ${projectId},
      (select name from agency order by random() limit 1)
    )
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
    'Seed Project',
    $$${faker.lorem.sentences(2)}$$,
    $$${faker.lorem.sentences(2)}$$,
    $$${faker.date.between({ from: '2000-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2025-01-01T00:00:00-08:00', to: '2030-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.person.firstName()}$$,
    $$${faker.person.lastName()}$$,
    $$${faker.internet.email()}$$,
    $$${faker.company.name()}$$,
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
  )
  RETURNING project_id;
`;
