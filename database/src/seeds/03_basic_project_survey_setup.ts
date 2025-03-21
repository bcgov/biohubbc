import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const PROJECT_SEEDER_USER_IDENTIFIER = process.env.PROJECT_SEEDER_USER_IDENTIFIER;

const NUM_SEED_PROJECTS = Number(process.env.NUM_SEED_PROJECTS ?? 2);
const NUM_SEED_SURVEYS_PER_PROJECT = Number(process.env.NUM_SEED_SURVEYS_PER_PROJECT ?? 2);

const NUM_SEED_OBSERVATIONS_PER_SURVEY = Number(process.env.NUM_SEED_OBSERVATIONS_PER_SURVEY ?? 3);
const NUM_SEED_SUBCOUNTS_PER_OBSERVATION = Number(process.env.NUM_SEED_SUBCOUNTS_PER_OBSERVATION ?? 1);

type FocalTaxonIdOption = {
  itis_tsn: number;
  itis_scientific_name: string;
};

const focalTaxonIdOptions: FocalTaxonIdOption[] = [
  { itis_tsn: 180703, itis_scientific_name: 'Alces alces' }, // Moose
  { itis_tsn: 180700, itis_scientific_name: 'Rangifer' }, // Reindeer (genus)
  { itis_tsn: 180701, itis_scientific_name: 'Rangifer tarandus' }, // Reindeer (species)
  { itis_tsn: 180596, itis_scientific_name: 'Canis lupus' }, // Wolf
  { itis_tsn: 180713, itis_scientific_name: 'Oreamnos americanus' }, // Rocky Mountain goat
  { itis_tsn: 180543, itis_scientific_name: 'Ursus arctos' } // Grizzly bear
];

const surveyRegionsA = ['Kootenay-Boundary Natural Resource Region', 'West Coast Natural Resource Region'];
const surveyRegionsB = ['Cariboo Natural Resource Region', 'South Coast Natural Resource Region'];

const identitySources = ['IDIR', 'BCEIDBUSINESS', 'BCEIDBASIC'];

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
    SET SEARCH_PATH=${DB_SCHEMA};
  `);

  // Check if at least 1 funding sources already exists
  const checkFundingResponse = await knex.raw(checkAnyFundingSourceExists());

  if (!checkFundingResponse.rows.length) {
    // Insert funding source data
    await knex.raw(`
      ${insertFundingData()}
    `);
  }

  // Insert access requests
  for (let i = 0; i < 8; i++) {
    await knex.raw(`${insertAccessRequest()}`);
  }

  // Insert system alerts
  for (let i = 0; i < 8; i++) {
    await knex.raw(`${insertSystemAlert()}`);
  }

  const checkProjectsResponse = await knex.raw(getProjectCount());
  // The number of projects that already exist
  const numberOfProjects = checkProjectsResponse.rows[0].count;

  // If the number of projects that exist is less than the target number of seed projects
  if (numberOfProjects < NUM_SEED_PROJECTS) {
    for (let i = numberOfProjects; i < NUM_SEED_PROJECTS; i++) {
      // Insert project data
      const createProjectResponse = await knex.raw(insertProjectData(faker.lorem.words(8)));
      const projectId = createProjectResponse.rows[0].project_id;

      // Insert project IUCN and participants
      await knex.raw(`
        ${insertProjectIUCNData(projectId)}
        ${insertProjectParticipationData(projectId)}
      `);

      const checkSurveysResponse = await knex.raw(getSurveyCount(projectId));
      // The number of projects that already exist
      const numberOfSurveys = checkSurveysResponse.rows[0].count;

      // If the number of surveys that exists for this project is less than the target number of seed surveys
      for (let j = numberOfSurveys; j < NUM_SEED_SURVEYS_PER_PROJECT; j++) {
        const createSurveyResponse = await knex.raw(insertSurveyData(projectId, faker.lorem.words(8)));
        const surveyId = createSurveyResponse.rows[0].survey_id;

        await knex.raw(`
          ${insertSurveyTypeData(surveyId)}
          ${insertSurveyPermitData(surveyId)}
          ${insertSurveyFocalSpeciesData(surveyId)}
          ${insertSurveyFundingData(surveyId)}
          ${insertSurveyProprietorData(surveyId)}
          ${insertSurveyFirstNationData(surveyId)}
          ${insertSurveyStakeholderData(surveyId)}
          ${insertSurveyParticipationData(surveyId)}
          ${insertSurveyLocationData(surveyId)}
          ${insertSurveySiteStrategy(surveyId)}
          ${insertSurveyIntendedOutcome(surveyId)}
          ${insertSurveySamplingSiteData(surveyId)}
          ${insertMethodTechnique(surveyId)}
          ${insertSurveySamplePeriodData(surveyId)}
          ${insertSurveyBlockData(surveyId)}
        `);

        // Insert regions into surveys
        if (projectId % 2 === 0) {
          // Insert survey regions A
          for (const region of surveyRegionsA) {
            await knex.raw(`${insertSurveyRegionData(surveyId, region)}`);
          }
        } else {
          // Insert survey regions B
          for (const region of surveyRegionsB) {
            await knex.raw(`${insertSurveyRegionData(surveyId, region)}`);
          }
        }

        const response1 = await knex.raw(insertSurveyObservationData(surveyId, 20));
        await knex.raw(insertObservationSubCount(response1.rows[0].survey_observation_id));

        const response2 = await knex.raw(insertSurveyObservationData(surveyId, 20));
        await knex.raw(insertObservationSubCount(response2.rows[0].survey_observation_id));

        const response3 = await knex.raw(insertSurveyObservationData(surveyId, 20));
        await knex.raw(insertObservationSubCount(response3.rows[0].survey_observation_id));

        for (let k = 0; k < NUM_SEED_OBSERVATIONS_PER_SURVEY; k++) {
          const createObservationResponse = await knex.raw(
            // set the number of observations to minimum 20 times the number of subcounts (which are set to a number
            // between 1 and 20) to ensure the sum of all subcounts is at least <= the observation count (to avoid
            // constraint violations)
            insertSurveyObservationData(
              surveyId,
              NUM_SEED_SUBCOUNTS_PER_OBSERVATION * 20 + faker.number.int({ min: 1, max: 20 })
            )
          );
          for (let l = 0; l < NUM_SEED_SUBCOUNTS_PER_OBSERVATION; l++) {
            await knex.raw(insertObservationSubCount(createObservationResponse.rows[0].survey_observation_id));
          }
        }

        // Insert 3 random survey habitat feature records for each survey
        const resopnse4 = await knex.raw(insertSurveyHabitatFeaturesData(surveyId));
        // Insert 0-3 habitat feature taxon records for each survey habitat feature record
        const surveyHabitatFeatureIds = resopnse4.rows.map((row: any) => row.survey_habitat_feature_id);
        for (let m = 0; m < surveyHabitatFeatureIds.length; m++) {
          const query = insertSurveyHabitatFeatureTaxonsData(surveyHabitatFeatureIds[m]);
          if (!query) {
            continue;
          }
          await knex.raw(query);
        }
      }
    }
  }
}

const checkAnyFundingSourceExists = () => `
  SELECT
    funding_source_id
  FROM
    funding_source;
`;

const getProjectCount = () => `
  SELECT
    count(*)::integer as count
  FROM
    project;
`;

const getSurveyCount = (projectId: number) => `
  SELECT
    count(*)::integer as count
  FROM
    survey
  WHERE 
    project_id = ${projectId};
`;

const insertSurveySiteStrategy = (surveyId: number) => `
  INSERT into survey_site_strategy
    (
      survey_id,
      site_strategy_id
    )
  VALUES (
    ${surveyId},
    (select site_strategy_id  from site_strategy ss order by random() limit 1)
  );
`;

const insertSurveyParticipationData = (surveyId: number) => `
  INSERT into survey_participation
    ( survey_id, system_user_id, survey_job_id )
  VALUES
    (
      ${surveyId},
      (
        SELECT COALESCE((
          SELECT
            system_user_id
          FROM
            "system_user" su
          WHERE
            su.user_identifier = '${PROJECT_SEEDER_USER_IDENTIFIER}'
        ), 1)
      ),
      (SELECT survey_job_id FROM survey_job LIMIT 1)
    )
  ;
`;

const insertSurveyBlockData = (surveyId: number) => `
  INSERT into survey_block
    ( survey_id, name, description, geojson )
  VALUES
    (
      ${surveyId},
      '${faker.lorem.words(2)}',
      '${faker.lorem.words(10)}',
      '{
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
      }'
    )
  ;
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
    (select proprietor_type_id from proprietor_type where is_first_nation is false order by random() limit 1),
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
      funding_source_id
    )
  VALUES (
    ${surveyId},
    (select funding_source_id from funding_source order by random() limit 1)
  );
`;

/**
 * SQL to insert Survey study species data
 *
 */
const insertSurveyFocalSpeciesData = (surveyId: number) => {
  const focalSpecies = focalTaxonIdOptions[Math.floor(Math.random() * focalTaxonIdOptions.length)];

  return `
    INSERT into study_species
      (
        survey_id,
        itis_tsn,
        is_focal
      )
    VALUES (
      ${surveyId},
      ${focalSpecies.itis_tsn},
      'Y'
    );
  `;
};

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
 * SQL to insert Survey location data
 *
 */
const insertSurveyLocationData = (surveyId: number) => `
  INSERT into survey_location
    (
      survey_id,
      name,
      description,
      geography,
      geojson
    )
  VALUES (
    ${surveyId},
    $$${faker.lorem.words(2)}$$,
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
    ]'
  );
`;

/**
 * SQL to insert Survey data
 *
 */
const insertSurveyData = (projectId: number, surveyName?: string) => `
  INSERT into survey
    (
      project_id,
      name,
      additional_details,
      start_date,
      end_date,
      progress_id,
      lead_first_name,
      lead_last_name
    )
  VALUES (
    ${projectId},
    '${surveyName ?? 'Seed Survey'}',
    $$${faker.lorem.sentences(2)}$$,
    $$${faker.date.between({ from: '2010-01-01T00:00:00-08:00', to: '2015-01-01T00:00:00-08:00' }).toISOString()}$$,
    $$${faker.date.between({ from: '2020-01-01T00:00:00-08:00', to: '2025-01-01T00:00:00-08:00' }).toISOString()}$$,
    CEIL(RANDOM() * 3),
    $$${faker.person.firstName()}$$,
    $$${faker.person.lastName()}$$
  )
  RETURNING survey_id;
`;

const insertSurveyIntendedOutcome = (surveyId: number) => `
    INSERT into survey_intended_outcome
    (
      survey_id,
      intended_outcome_id
    )
    VALUES
    (
      ${surveyId},
      (select intended_outcome_id from intended_outcome order by random() limit 1)
    );
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
            "system_user" su
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
 * SQL to insert Survey First Nation Partnership data
 *
 */
const insertSurveyFirstNationData = (surveyId: number) => `
  INSERT into survey_first_nation_partnership
    (
      survey_id,
      first_nations_id
    )
  VALUES
    (
      ${surveyId},
      (SELECT first_nations_id from first_nations order by random() limit 1)
    )
  ;
`;

/**
 * SQL to insert Project Stakeholder Partnership data
 *
 */
const insertSurveyStakeholderData = (surveyId: number) => `
  INSERT into survey_stakeholder_partnership
    (
      survey_id,
      name
    )
  VALUES
    (
      ${surveyId},
      (select name from agency order by random() limit 1)
    )
  ;
`;

/**
 * SQL to insert survey sampling site data.
 *
 * Note: inserts 2 records.
 */
const insertSurveySamplingSiteData = (surveyId: number) => {
  return `
  INSERT INTO survey_sample_site
  (
    survey_id,
    name,
    description,
    geojson,
    geography
  ) VALUES (
    ${surveyId},
    'Seed Sampling Site 1',
    $$${faker.lorem.sentences(2)}$$,
    '
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-121,    51],
            [-121,    51.7],
            [-120.5,  51.7],
            [-120.5,  51],
            [-121,    51]
          ]
        ]
      },
      "properties": {}
    }
  ',
    public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
          public.ST_Force2D(public.ST_GeomFromGeoJSON('
            {
                "type": "Polygon",
                "coordinates": [
                  [
                    [-121,    51],
                    [-121,    51.7],
                    [-120.5,  51.7],
                    [-120.5,  51],
                    [-121,    51]
                  ]
                ]
              }
          ')
          ), 4326
        )
      )
    )
  );

  INSERT INTO survey_sample_site
  (
    survey_id,
    name,
    description,
    geojson,
    geography
  ) VALUES (
    ${surveyId},
    'Seed Sampling Site 2',
    $$${faker.lorem.sentences(2)}$$,
    '
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              -123.48670808782796,
              48.57587832003665
            ],
            [
              -123.50584369160048,
              48.55310156995935
            ],
            [
              -123.5394224642383,
              48.544478508078555
            ],
            [
              -123.53316946214912,
              48.5184960860976
            ],
            [
              -123.55000254581361,
              48.491415617637415
            ],
            [
              -123.54703259433052,
              48.46504865533649
            ],
            [
              -123.52571395237894,
              48.48347577552943
            ],
            [
              -123.49743487585154,
              48.4840592739221
            ],
            [
              -123.49743154915066,
              48.472392710482666
            ],
            [
              -123.48304409323536,
              48.47145764800945
            ],
            [
              -123.46122716654514,
              48.46038142451289
            ],
            [
              -123.44031357811758,
              48.47667084086717
            ],
            [
              -123.44773813958989,
              48.48005214284231
            ],
            [
              -123.442625179115,
              48.48835907306312
            ],
            [
              -123.48025615900829,
              48.4942114332614
            ],
            [
              -123.47886647515259,
              48.4988258772064
            ],
            [
              -123.46163788603168,
              48.50189215858808
            ],
            [
              -123.45787982438264,
              48.532702865209444
            ],
            [
              -123.47604105914064,
              48.54223406745959
            ],
            [
              -123.45922661296157,
              48.54106867209509
            ],
            [
              -123.46379796562738,
              48.559419578754046
            ],
            [
              -123.47692623718274,
              48.5596095679106
            ],
            [
              -123.47593508866987,
              48.572778325814596
            ],
            [
              -123.48670808782796,
              48.57587832003665
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ',
    public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
          public.ST_Force2D(public.ST_GeomFromGeoJSON('
            {
            "coordinates": [
                [
                [
                    -123.48670808782796,
                    48.57587832003665
                ],
                [
                    -123.50584369160048,
                    48.55310156995935
                ],
                [
                    -123.5394224642383,
                    48.544478508078555
                ],
                [
                    -123.53316946214912,
                    48.5184960860976
                ],
                [
                    -123.55000254581361,
                    48.491415617637415
                ],
                [
                    -123.54703259433052,
                    48.46504865533649
                ],
                [
                    -123.52571395237894,
                    48.48347577552943
                ],
                [
                    -123.49743487585154,
                    48.4840592739221
                ],
                [
                    -123.49743154915066,
                    48.472392710482666
                ],
                [
                    -123.48304409323536,
                    48.47145764800945
                ],
                [
                    -123.46122716654514,
                    48.46038142451289
                ],
                [
                    -123.44031357811758,
                    48.47667084086717
                ],
                [
                    -123.44773813958989,
                    48.48005214284231
                ],
                [
                    -123.442625179115,
                    48.48835907306312
                ],
                [
                    -123.48025615900829,
                    48.4942114332614
                ],
                [
                    -123.47886647515259,
                    48.4988258772064
                ],
                [
                    -123.46163788603168,
                    48.50189215858808
                ],
                [
                    -123.45787982438264,
                    48.532702865209444
                ],
                [
                    -123.47604105914064,
                    48.54223406745959
                ],
                [
                    -123.45922661296157,
                    48.54106867209509
                ],
                [
                    -123.46379796562738,
                    48.559419578754046
                ],
                [
                    -123.47692623718274,
                    48.5596095679106
                ],
                [
                    -123.47593508866987,
                    48.572778325814596
                ],
                [
                    -123.48670808782796,
                    48.57587832003665
                ]
                ]
            ],
            "type": "Polygon"
            }
          ')
          ), 4326
        )
      )
    )
  );
`;
};

/**
 * SQL to insert method_technique. Requires method lookup.
 *
 * Note: Inserts 2 records.
 */
const insertMethodTechnique = (surveyId: number) => {
  return `
    INSERT INTO method_technique
    (
        survey_id,
        method_lookup_id,
        name,
        description,
        distance_threshold,
        method_response_metric_id
    )
    VALUES
    (
        ${surveyId},
        (SELECT method_lookup_id FROM method_lookup ORDER BY random() LIMIT 1),
        $$${faker.lorem.word(10)}$$,
        $$${faker.lorem.sentences(2)}$$,
        $$${faker.number.int({ min: 1, max: 50 })}$$,
        (SELECT method_response_metric_id FROM method_response_metric ORDER BY random() LIMIT 1)
    );

    INSERT INTO method_technique
    (
        survey_id,
        method_lookup_id,
        name,
        description,
        distance_threshold,
        method_response_metric_id
    )
    VALUES
    (
        ${surveyId},
        (SELECT method_lookup_id FROM method_lookup ORDER BY random() LIMIT 1),
        $$${faker.lorem.word(5)}$$,
        $$${faker.lorem.sentences(1)}$$,
        $$${faker.number.int({ min: 50, max: 99 })}$$,
        (SELECT method_response_metric_id FROM method_response_metric ORDER BY random() LIMIT 1)
    );
  `;
};

/**
 * SQL to insert survey sampling period data. Requires survey_sampling_site and method_technique.
 *
 * Note: inserts 3 records, one with only a survey_sample_site_id, one with a survey_sample_site_id and
 * method_technique_id, and one with all fields set.
 */
const insertSurveySamplePeriodData = (surveyId: number) => {
  return `
  -- Partial record where only a survey_sample_site_id is set
  INSERT INTO survey_sample_period
  (
    survey_id,
    survey_sample_site_id
  )
  VALUES
  (
    ${surveyId},
    (SELECT survey_sample_site_id FROM survey_sample_site WHERE survey_id = ${surveyId} LIMIT 1)
  );
  
  -- Partial record where only a survey_sample_site_id and method_technique_id is set
  INSERT INTO survey_sample_period
  (
    survey_id,
    survey_sample_site_id,
    method_technique_id
  )
  VALUES
  (
    ${surveyId},
    (SELECT survey_sample_site_id FROM survey_sample_site WHERE survey_id = ${surveyId} LIMIT 1),
    (SELECT method_technique_id FROM method_technique WHERE survey_id = ${surveyId} LIMIT 1)
  );

  -- Full record where all fields are set
  INSERT INTO survey_sample_period
  (
    survey_id,
    survey_sample_site_id,
    method_technique_id,
    start_date,
    end_date
  )
  VALUES
  (
    ${surveyId},
    (SELECT survey_sample_site_id FROM survey_sample_site WHERE survey_id = ${surveyId} LIMIT 1),
    (SELECT method_technique_id FROM method_technique WHERE survey_id = ${surveyId} LIMIT 1),
    $$${faker.date
      .between({ from: '2000-01-01T00:00:00-08:00', to: '2001-01-01T00:00:00-08:00' })
      .toISOString()}$$::date,
    $$${faker.date
      .between({ from: '2002-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
      .toISOString()}$$::date
  );
  `;
};

const insertObservationSubCount = (surveyObservationId: number) => `
  INSERT INTO observation_subcount
  (
    survey_observation_id,
    subcount,
    observation_subcount_sign_id
  )
  VALUES
  (
    ${surveyObservationId},
    $$${faker.number.int({ min: 1, max: 20 })}$$,
    (SELECT observation_subcount_sign_id FROM observation_subcount_sign ORDER BY random() LIMIT 1)
  );
`;

/**
 * SQL to insert survey observation data. Requires sampling site, method, period.
 *
 */
const insertSurveyObservationData = (surveyId: number, count: number) => {
  // Randomly select a species
  const species = focalTaxonIdOptions[Math.floor(Math.random() * focalTaxonIdOptions.length)];

  return `
  INSERT INTO survey_observation
  (
    survey_id,
    itis_tsn,
    itis_scientific_name,
    latitude,
    longitude,
    count,
    observation_date,
    observation_time,
    survey_sample_period_id
  )
  VALUES
  (
    ${surveyId},
    $$${species.itis_tsn}$$,
    $$${species.itis_scientific_name}$$,
    $$${faker.number.int({ min: 48, max: 60 })}$$,
    $$${faker.number.int({ min: -132, max: -116 })}$$,
    $$${count}$$,
    $$${faker.date
      .between({ from: '2000-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
      .toISOString()}$$::date,
    timestamp $$${faker.date
      .between({ from: '2000-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
      .toISOString()}$$::time,
    (SELECT survey_sample_period_id FROM survey_sample_period WHERE survey_id = ${surveyId} ORDER BY random() LIMIT 1)
  )
  RETURNING survey_observation_id;
`;
};

/**
 * SQL to insert Project data
 *
 */
const insertProjectData = (projectName?: string) => `
  INSERT into project
    (
      name,
      objectives,
      location_description,
      geography,
      geojson
    )
  VALUES (
    '${projectName ?? 'Seed Project'}',
    $$${faker.lorem.sentences(2)}$$,
    $$${faker.lorem.sentences(2)}$$,
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

/**
 * SQL to insert survey regions
 *
 */
const insertSurveyRegionData = (surveyId: string, region: string) => `
  INSERT INTO survey_region
  (
    survey_id,
    region_id
  )
  SELECT
    $$${surveyId}$$,
    region_id
  FROM
    region_lookup
  WHERE
    region_name = $$${region}$$;
`;

/**
 * SQL to insert system access requests
 *
 */
const insertAccessRequest = () => `
  INSERT INTO administrative_activity
    (
      administrative_activity_status_type_id,
      administrative_activity_type_id,
      reported_system_user_id,
      assigned_system_user_id,
      description,
      data,
      notes
    )
  VALUES (
    (SELECT administrative_activity_status_type_id FROM administrative_activity_status_type ORDER BY random() LIMIT 1),
    (SELECT administrative_activity_type_id FROM administrative_activity_type WHERE name = 'System Access'),
    (SELECT system_user_id FROM "system_user" ORDER BY random() LIMIT 1),
    (SELECT system_user_id FROM "system_user" ORDER BY random() LIMIT 1),
    $$${faker.lorem.sentences(2)}$$,
    jsonb_build_object(
        'reason', '${faker.lorem.sentences(1)}',
        'userGuid', '${faker.string.uuid()}',
        'name', '${faker.lorem.words(2)}',
        'username', '${faker.lorem.words(1)}',
        'email', 'default',
        'identitySource', '${identitySources[faker.number.int({ min: 0, max: identitySources.length - 1 })]}',
        'displayName', '${faker.lorem.words(1)}'
    ),
    $$${faker.lorem.sentences(2)}$$
  );
  `;

/**
 * SQL to insert a fake system alert
 *
 */
const insertSystemAlert = () => `
  INSERT INTO alert
    (
      alert_type_id,
      name,
      message,
      data,
      severity,
      record_end_date,
      create_user,
      update_user
    )
  VALUES (
    (SELECT alert_type_id FROM alert_type ORDER BY random() LIMIT 1),
    $$${faker.lorem.words(3)}$$,
    $$${faker.lorem.sentences(2)}$$,
    NULL,
    '${faker.helpers.arrayElement(['info', 'success', 'warning', 'error'])}',
    (CASE WHEN random() < 0.5 THEN NULL ELSE (CURRENT_DATE - INTERVAL '30 days') END),
    (SELECT system_user_id FROM "system_user" ORDER BY random() LIMIT 1),
    (SELECT system_user_id FROM "system_user" ORDER BY random() LIMIT 1)
  );
`;

/**
 * Insert 3 survey_habitat_feature records, with 3 different random habitat_feature_types.
 *
 * @param {number} surveyId
 * @return {*}
 */
const insertSurveyHabitatFeaturesData = (surveyId: number) => {
  return `
    WITH w_habitat_features AS (
        SELECT * FROM habitat_feature_type ORDER BY random() LIMIT 3
    )
    INSERT INTO survey_habitat_feature
    (
        survey_id,
        habitat_feature_type_id,
        count,
        latitude,
        longitude,
        observed_date,
        observed_time
    )
    VALUES (
        ${surveyId},
        (SELECT habitat_feature_type_id FROM w_habitat_features LIMIT 1 OFFSET 0),
        ${faker.number.int({ min: 1, max: 20 })},
        ${faker.location.latitude()},
        ${faker.location.longitude()},
        $$${faker.date
          .between({ from: '2000-01-01T00:00:00-08:00', to: '2001-01-01T00:00:00-08:00' })
          .toISOString()}$$::date,
        timestamp $$${faker.date
          .between({ from: '2002-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
          .toISOString()}$$::time
    ),
    (
        ${surveyId},
        (SELECT habitat_feature_type_id FROM w_habitat_features LIMIT 1 OFFSET 1),
        ${faker.number.int({ min: 1, max: 20 })},
        ${faker.location.latitude()},
        ${faker.location.longitude()},
        $$${faker.date
          .between({ from: '2000-01-01T00:00:00-08:00', to: '2001-01-01T00:00:00-08:00' })
          .toISOString()}$$::date,
        timestamp $$${faker.date
          .between({ from: '2002-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
          .toISOString()}$$::time
    ),
    (
        ${surveyId},
        (SELECT habitat_feature_type_id FROM w_habitat_features LIMIT 1 OFFSET 2),
        ${faker.number.int({ min: 1, max: 20 })},
        ${faker.location.latitude()},
        ${faker.location.longitude()},
        $$${faker.date
          .between({ from: '2000-01-01T00:00:00-08:00', to: '2001-01-01T00:00:00-08:00' })
          .toISOString()}$$::date,
        timestamp $$${faker.date
          .between({ from: '2002-01-01T00:00:00-08:00', to: '2005-01-01T00:00:00-08:00' })
          .toISOString()}$$::time
    )
    RETURNING survey_habitat_feature_id;
  `;
};

const insertSurveyHabitatFeatureTaxonsData = (surveyHabitatFeatureId: number): string | null => {
  // Randomly select species items
  const randomSpecies: FocalTaxonIdOption[] = getRandomElementsFromArray(focalTaxonIdOptions, 0, 3);

  const getValueSection = (surveyHabitatFeatureId: number, species: FocalTaxonIdOption) => {
    return `
        (
            ${surveyHabitatFeatureId},
            ${species.itis_tsn},
            $$${species.itis_scientific_name}$$,
            $$${faker.lorem.sentences(1)}$$
        )
    `;
  };

  const valueSections = [];
  for (let i = 0; i < randomSpecies.length; i++) {
    valueSections.push(getValueSection(surveyHabitatFeatureId, randomSpecies[i]));
  }

  if (valueSections.length === 0) {
    // Nothing to insert
    return null;
  }

  return (
    `
        INSERT INTO survey_habitat_feature_taxon
        (
            survey_habitat_feature_id,
            itis_tsn,
            itis_scientific_name,
            comment
        ) VALUES 
    ` + valueSections.join(',')
  );
};

const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const getRandomElementsFromArray = (array: any[], min: number, max: number): any[] => {
  const numberOfElements = getRandomNumber(min, max);

  const randomlySorted = array.sort(() => 0.5 - Math.random());

  return randomlySorted.slice(0, numberOfElements);
};
