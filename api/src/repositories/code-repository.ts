import SQL from 'sql-template-strings';
import { z } from 'zod';
import { BaseRepository } from './base-repository';

export const ICodeWithDescription = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string()
});

export type ICodeWithDescription = z.infer<typeof ICodeWithDescription>;

export const ICode = ICodeWithDescription.pick({
  id: true,
  name: true
});

export type ICode = z.infer<typeof ICode>;

export const CodeSet = <T extends z.ZodRawShape>(zodSchema?: T) => {
  return (zodSchema && z.array(ICode.extend(zodSchema))) || z.array(ICode);
};

export const IAllCodeSets = z.object({
  management_action_type: CodeSet(),
  first_nations: CodeSet(),
  agency: CodeSet(),
  investment_action_category: CodeSet(z.object({ agency_id: z.number() }).shape),
  type: CodeSet(),
  program: CodeSet(),
  proprietor_type: CodeSet(z.object({ id: z.number(), name: z.string(), is_first_nation: z.boolean() }).shape),
  iucn_conservation_action_level_1_classification: CodeSet(),
  iucn_conservation_action_level_2_subclassification: CodeSet(
    z.object({ id: z.number(), iucn1_id: z.number(), name: z.string() }).shape
  ),
  iucn_conservation_action_level_3_subclassification: CodeSet(
    z.object({ id: z.number(), iucn2_id: z.number(), name: z.string() }).shape
  ),
  system_roles: CodeSet(),
  project_roles: CodeSet(),
  administrative_activity_status_type: CodeSet(),
  intended_outcomes: CodeSet(z.object({ id: z.number(), name: z.string(), description: z.string() }).shape),
  vantage_codes: CodeSet(),
  survey_jobs: CodeSet(),
  site_selection_strategies: CodeSet(),
  survey_progress: CodeSet(z.object({ id: z.number(), name: z.string(), description: z.string() }).shape),
  sample_methods: CodeSet(z.object({ id: z.number(), name: z.string(), description: z.string() }).shape),
  method_response_metrics: CodeSet(z.object({ id: z.number(), name: z.string(), description: z.string() }).shape)
});

export type IAllCodeSets = z.infer<typeof IAllCodeSets>;

export class CodeRepository extends BaseRepository {
  async getSampleMethods() {
    const sql = SQL`
    SELECT method_lookup_id as id, name, description FROM method_lookup;
    `;
    const response = await this.connection.sql(sql);
    return response.rows;
  }

  /**
   * Fetch management action type codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getManagementActionType() {
    const sqlStatement = SQL`
      SELECT
        management_action_type_id as id,
        name
      FROM
        management_action_type
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch first nation codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getFirstNations() {
    const sqlStatement = SQL`
      SELECT
        first_nations_id as id,
        name
      FROM
        first_nations
      WHERE
        record_end_date is null ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch agency codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getAgency() {
    const sqlStatement = SQL`
      SELECT
        agency_id as id,
        name
      FROM
        agency
      WHERE
        record_end_date is null ORDER BY name ASC;
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
      FROM
        proprietor_type
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch activity codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getType() {
    const sqlStatement = SQL`
      SELECT
        type_id as id,
        name
      FROM
        type
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch vantage codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getVantageCodes() {
    const sqlStatement = SQL`
      SELECT
        vantage_id as id,
        name
      FROM
        vantage
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch intended outcomes codes.
   * @return {ICodeWithDescription}
   *
   */
  async getIntendedOutcomes() {
    const sqlStatement = SQL`
      SELECT
        intended_outcome_id as id,
        name, 
        description
      FROM
        intended_outcome
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICodeWithDescription);

    return response.rows;
  }

  /**
   * Fetch project type codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getProgram() {
    const sqlStatement = SQL`
      SELECT
        program_id as id,
        name
      FROM
        program
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

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
      FROM
        investment_action_category
      WHERE record_end_date is null ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch IUCN conservation action level 1 classification codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel1Classification() {
    const sqlStatement = SQL`
      SELECT
        iucn_conservation_action_level_1_classification_id as id,
        name
      FROM
        iucn_conservation_action_level_1_classification
      WHERE
        record_end_date is null;
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
      FROM
        iucn_conservation_action_level_2_subclassification
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

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
      FROM
        iucn_conservation_action_level_3_subclassification
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch system role codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getSystemRoles() {
    const sqlStatement = SQL`
      SELECT
        system_role_id as id,
        name
      FROM
        system_role
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch project role codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getProjectRoles() {
    const sqlStatement = SQL`
      SELECT
        project_role_id as id,
        name
      FROM
        project_role
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch survey job codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getSurveyJobs() {
    const sqlStatement = SQL`
      SELECT
        survey_job_id as id,
        name
      FROM
        survey_job
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch site selection strategy codes
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getSiteSelectionStrategies() {
    const sqlStatement = SQL`
      SELECT
        ss.site_strategy_id as id,
        ss.name
      FROM
        site_strategy ss
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch administrative activity status type codes.
   *
   * @return {ICode}
   * @memberof CodeRepository
   */
  async getAdministrativeActivityStatusType() {
    const sqlStatement = SQL`
      SELECT
        administrative_activity_status_type_id as id,
        name
      FROM
        administrative_activity_status_type
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICode);

    return response.rows;
  }

  /**
   * Fetch survey progress codes.
   *
   * @return {ICodeWithDescription}
   * @memberof CodeRepository
   */
  async getSurveyProgress() {
    const sqlStatement = SQL`
      SELECT
        survey_progress_id as id,
        name,
        description
      FROM
        survey_progress
      WHERE
        record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, ICodeWithDescription);

    return response.rows;
  }

  /**
   * Fetch method response metrics
   *
   * @return {Promise<ICodeWithDescription[]>}
   * @memberof CodeRepository
   */
  async getMethodResponseMetrics(): Promise<ICodeWithDescription[]> {
    const sqlStatement = SQL`
      SELECT
        method_response_metric_id AS id,
        name,
        description
      FROM
        method_response_metric
      WHERE
        record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, ICodeWithDescription);

    return response.rows;
  }
}
