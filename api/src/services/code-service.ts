import { coordinator_agency, region, regional_offices } from '../constants/codes';
import { queries } from '../queries/queries';
import { getLogger } from '../utils/logger';
import { DBService } from './service';

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
  regional_offices: CodeSet;
  administrative_activity_status_type: CodeSet;
  field_methods: CodeSet;
  ecological_seasons: CodeSet;
  intended_outcomes: CodeSet;
  vantage_codes: CodeSet;
}

export class CodeService extends DBService {
  /**
   * Function that fetches all code sets.
   *
   * @return {*}  {Promise<IAllCodeSets>} an object containing all code sets
   * @memberof CodeService
   */
  async getAllCodeSets(): Promise<IAllCodeSets> {
    defaultLog.debug({ message: 'getAllCodeSets' });

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
      species,
      field_methods,
      ecological_seasons,
      intended_outcomes,
      vantage_codes
    ] = await Promise.all([
      await this.connection.query(queries.codes.getManagementActionTypeSQL().text),
      await this.connection.query(queries.codes.getFirstNationsSQL().text),
      await this.connection.query(queries.codes.getFundingSourceSQL().text),
      await this.connection.query(queries.codes.getInvestmentActionCategorySQL().text),
      await this.connection.query(queries.codes.getActivitySQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel1ClassificationSQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel2SubclassificationSQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel3SubclassificationSQL().text),
      await this.connection.query(queries.codes.getProprietorTypeSQL().text),
      await this.connection.query(queries.codes.getProjectTypeSQL().text),
      await this.connection.query(queries.codes.getSystemRolesSQL().text),
      await this.connection.query(queries.codes.getProjectRolesSQL().text),
      await this.connection.query(queries.codes.getAdministrativeActivityStatusTypeSQL().text),
      await this.connection.query(queries.codes.getTaxonsSQL().text),
      await this.connection.query(queries.codes.getFieldMethodsSQL().text),
      await this.connection.query(queries.codes.getEcologicalSeasonsSQL().text),

      await this.connection.query(queries.codes.getIntendedOutcomesSQL().text),

      await this.connection.query(queries.codes.getVantageCodesSQL().text)
    ]);

    return {
      management_action_type: (management_action_type && management_action_type.rows) || [],
      first_nations: (first_nations && first_nations.rows) || [],
      funding_source: (funding_source && funding_source.rows) || [],
      investment_action_category: (investment_action_category && investment_action_category.rows) || [],
      activity: (activity && activity.rows) || [],
      iucn_conservation_action_level_1_classification:
        (iucn_conservation_action_level_1_classification && iucn_conservation_action_level_1_classification.rows) || [],
      iucn_conservation_action_level_2_subclassification:
        (iucn_conservation_action_level_2_subclassification &&
          iucn_conservation_action_level_2_subclassification.rows) ||
        [],
      iucn_conservation_action_level_3_subclassification:
        (iucn_conservation_action_level_3_subclassification &&
          iucn_conservation_action_level_3_subclassification.rows) ||
        [],
      proprietor_type: (proprietor_type && proprietor_type.rows) || [],
      project_type: (project_type && project_type.rows) || [],
      system_roles: (system_roles && system_roles.rows) || [],
      project_roles: (project_roles && project_roles.rows) || [],
      administrative_activity_status_type:
        (administrative_activity_status_type && administrative_activity_status_type.rows) || [],
      species: (species && species.rows) || [],
      field_methods: (field_methods && field_methods.rows) || [],
      ecological_seasons: (ecological_seasons && ecological_seasons.rows) || [],
      intended_outcomes: (intended_outcomes && intended_outcomes.rows) || [],
      vantage_codes: (vantage_codes && vantage_codes.rows) || [],

      // TODO Temporarily hard coded list of code values below
      coordinator_agency,
      region,
      regional_offices
    };
  }
}
