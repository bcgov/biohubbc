import SQL from 'sql-template-strings';
import { IDBConnection } from '../../database/db';
import { generateS3SurveyExportKey, getS3SignedURLs } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { DBService } from '../db-service';
import { ObservationService } from '../observation-service';
import { SampleLocationService } from '../sample-location-service';
import { SurveyCritterService } from '../survey-critter-service';
import { SurveyService } from '../survey-service';
import { TelemetryService } from '../telemetry-service';
import { ExportService } from './export-service';

const defaultLog = getLogger('api/src/services/export-service.ts');

export type ExportSurveyConfig = {
  metadata: boolean;
  sampling_data: boolean;
  observation_data: boolean;
  telemetry_data: boolean;
  animal_data: boolean;
  artifacts: boolean;
};

type ExportDataBundle = {
  fileName: string;
  data: any;
};

/**
 * Provides functionality for exporting survey data.
 *
 * @export
 * @class ExportService
 * @extends {DBService}
 */
export class ExportSurveyService extends DBService {
  exportService: ExportService;

  surveyService: SurveyService;
  sampleLocationService: SampleLocationService;
  observationService: ObservationService;
  telemetryService: TelemetryService;
  surveyCritterService: SurveyCritterService;
  //   critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.exportService = new ExportService(connection);

    this.surveyService = new SurveyService(connection);
    this.sampleLocationService = new SampleLocationService(connection);
    this.observationService = new ObservationService(connection);
    this.telemetryService = new TelemetryService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    // this.critterbaseService = new CritterbaseService({});
  }

  async exportSurvey(surveyId: number, _config: ExportSurveyConfig): Promise<string[]> {
    try {
      const sqlStatement = SQL`
        SELECT region_lookup.* FROM region_lookup CROSS JOIN generate_series(1, 2) AS series;
      `;

      const s3Key = generateS3SurveyExportKey({
        surveyId,
        fileName: `sims_survey_${surveyId}_export_${new Date().toISOString()}`,
        extension: 'json'
      });

      const result = await this.exportService.exportSQLResultsToS3({
        connection: this.connection,
        queries: [
          {
            sql: sqlStatement,
            fileName: 'region_lookup.json'
          }
        ],
        s3Key
      });

      console.log(result);

      return this._getAllSignedURLs([s3Key]);
    } catch (error) {
      console.error('Error exporting survey stream.', error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for each s3Key.
   *
   * @param {string[]} s3Keys
   * @return {*}  {Promise<string[]>}
   * @memberof ExportService
   */
  async _getAllSignedURLs(s3Keys: string[]): Promise<string[]> {
    defaultLog.debug({ label: '_getAllSignedURLs', message: 'Generating signed URLs for export file(s).' });

    const signedURLs = await getS3SignedURLs(s3Keys);

    if (signedURLs.some((item) => item === null)) {
      throw new Error('Failed to generate signed URLs for all export files.');
    }

    return signedURLs as string[];
  }

  /**
   * Fetch all data required for the export, based on the provided export configuration.
   *
   * @param {number} surveyId
   * @param {ExportSurveyConfig} config
   * @return {*}  {Promise<ExportDataBundle[]>}
   * @memberof ExportService
   */
  async _getAllDataForExport(surveyId: number, config: ExportSurveyConfig): Promise<ExportDataBundle[]> {
    defaultLog.debug({ label: '_getAllDataForExport', message: 'Getting data for export.' });

    const dataForExport: Promise<ExportDataBundle | ExportDataBundle[]>[] = [];

    if (config.metadata) {
      dataForExport.push(this._getSurveyData(surveyId));
    }

    if (config.sampling_data) {
      dataForExport.push(this._getSampleLocationsForSurveyId(surveyId));
    }

    if (config.observation_data) {
      dataForExport.push(this._getObservationDataForSurveyId(surveyId));
    }

    // if (config.telemetry_data) {
    //   dataForExport.push(this._getTelemetryDataForSurveyId(surveyId));
    // }

    if (config.animal_data) {
      dataForExport.push(this._getAnimalDataForSurveyId(surveyId));
    }

    if (config.artifacts) {
      dataForExport.push(this._getAttachmentsForSurveyId(surveyId));
    }

    if (config.artifacts) {
      dataForExport.push(this._getReportAttachmentsForSurveyId(surveyId));
    }

    return (await Promise.all(dataForExport)).flatMap((item) => (Array.isArray(item) ? item : [item]));
  }

  /**
   * Get survey metadata for a survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getSurveyData(surveyId: number): Promise<ExportDataBundle> {
    const sql = SQL``;

    return { fileName: 'survey_metadata', sql };
  }

  /**
   * Get sample locations for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getSampleLocationsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const sql = SQL``;

    return { fileName: 'sample_locations', sql };
  }

  /**
   * Get observation data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getObservationDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const sql = SQL``;

    return { fileName: 'observations', sql };
  }

  //   async _getTelemetryDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
  //     return this.telemetryService.getAllSurveyObservations(surveyId);
  //   }

  /**
   * Get animal data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getAnimalDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = this.surveyCritterService.getCrittersInSurvey(surveyId);

    return { fileName: 'animals', data };
  }

  /**
   * Get attachments data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getAttachmentsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const sql = SQL``;

    return { fileName: 'attachments', sql };
  }

  /**
   * Get report attachments data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getReportAttachmentsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const sql = SQL``;

    return { fileName: 'reports', sql };
  }
}
