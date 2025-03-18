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
            sql: this._getSql(),
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
            transformFunction: ExportSamplingStrategy.samplingCsvTransformation
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
  _getSql = () => {
    return SurveyRepository.getSamplePeriodsBySurveyId(this.config.surveyId);
  };

  /**
   * Transform sampling query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportSamplingStrategy
   */
  static readonly samplingCsvTransformation = (item: Record<string, any>): string => {
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
}
