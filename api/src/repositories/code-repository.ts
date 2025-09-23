import SQL from 'sql-template-strings';
import { z } from 'zod';
import { BaseRepository } from './base-repository';

// Code types
export type ICode = z.infer<typeof Code>;
export type ICodeDescription = z.infer<typeof CodeDescription>;
export type IAllCodeSets = z.infer<typeof IAllCodeSets>;

// Code without description
export const Code = z.object({ id: z.number(), name: z.string() });

// Code with description
export const CodeDescription = Code.extend({ description: z.string() });

// Codes which need to include additional properties
const InvestmentActionCategoryCode = Code.extend({ agency_id: z.number() });
const ProprietorTypeCode = Code.extend({ is_first_nation: z.boolean() });
const IucnConservationActionLevel2SubclassificationCode = Code.extend({ iucn1_id: z.number() });
const IucnConservationActionLevel3SubclassificationCode = Code.extend({ iucn2_id: z.number() });

// All code sets
export const IAllCodeSets = z.object({
  management_action_type: Code.array(),
  first_nations: Code.array(),
  agency: Code.array(),
  investment_action_category: InvestmentActionCategoryCode.array(),
  survey_data_type: CodeDescription.array(),
  proprietor_type: ProprietorTypeCode.array(),
  iucn_conservation_action_level_1_classification: Code.array(),
  iucn_conservation_action_level_2_subclassification: IucnConservationActionLevel2SubclassificationCode.array(),
  iucn_conservation_action_level_3_subclassification: IucnConservationActionLevel3SubclassificationCode.array(),
  system_roles: Code.array(),
  survey_roles: CodeDescription.array(),
  administrative_activity_status_type: Code.array(),
  intended_outcomes: CodeDescription.array(),
  survey_jobs: CodeDescription.array(),
  site_selection_strategies: Code.array(),
  sample_methods: CodeDescription.array(),
  survey_progress: CodeDescription.array(),
  method_response_metrics: CodeDescription.array(),
  attractants: CodeDescription.array(),
  observation_signs: CodeDescription.array(),
  telemetry_device_makes: CodeDescription.array(),
  frequency_units: CodeDescription.array(),
  alert_types: CodeDescription.array(),
  vantages: CodeDescription.array(),
  habitat_feature_types: CodeDescription.array(),
  collection_roles: Code.array()
});

export class CodeRepository extends BaseRepository {
  /**
   * Fetch sample method codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getSampleMethods(): Promise<ICodeDescription[]> {
    const sql = SQL`
      SELECT
        method_lookup_id as id,
        name,
        description
      FROM method_lookup
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sql, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch management action type codes.
   *
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getManagementActionType(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        management_action_type_id as id,
        name
      FROM management_action_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch first nation codes.
   *
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getFirstNations(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        first_nations_id as id,
        name
      FROM first_nations
      WHERE record_end_date is null
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch agency codes.
   *
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getAgency(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        agency_id as id,
        name
      FROM agency
      WHERE record_end_date is null
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch proprietor type codes.
   *
   * @return {*} {Promise<z.infer<typeof ProprietorTypeCode>[]>}
   * @memberof CodeRepository
   */
  async getProprietorType(): Promise<z.infer<typeof ProprietorTypeCode>[]> {
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
   * Fetch survey data type.
   *
   * TODO: Rename this table to something more specific ie: not 'type'
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getSurveyDataType(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        type_id as id,
        name,
        description
      FROM
        type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch intended outcomes codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getIntendedOutcomes(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        intended_outcome_id as id,
        name,
        description
      FROM intended_outcome
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch investment action category codes.
   *
   * @return {*} {Promise<z.infer<typeof InvestmentActionCategoryCode>[]>}
   * @memberof CodeRepository
   */
  async getInvestmentActionCategory(): Promise<z.infer<typeof InvestmentActionCategoryCode>[]> {
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
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel1Classification(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        iucn_conservation_action_level_1_classification_id as id,
        name
      FROM iucn_conservation_action_level_1_classification
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch IUCN conservation action level 2 sub-classification codes.
   *
   * @return {*} {Promise<z.infer<typeof IucnConservationActionLevel2SubclassificationCode>[]}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel2Subclassification(): Promise<
    z.infer<typeof IucnConservationActionLevel2SubclassificationCode>[]
  > {
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
   * @return {*} {Promise<z.infer<typeof IucnConservationActionLevel3SubclassificationCode>[]}
   * @memberof CodeRepository
   */
  async getIUCNConservationActionLevel3Subclassification(): Promise<
    z.infer<typeof IucnConservationActionLevel3SubclassificationCode>[]
  > {
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
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getSystemRoles(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        system_role_id as id,
        name
      FROM system_role
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch survey role codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getProjectRoles(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        survey_role_id as id,
        name,
        description
      FROM survey_role
      WHERE record_end_date is null
      ORDER BY
        CASE WHEN name = 'Admin' THEN 0 ELSE 1 END;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch collection role codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getCollectionRoles(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        collection_role_id as id,
        name,
        description
      FROM collection_role
      WHERE record_end_date is null
      ORDER BY
        CASE WHEN name = 'Admin' THEN 0 ELSE 1 END;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch survey job codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getSurveyJobs(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        survey_job_id as id,
        name,
        description
      FROM survey_job
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch site selection strategy codes
   *
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getSiteSelectionStrategies(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        ss.site_strategy_id as id,
        ss.name,
        ss.description
      FROM site_strategy ss
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch administrative activity status type codes.
   *
   * @return {*} {Promise<ICode[]>}
   * @memberof CodeRepository
   */
  async getAdministrativeActivityStatusType(): Promise<ICode[]> {
    const sqlStatement = SQL`
      SELECT
        administrative_activity_status_type_id as id,
        name
      FROM administrative_activity_status_type
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, Code);

    return response.rows;
  }

  /**
   * Fetch survey progress codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getSurveyProgress(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        survey_progress_id as id,
        name,
        description
      FROM survey_progress
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch method response metrics codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getMethodResponseMetrics(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        method_response_metric_id AS id,
        name,
        description
      FROM method_response_metric
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch attractants codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getAttractants(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        attractant_lookup_id AS id,
        name,
        description
      FROM attractant_lookup
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch observation sign codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getObservationSigns(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        observation_sign_id AS id,
        name,
        description
      FROM observation_sign
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Get active telemetry device makes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getActiveTelemetryDeviceMakes(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        device_make_id as id,
        name,
        description
      FROM device_make
      WHERE record_end_date is null
      -- Some legacy device makes have no effective date, as they are no longer supported, and must be excluded
      AND record_effective_date IS NOT NULL;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Get frequency unit codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getFrequencyUnits(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        frequency_unit_id as id,
        name,
        description
      FROM frequency_unit
      WHERE record_end_date is null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch alert type codes
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getAlertTypes(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        alert_type_id AS id,
        name,
        description
      FROM alert_type
      WHERE record_end_date IS null
      ORDER BY name ASC;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch vantages associated with vantages
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getVantages(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        vantage_category_id AS id,
        name,
        description
      FROM vantage
      WHERE record_end_date IS null;
    `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }

  /**
   * Fetch habitat feature type codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getHabitatFeatureTypes(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
          SELECT
            habitat_feature_type_id AS id,
            name,
            description
          FROM habitat_feature_type
          WHERE record_end_date IS null;
        `;

    const response = await this.connection.sql(sqlStatement, CodeDescription);

    return response.rows;
  }
}
