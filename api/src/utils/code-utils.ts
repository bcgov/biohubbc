import { IDBConnection } from '../database/db';
import {
  getFirstNationsSQL,
  getFundingSourceSQL,
  getInvestmentActionCategorySQL,
  getManagementActionTypeSQL,
  getIUCNConservationActionLevel1ClassificationSQL,
  getIUCNConservationActionLevel2SubclassificationSQL,
  getIUCNConservationActionLevel3SubclassificationSQL,
  getActivitySQL,
  getProjectTypeSQL,
  getSystemRolesSQL,
  getProprietorTypeSQL,
  getAdministrativeActivityStatusTypeSQL,
  getTaxonsSQL,
  getCommonSurveyMethodologiesSQL
} from '../queries/codes/code-queries';
import { getLogger } from '../utils/logger';
import { coordinator_agency, region, regional_offices } from '../constants/codes';

const defaultLog = getLogger('queries/code-queries');

export interface IAllCodeSets {
  management_action_type: object;
  first_nations: object;
  funding_source: object;
  investment_action_category: object;
  activity: object;
  project_type: object;
  coordinator_agency: object;
  region: object;
  species: object;
  proprietor_type: object;
  iucn_conservation_action_level_1_classification: object;
  iucn_conservation_action_level_2_subclassification: object;
  iucn_conservation_action_level_3_subclassification: object;
  system_roles: object;
  regional_offices: object;
  administrative_activity_status_type: object;
  common_survey_methodologies: object;
}

/**
 * Function that fetches all code sets.
 *
 * @param {PoolClient} connection
 * @returns {IAllCodeSets} an object containing all code sets
 */
export async function getAllCodeSets(connection: IDBConnection): Promise<IAllCodeSets | null> {
  defaultLog.debug({ message: 'getAllCodeSets' });

  await connection.open();

  const [
    management_action_type,
    first_nations,
    funding_source,
    investment_action_category,
    activity,
    iucn_conservation_action_level_1_classification,
    iucn_conservation_action_level_2_subclassification,
    iucn_conservation_action_level_3_subclassification,
    proprietor_type,
    project_type,
    system_roles,
    administrative_activity_status_type,
    species,
    common_survey_methodologies
  ] = await Promise.all([
    await connection.query(getManagementActionTypeSQL().text),
    await connection.query(getFirstNationsSQL().text),
    await connection.query(getFundingSourceSQL().text),
    await connection.query(getInvestmentActionCategorySQL().text),
    await connection.query(getActivitySQL().text),
    await connection.query(getIUCNConservationActionLevel1ClassificationSQL().text),
    await connection.query(getIUCNConservationActionLevel2SubclassificationSQL().text),
    await connection.query(getIUCNConservationActionLevel3SubclassificationSQL().text),
    await connection.query(getProprietorTypeSQL().text),
    await connection.query(getProjectTypeSQL().text),
    await connection.query(getSystemRolesSQL().text),
    await connection.query(getAdministrativeActivityStatusTypeSQL().text),
    await connection.query(getTaxonsSQL().text),
    await connection.query(getCommonSurveyMethodologiesSQL().text)
  ]);

  await connection.commit();

  connection.release();

  return {
    management_action_type: (management_action_type && management_action_type.rows) || [],
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
    proprietor_type: (proprietor_type && proprietor_type.rows) || [],
    project_type: (project_type && project_type.rows) || [],
    system_roles: (system_roles && system_roles.rows) || [],
    administrative_activity_status_type:
      (administrative_activity_status_type && administrative_activity_status_type.rows) || [],
    species: (species && species.rows) || [],
    common_survey_methodologies: (common_survey_methodologies && common_survey_methodologies.rows) || [],
    // TODO Temporarily hard coded list of code values below
    coordinator_agency,
    region,
    regional_offices
  };
}
