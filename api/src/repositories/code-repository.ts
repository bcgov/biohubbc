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

// Flexible code with description that accepts both number and string IDs (for codetables with UUIDs)
export const FlexibleCodeDescription = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.string().nullable()
});

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
  project_roles: CodeDescription.array(),
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
  habitat_feature_types: CodeDescription.array()
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
   * Fetch project role codes.
   *
   * @return {*} {Promise<ICodeDescription[]>}
   * @memberof CodeRepository
   */
  async getProjectRoles(): Promise<ICodeDescription[]> {
    const sqlStatement = SQL`
      SELECT
        project_role_id as id,
        name,
        description
      FROM project_role
      WHERE record_end_date is null
      ORDER BY
        CASE WHEN name = 'Coordinator' THEN 0 ELSE 1 END;
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

  /**
   * Fetch all codeset categories with their codes for BioHub submission export.
   * Returns all 35 codetables with id, name, and description.
   * Note: IDs can be either numbers or strings (UUIDs) depending on the table.
   *
   * @return {*} {Promise<Array<{ name: string; description: string | null; codes: Array<{ id: number | string; name: string; description: string | null }> }>>}
   * @memberof CodeRepository
   */
  async getAllCodesetCategories(): Promise<
    Array<{
      name: string;
      description: string | null;
      codes: Array<{ id: number | string; name: string; description: string | null }>;
    }>
  > {
    // Define all codetable queries with their category names and descriptions
    const codetableQueries = [
      {
        name: 'agency',
        description: 'Government and non-government agencies',
        sql: SQL`SELECT agency_id AS id, name, description FROM agency WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'attractant_lookup',
        description: 'Attractants used in sampling techniques',
        sql: SQL`SELECT attractant_lookup_id AS id, name, description FROM attractant_lookup WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'device_make',
        description: 'Telemetry device manufacturers',
        sql: SQL`SELECT device_make_id AS id, name, description FROM device_make WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'ecological_season',
        description: 'Ecological seasons',
        sql: SQL`SELECT ecological_season_id AS id, name, description FROM ecological_season WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'environment_qualitative',
        description: 'Qualitative environmental variables',
        sql: SQL`SELECT environment_qualitative_id AS id, name, description FROM environment_qualitative WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'environment_qualitative_option',
        description: 'Options for qualitative environmental variables',
        sql: SQL`SELECT environment_qualitative_option_id AS id, name, description FROM environment_qualitative_option WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'environment_quantitative',
        description: 'Quantitative environmental variables',
        sql: SQL`SELECT environment_quantitative_id AS id, name, description FROM environment_quantitative WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'field_method',
        description: 'Field methods used in surveys',
        sql: SQL`SELECT field_method_id AS id, name, description FROM field_method WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'first_nations',
        description: 'First Nations communities',
        sql: SQL`SELECT first_nations_id AS id, name, description FROM first_nations WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'frequency_unit',
        description: 'Frequency units for telemetry devices',
        sql: SQL`SELECT frequency_unit_id AS id, name, description FROM frequency_unit WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'funding_source',
        description: 'Funding sources for projects',
        sql: SQL`SELECT funding_source_id AS id, name, description FROM funding_source WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'habitat_feature_qualitative_definition',
        description: 'Qualitative habitat feature definitions',
        sql: SQL`SELECT habitat_feature_qualitative_definition_id AS id, name, description FROM habitat_feature_qualitative_definition WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'habitat_feature_qualitative_definition_option',
        description: 'Options for qualitative habitat feature definitions',
        sql: SQL`SELECT habitat_feature_qualitative_definition_option_id AS id, name, description FROM habitat_feature_qualitative_definition_option WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'habitat_feature_quantitative_definition',
        description: 'Quantitative habitat feature definitions',
        sql: SQL`SELECT habitat_feature_quantitative_definition_id AS id, name, description FROM habitat_feature_quantitative_definition WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'habitat_feature_type',
        description: 'Types of habitat features',
        sql: SQL`SELECT habitat_feature_type_id AS id, name, description FROM habitat_feature_type WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'intended_outcome',
        description: 'Intended outcomes for surveys',
        sql: SQL`SELECT intended_outcome_id AS id, name, description FROM intended_outcome WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'investment_action_category',
        description: 'Investment action categories',
        sql: SQL`SELECT investment_action_category_id AS id, name, description FROM investment_action_category WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'iucn_conservation_action_level_1_classification',
        description: 'IUCN Conservation Action Level 1 classifications',
        sql: SQL`SELECT iucn_conservation_action_level_1_classification_id AS id, name, description FROM iucn_conservation_action_level_1_classification WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'iucn_conservation_action_level_2_subclassification',
        description: 'IUCN Conservation Action Level 2 subclassifications',
        sql: SQL`SELECT iucn_conservation_action_level_2_subclassification_id AS id, name, description FROM iucn_conservation_action_level_2_subclassification WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'iucn_conservation_action_level_3_subclassification',
        description: 'IUCN Conservation Action Level 3 subclassifications',
        sql: SQL`SELECT iucn_conservation_action_level_3_subclassification_id AS id, name, description FROM iucn_conservation_action_level_3_subclassification WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'management_action_type',
        description: 'Types of management actions',
        sql: SQL`SELECT management_action_type_id AS id, name, description FROM management_action_type WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'method_lookup',
        description: 'Survey methods and techniques',
        sql: SQL`SELECT method_lookup_id AS id, name, description FROM method_lookup ORDER BY name`
      },
      {
        name: 'method_response_metric',
        description: 'Response metrics for survey methods',
        sql: SQL`SELECT method_response_metric_id AS id, name, description FROM method_response_metric WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'observation_sign',
        description: 'Signs of species observation',
        sql: SQL`SELECT observation_sign_id AS id, name, description FROM observation_sign WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'proprietor_type',
        description: 'Types of proprietors',
        sql: SQL`SELECT proprietor_type_id AS id, name, description FROM proprietor_type WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'site_strategy',
        description: 'Site selection strategies',
        sql: SQL`SELECT site_strategy_id AS id, name, description FROM site_strategy WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'spatial_transform',
        description: 'Spatial transformation types',
        sql: SQL`SELECT spatial_transform_id AS id, name, description FROM spatial_transform WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'survey_job',
        description: 'Survey job types',
        sql: SQL`SELECT survey_job_id AS id, name, description FROM survey_job WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'survey_progress',
        description: 'Survey progress statuses',
        sql: SQL`SELECT survey_progress_id AS id, name, description FROM survey_progress WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'technique_attribute_qualitative',
        description: 'Qualitative technique attributes',
        sql: SQL`SELECT technique_attribute_qualitative_id AS id, name, description FROM technique_attribute_qualitative WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'technique_attribute_qualitative_option',
        description: 'Options for qualitative technique attributes',
        sql: SQL`SELECT technique_attribute_qualitative_option_id AS id, name, description FROM technique_attribute_qualitative_option WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'technique_attribute_quantitative',
        description: 'Quantitative technique attributes',
        sql: SQL`SELECT technique_attribute_quantitative_id AS id, name, description FROM technique_attribute_quantitative WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'type',
        description: 'Survey data types',
        sql: SQL`SELECT type_id AS id, name, description FROM type WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'vantage',
        description: 'Vantage points for observations',
        sql: SQL`SELECT vantage_id AS id, name, description FROM vantage WHERE record_end_date IS NULL ORDER BY name`
      },
      {
        name: 'vantage_category',
        description: 'Categories of vantage points',
        sql: SQL`SELECT vantage_category_id AS id, name, description FROM vantage_category WHERE record_end_date IS NULL ORDER BY name`
      }
    ];

    // Fetch all codetables in parallel
    const results = await Promise.all(
      codetableQueries.map(async (query) => {
        const response = await this.connection.sql(query.sql, FlexibleCodeDescription);
        return {
          name: query.name,
          description: query.description,
          codes: response.rows
        };
      })
    );

    return results;
  }
}
