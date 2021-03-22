import { IDBConnection } from '../database/db';
import {
  getClimateChangeInitiativeSQL,
  getFirstNationsSQL,
  getFundingSourceSQL,
  getInvestmentActionCategorySQL,
  getManagementActionTypeSQL,
  getIUCNConservationActionLevel1ClassificationSQL,
  getIUCNConservationActionLevel2SubclassificationSQL,
  getIUCNConservationActionLevel3SubclassificationSQL,
  getActivitySQL,
  getProjectTypeSQL
} from '../queries/code-queries';
import { getLogger } from '../utils/logger';
import { coordinator_agency, region, species } from '../constants/codes';

const defaultLog = getLogger('queries/code-queries');

export interface IAllCodeSets {
  management_action_type: object;
  climate_change_initiative: object;
  first_nations: object;
  funding_source: object;
  investment_action_category: object;
  activity: object;
  project_type: object;
  coordinator_agency: object;
  region: object;
  species: object;
  iucn_conservation_action_level_1_classification: object;
  iucn_conservation_action_level_2_subclassification: object;
  iucn_conservation_action_level_3_subclassification: object;
}

/**
 * Function that fetches all code sets.
 *
 * @param {PoolClient} connection
 * @returns {IAllCodeSets} an object containing all code sets
 */
export async function getAllCodeSets(connection: IDBConnection): Promise<IAllCodeSets | null> {
  defaultLog.debug({ message: 'getAllCodeSets' });

  if (!connection) {
    return null;
  }

  await connection.open();

  const [
    management_action_type,
    climate_change_initiative,
    first_nations,
    funding_source,
    investment_action_category,
    activity,
    iucn_conservation_action_level_1_classification,
    iucn_conservation_action_level_2_subclassification,
    iucn_conservation_action_level_3_subclassification,
    project_type
  ] = await Promise.all([
    await connection.query(getManagementActionTypeSQL().text),
    await connection.query(getClimateChangeInitiativeSQL().text),
    await connection.query(getFirstNationsSQL().text),
    await connection.query(getFundingSourceSQL().text),
    await connection.query(getInvestmentActionCategorySQL().text),
    await connection.query(getActivitySQL().text),
    await connection.query(getIUCNConservationActionLevel1ClassificationSQL().text),
    await connection.query(getIUCNConservationActionLevel2SubclassificationSQL().text),
    await connection.query(getIUCNConservationActionLevel3SubclassificationSQL().text),
    await connection.query(getProjectTypeSQL().text)
  ]);

  await connection.commit();

  connection.release();

  return {
    management_action_type: (management_action_type && management_action_type.rows) || [],
    climate_change_initiative: (climate_change_initiative && climate_change_initiative.rows) || [],
    first_nations: (first_nations && first_nations.rows) || [],
    funding_source: (funding_source && funding_source.rows) || [],
    investment_action_category: (investment_action_category && investment_action_category.rows) || [],
    activity: (activity && activity.rows) || [],
    iucn_conservation_action_level_1_classification:
      (iucn_conservation_action_level_1_classification && iucn_conservation_action_level_1_classification.rows) || [],
    iucn_conservation_action_level_2_subclassification:
      (iucn_conservation_action_level_2_subclassification && iucn_conservation_action_level_2_subclassification.rows) ||
      [],
    iucn_conservation_action_level_3_subclassification:
      (iucn_conservation_action_level_3_subclassification && iucn_conservation_action_level_3_subclassification.rows) ||
      [],
    project_type: (project_type && project_type.rows) || [],
    // TODO Temporarily hard coded list of code values below
    coordinator_agency,
    region,
    species
  };
}
