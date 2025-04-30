import { Knex } from 'knex';

const TABLE_NAME = 'collection';
const SYSTEM_USER_TABLE_NAME = 'collection_system_user';
const SURVEY_TABLE_NAME = 'collection_survey';

/**
 * Insert test data for collections
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries to start fresh (in reverse order to avoid foreign key constraints)
  await knex(SURVEY_TABLE_NAME).del();
  await knex(SYSTEM_USER_TABLE_NAME).del();
  await knex(TABLE_NAME).del();

  // Get system user IDs for association
  const users = await knex('system_user').select('system_user_id');
  const adminUserId = users[0].system_user_id;
  const regularUserId1 = users[1]?.system_user_id || adminUserId;
  const regularUserId2 = users[2]?.system_user_id || adminUserId;

  // Get survey IDs for association
  const surveys = await knex('survey').select('survey_id');
  const surveyIds = surveys.map(survey => survey.survey_id).slice(0, 5);

  // Insert collections
  const [collection1] = await knex(TABLE_NAME)
    .insert([
      {
        name: 'Wildlife Conservation Collection',
        objectives: 'Combining surveys related to wildlife conservation efforts',
        owner: adminUserId,
        create_user: adminUserId
      }
    ])
    .returning('*');

  const [collection2] = await knex(TABLE_NAME)
    .insert([
      {
        name: 'Forest Ecosystem Monitoring',
        objectives: 'Tracking forest health and biodiversity in coastal regions',
        owner: regularUserId1,
        create_user: regularUserId1
      }
    ])
    .returning('*');

  const [collection3] = await knex(TABLE_NAME)
    .insert([
      {
        name: 'Marine Research Collection',
        objectives: 'Studies focused on marine ecosystems and conservation',
        owner: regularUserId1,
        create_user: regularUserId1
      }
    ])
    .returning('*');

  const [collection4] = await knex(TABLE_NAME)
    .insert([
      {
        name: 'Endangered Species Tracking',
        objectives: 'Monitoring populations of endangered and threatened species',
        owner: regularUserId2,
        create_user: regularUserId2
      }
    ])
    .returning('*');

  const [collection5] = await knex(TABLE_NAME)
    .insert([
      {
        name: 'Climate Impact Assessment',
        objectives: 'Assessing climate change impacts on local ecosystems',
        owner: adminUserId,
        create_user: adminUserId
      }
    ])
    .returning('*');

  // Add users to collections (collection_system_user)
  await knex(SYSTEM_USER_TABLE_NAME).insert([
    { collection_id: collection1.collection_id, user_id: adminUserId, create_user: adminUserId },
    { collection_id: collection1.collection_id, user_id: regularUserId1, create_user: adminUserId },
    { collection_id: collection2.collection_id, user_id: regularUserId1, create_user: regularUserId1 },
    { collection_id: collection2.collection_id, user_id: adminUserId, create_user: regularUserId1 },
    { collection_id: collection3.collection_id, user_id: regularUserId1, create_user: regularUserId1 },
    { collection_id: collection3.collection_id, user_id: regularUserId2, create_user: regularUserId1 },
    { collection_id: collection4.collection_id, user_id: regularUserId2, create_user: regularUserId2 },
    { collection_id: collection5.collection_id, user_id: adminUserId, create_user: adminUserId }
  ]);

  // Add surveys to collections if we have survey IDs
  if (surveyIds.length > 0) {
    const collectionSurveys = [];

    // Collection 1 gets surveys 1, 2
    if (surveyIds[0]) {
      collectionSurveys.push({
        collection_id: collection1.collection_id,
        survey_id: surveyIds[0],
        create_user: adminUserId
      });
    }
    if (surveyIds[1]) {
      collectionSurveys.push({
        collection_id: collection1.collection_id,
        survey_id: surveyIds[1],
        create_user: adminUserId
      });
    }

    // Collection 2 gets survey 2, 3
    if (surveyIds[1]) {
      collectionSurveys.push({
        collection_id: collection2.collection_id,
        survey_id: surveyIds[1],
        create_user: regularUserId1
      });
    }
    if (surveyIds[2]) {
      collectionSurveys.push({
        collection_id: collection2.collection_id,
        survey_id: surveyIds[2],
        create_user: regularUserId1
      });
    }

    // Collection 3 gets surveys 3, 4
    if (surveyIds[2]) {
      collectionSurveys.push({
        collection_id: collection3.collection_id,
        survey_id: surveyIds[2],
        create_user: regularUserId1
      });
    }
    if (surveyIds[3]) {
      collectionSurveys.push({
        collection_id: collection3.collection_id,
        survey_id: surveyIds[3],
        create_user: regularUserId1
      });
    }

    // Collection 4 gets survey 4
    if (surveyIds[3]) {
      collectionSurveys.push({
        collection_id: collection4.collection_id,
        survey_id: surveyIds[3],
        create_user: regularUserId2
      });
    }

    // Collection 5 gets survey 0, 4
    if (surveyIds[0]) {
      collectionSurveys.push({
        collection_id: collection5.collection_id,
        survey_id: surveyIds[0],
        create_user: adminUserId
      });
    }
    if (surveyIds[4]) {
      collectionSurveys.push({
        collection_id: collection5.collection_id,
        survey_id: surveyIds[4],
        create_user: adminUserId
      });
    }

    await knex(SURVEY_TABLE_NAME).insert(collectionSurveys);
  }
}