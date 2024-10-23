import SQL from 'sql-template-strings';
import { z } from 'zod';
import { BaseRepository } from './base-repository';

export const ICode = z.object({
  id: z.number(),
  name: z.string()
});
export type ICode = z.infer<typeof ICode>;

export const CodeSet = <T extends z.ZodRawShape>(zodSchema?: T) => {
  if (zodSchema) {
    return z.array(z.object(zodSchema));
  }
  return z.array(ICode);
};

const InvestmentActionCategoryCode = ICode.extend({ agency_id: z.number() });
const ProprietorTypeCode = ICode.extend({ is_first_nation: z.boolean() });
const IucnConservationActionLevel2SubclassificationCode = ICode.extend({ iucn1_id: z.number() });
const IucnConservationActionLevel3SubclassificationCode = ICode.extend({ iucn2_id: z.number() });
const IntendedOutcomeCode = ICode.extend({ description: z.string() });
const SampleMethodsCode = ICode.extend({ description: z.string() });
const SurveyProgressCode = ICode.extend({ description: z.string() });
const MethodResponseMetricsCode = ICode.extend({ description: z.string() });
const AttractantCode = ICode.extend({ description: z.string() });
const ObservationSubcountSignCode = ICode.extend({ description: z.string() });
const AlertTypeCode = ICode.extend({ description: z.string() });

export const IAllCodeSets = z.object({
  management_action_type: CodeSet(),
  first_nations: CodeSet(),
  agency: CodeSet(),
  investment_action_category: CodeSet(InvestmentActionCategoryCode.shape),
  type: CodeSet(),
  proprietor_type: CodeSet(ProprietorTypeCode.shape),
  iucn_conservation_action_level_1_classification: CodeSet(),
  iucn_conservation_action_level_2_subclassification: CodeSet(IucnConservationActionLevel2SubclassificationCode.shape),
  iucn_conservation_action_level_3_subclassification: CodeSet(IucnConservationActionLevel3SubclassificationCode.shape),
  system_roles: CodeSet(),
  project_roles: CodeSet(),
  administrative_activity_status_type: CodeSet(),
  intended_outcomes: CodeSet(IntendedOutcomeCode.shape),
  survey_jobs: CodeSet(),
  site_selection_strategies: CodeSet(),
  sample_methods: CodeSet(SampleMethodsCode.shape),
  survey_progress: CodeSet(SurveyProgressCode.shape),
  method_response_metrics: CodeSet(MethodResponseMetricsCode.shape),
  attractants: CodeSet(AttractantCode.shape),
  observation_subcount_signs: CodeSet(ObservationSubcountSignCode.shape),
  alert_types: CodeSet(AlertTypeCode.shape)
});
export type IAllCodeSets = z.infer<typeof IAllCodeSets>;

export class CodeRepository extends BaseRepository {
  /**
   * Fetch sample method codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSampleMethods() {
    const sql = SQL`
      SELECT 
        method_lookup_id as id, 
        name, 
        description
      FROM method_lookup
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sql);

    return response.rows;
  }

  /**
   * Fetch management action type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getManagementActionType() {
    const sqlStatement = SQL`
      SELECT
        management_action_type_id as id,
        name
      FROM management_action_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch first nation codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getFirstNations() {
    const sqlStatement = SQL`
      SELECT
        first_nations_id as id,
        name
      FROM first_nations
      WHERE record_end_date is null 
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch agency codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAgency() {
    const sqlStatement = SQL`
      SELECT
        agency_id as id,
        name
      FROM agency
      WHERE record_end_date is null 
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch proprietor type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getProprietorType() {
    const sqlStatement = SQL`
      SELECT
        proprietor_type_id as id,
        name, 
        is_first_nation
      FROM proprietor_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ProprietorTypeCode);

    return response.rows;
  }

  /**
   * Fetch activity codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getType() {
    const sqlStatement = SQL`
      SELECT
        type_id as id,
        name
      FROM
        type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch intended outcomes codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getIntendedOutcomes() {
    const sqlStatement = SQL`
      SELECT
        intended_outcome_id as id,
        name, 
        description
      FROM intended_outcome
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, IntendedOutcomeCode);

    return response.rows;
  }

  /**
   * Fetch investment action category codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getInvestmentActionCategory() {
    const sqlStatement = SQL`
      SELECT
        investment_action_category_id as id,
        agency_id,
        name
      FROM investment_action_category
      WHERE record_end_date is null 
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, InvestmentActionCategoryCode);

    return response.rows;
  }

  /**
   * Fetch IUCN conservation action level 1 classification codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel1Classification() {
    const sqlStatement = SQL`
      SELECT
        iucn_conservation_action_level_1_classification_id as id,
        name
      FROM iucn_conservation_action_level_1_classification
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch IUCN conservation action level 2 sub-classification codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel2Subclassification() {
    const sqlStatement = SQL`
      SELECT
        iucn_conservation_action_level_2_subclassification_id as id,
        iucn_conservation_action_level_1_classification_id as iucn1_id,
        name
      FROM iucn_conservation_action_level_2_subclassification
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, IucnConservationActionLevel2SubclassificationCode);

    return response.rows;
  }

  /**
   * Fetch IUCN conservation action level 3 sub-classification codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel3Subclassification() {
    const sqlStatement = SQL`
      SELECT
        iucn_conservation_action_level_3_subclassification_id as id,
        iucn_conservation_action_level_2_subclassification_id as iucn2_id,
        name
      FROM iucn_conservation_action_level_3_subclassification
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, IucnConservationActionLevel3SubclassificationCode);

    return response.rows;
  }

  /**
   * Fetch system role codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSystemRoles() {
    const sqlStatement = SQL`
      SELECT
        system_role_id as id,
        name
      FROM system_role
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch project role codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getProjectRoles() {
    const sqlStatement = SQL`
      SELECT
        project_role_id as id,
        name
      FROM project_role
      WHERE record_end_date is null
      ORDER BY 
        CASE WHEN name = 'Coordinator' THEN 0 ELSE 1 END;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch survey job codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSurveyJobs() {
    const sqlStatement = SQL`
      SELECT
        survey_job_id as id,
        name
      FROM survey_job
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch site selection strategy codes
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSiteSelectionStrategies() {
    const sqlStatement = SQL`
      SELECT
        ss.site_strategy_id as id,
        ss.name
      FROM site_strategy ss
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch administrative activity status type codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAdministrativeActivityStatusType() {
    const sqlStatement = SQL`
      SELECT
        administrative_activity_status_type_id as id,
        name
      FROM administrative_activity_status_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch survey progress codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getSurveyProgress() {
    const sqlStatement = SQL`
      SELECT
        survey_progress_id as id,
        name,
        description
      FROM survey_progress
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyProgressCode);

    return response.rows;
  }

  /**
   * Fetch method response metrics codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getMethodResponseMetrics() {
    const sqlStatement = SQL`
      SELECT
        method_response_metric_id AS id,
        name,
        description
      FROM method_response_metric
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, MethodResponseMetricsCode);

    return response.rows;
  }

  /**
   * Fetch attractants codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAttractants() {
    const sqlStatement = SQL`
      SELECT
        attractant_lookup_id AS id,
        name,
        description
      FROM attractant_lookup
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, AttractantCode);

    return response.rows;
  }

  /**
   * Fetch observation subcount sign codes.
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getObservationSubcountSigns() {
    const sqlStatement = SQL`
      SELECT
        observation_subcount_sign_id AS id,
        name,
        description
      FROM observation_subcount_sign
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, ObservationSubcountSignCode);

    return response.rows;
  }

  /**
   * Fetch alert type codes
   *
   * @return {*}
   * @memberof CodeRepository
   */
  async getAlertTypes() {
    const sqlStatement = SQL`
      SELECT
        alert_type_id AS id,
        name,
        description
      FROM alert_type
      WHERE record_end_date IS null
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, AlertTypeCode);

    return response.rows;
  }
}
