import { IDBConnection } from '../../../database/db';
import { SurveyRepository } from '../../../repositories/survey-repository';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';

const defaultLog = getLogger('services/export-sampling-strategy');

export type ExportSamplingConfig = {
  surveyId: number;
  isUserAdmin: boolean;
};

/**
 * Provides functionality for exporting sampling data.
 *
 * @export
 * @class ExportSamplingStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
 */
export class ExportSamplingStrategy extends DBService implements ExportStrategy {
  config: ExportSamplingConfig;

  constructor(config: ExportSamplingConfig, connection: IDBConnection) {
    super(connection);

    this.config = config;
  }

  /**
   * Get the export strategy configuration for the samplings.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportSamplingStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      return {
        queries: [
          {
            sql: this._getPeriodsSql(),
            fileName: 'periods.csv',
            csvHeader: [
              'Period ID',
              'Technique ID',
              'Site ID',
              'Start date',
              'End date',
              'Start time',
              'End time'
            ].join(','),
            transformFunction: ExportSamplingStrategy.samplingPeriodsCsvTransformation
          },
          {
            sql: this._getSitesSql(),
            fileName: 'sites.csv',
            csvHeader: ['Site ID', 'Name', 'Description', 'Geometry'].join(','),
            transformFunction: ExportSamplingStrategy.samplingSitesCsvTransformation
          },
          {
            sql: this._getTechniquesSql(),
            fileName: 'techniques.csv',
            csvHeader: ['Technique ID', 'Name', 'Description', 'Method name', 'Attractants'].join(','),
            transformFunction: ExportSamplingStrategy.samplingTechniquesCsvTransformation
          }
        ]
      };
    } catch (error) {
      defaultLog.error({
        label: 'getExportStrategyConfig',
        message: 'Error generating export strategy config.',
        error
      });

      throw error;
    }
  }

  /**
   * Build and return the survey periods data sql query.
   *
   * @memberof ExportSamplingStrategy
   */
  _getPeriodsSql = () => {
    return SurveyRepository.getSamplePeriodsBySurveyId(this.config.surveyId);
  };

  /**
   * Build and return the survey sites data sql query.
   *
   * @memberof ExportSamplingStrategy
   */
  _getSitesSql = () => {
    return SurveyRepository.getSampleSitesBySurveyId(this.config.surveyId);
  };

  /**
   * Build and return the survey techniques data sql query.
   *
   * @memberof ExportSamplingStrategy
   */
  _getTechniquesSql = () => {
    return SurveyRepository.getSampleTechniquesBySurveyId(this.config.surveyId);
  };

  /**
   * Transform sampling sites query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportSamplingStrategy
   */
  static readonly samplingSitesCsvTransformation = (item: Record<string, any>): string => {
    return [
      item.survey_sample_site_id,
      `"${item.name ?? ''}"`,
      `"${item.description ?? ''}"`,
      `"${item.geometry_wkt ?? ''}"`
    ].join(',');
  };

  /**
   * Transform sampling periods query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportSamplingStrategy
   */
  static readonly samplingPeriodsCsvTransformation = (item: Record<string, any>): string => {
    return [
      item.survey_sample_period_id,
      `"${item.method_technique_id ?? ''}"`,
      `"${item.survey_sample_site_id ?? ''}"`,
      `"${item.start_date ?? ''}"`,
      `"${item.end_date ?? ''}"`,
      `"${item.start_time ?? ''}"`,
      `"${item.end_time ?? ''}"`
    ].join(',');
  };

  /**
   * Transform sampling technique query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportSamplingStrategy
   */
  static readonly samplingTechniquesCsvTransformation = (item: Record<string, any>): string => {
    // extract attrinbute qualitative and quantitative values
    const attributeValues: string[] = item.attrib_data.map((attribItem: { av: string }) => attribItem.av);
    // extract vantage values
    const vantageValues: string[] = item.vantage_data.map((vantageItem: { vv: string }) => vantageItem.vv);
    return [
      item.method_technique_id,
      `"${item.method_name ?? ''}"`,
      `"${item.description ?? ''}"`,
      `"${item.method_lookup_name ?? ''}"`,
      `"${item.attractants ?? ''}"`,
      ...attributeValues,
      ...vantageValues
    ].join(',');
  };
}
