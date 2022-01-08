import { coordinator_agency, region } from '../constants/codes';
import { IDBConnection } from '../database/db';
import { queries } from '../queries/queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/code-queries');

/**
 * A single code value.
 *
 * @export
 * @interface ICode
 */
export interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 */
export type CodeSet<T extends ICode = ICode> = T[];

export interface IAllCodeSets {
  management_action_type: CodeSet;
  first_nations: CodeSet;
  funding_source: CodeSet;
  investment_action_category: CodeSet<{ id: number; fs_id: number; name: string }>;
  activity: CodeSet;
  project_type: CodeSet;
  coordinator_agency: CodeSet;
  region: CodeSet;
  species: CodeSet;
  proprietor_type: CodeSet<{ id: number; name: string; is_first_nation: boolean }>;
  iucn_conservation_action_level_1_classification: CodeSet;
  iucn_conservation_action_level_2_subclassification: CodeSet<{ id: number; iucn1_id: number; name: string }>;
  iucn_conservation_action_level_3_subclassification: CodeSet<{ id: number; iucn2_id: number; name: string }>;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
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
    project_roles,
    administrative_activity_status_type,
    species
  ] = await Promise.all([
    await connection.query(queries.codes.getManagementActionTypeSQL().text),
    await connection.query(queries.codes.getFirstNationsSQL().text),
    await connection.query(queries.codes.getFundingSourceSQL().text),
    await connection.query(queries.codes.getInvestmentActionCategorySQL().text),
    await connection.query(queries.codes.getActivitySQL().text),
    await connection.query(queries.codes.getIUCNConservationActionLevel1ClassificationSQL().text),
    await connection.query(queries.codes.getIUCNConservationActionLevel2SubclassificationSQL().text),
    await connection.query(queries.codes.getIUCNConservationActionLevel3SubclassificationSQL().text),
    await connection.query(queries.codes.getProprietorTypeSQL().text),
    await connection.query(queries.codes.getProjectTypeSQL().text),
    await connection.query(queries.codes.getSystemRolesSQL().text),
    await connection.query(queries.codes.getProjectRolesSQL().text),
    await connection.query(queries.codes.getAdministrativeActivityStatusTypeSQL().text),
    await connection.query(queries.codes.getTaxonsSQL().text)
  ]);

  await connection.commit();

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
    project_roles: (project_roles && project_roles.rows) || [],
    administrative_activity_status_type:
      (administrative_activity_status_type && administrative_activity_status_type.rows) || [],
    species: (species && species.rows) || [],
    // TODO Temporarily hard coded list of code values below
    coordinator_agency,
    region
  };
}
