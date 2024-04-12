import { Metadata } from 'aws-sdk/clients/s3';
import { IDBConnection } from '../database/db';
import { getS3SignedURL, uploadBufferToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { ObservationService } from './observation-service';
import { SampleLocationService } from './sample-location-service';
import { SurveyCritterService } from './survey-critter-service';
import { SurveyService } from './survey-service';
import { TelemetryService } from './telemetry-service';

const defaultLog = getLogger('api/src/services/export-service.ts');

export type ExportConfig = {
  metadata: boolean;
  sampling_data: boolean;
  observation_data: boolean;
  telemetry_data: boolean;
  animal_data: boolean;
  artifacts: boolean;
};

type ExportDataBundle =
  | {
      fileName: string;
      data: any;
    }
  | {
      key: string;
    };

/**
 * Provides functionality for exporting survey data.
 *
 * @export
 * @class ExportService
 * @extends {DBService}
 */
export class ExportService extends DBService {
  surveyService: SurveyService;
  sampleLocationService: SampleLocationService;
  observationService: ObservationService;
  telemetryService: TelemetryService;
  surveyCritterService: SurveyCritterService;
  //   critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyService = new SurveyService(connection);
    this.sampleLocationService = new SampleLocationService(connection);
    this.observationService = new ObservationService(connection);
    this.telemetryService = new TelemetryService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    // this.critterbaseService = new CritterbaseService({});
  }

  async exportSurvey(surveyId: number, config: ExportConfig): Promise<string[]> {
    try {
      defaultLog.debug({ label: 'exportSurvey', message: 'Exporting survey data.' });

      const dataForExport = await this._getAllDataForExport(surveyId, config);

      const s3Keys: string[] = [];

      for (const data of dataForExport) {
        if ('data' in data) {
          const s3FileKey = this._getExportS3FileKey(surveyId, data.fileName);

          await this._uploadJsonToS3(data.data, s3FileKey, {
            survey_id: String(surveyId),
            created_at: new Date().toISOString()
          });

          s3Keys.push(s3FileKey);
        } else {
          s3Keys.push(data.key);
        }
      }

      return this._getAllSignedURLs(s3Keys);
    } catch (error) {
      defaultLog.error({ label: 'exportSurvey', message: 'Failed to export survey data.', error });
      throw error;
    }
  }

  async _getAllDataForExport(surveyId: number, config: ExportConfig): Promise<ExportDataBundle[]> {
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

  async _getSurveyData(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.surveyService.getSurveyById(surveyId);

    return { fileName: 'survey_metadata', data };
  }

  async _getSampleLocationsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.sampleLocationService.getSampleLocationsForSurveyId(surveyId);

    return { fileName: 'sample_locations', data };
  }

  async _getObservationDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.observationService.getAllSurveyObservations(surveyId);

    return { fileName: 'observations', data };
  }

  //   async _getTelemetryDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
  //     return this.telemetryService.getAllSurveyObservations(surveyId);
  //   }

  async _getAnimalDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = this.surveyCritterService.getCrittersInSurvey(surveyId);

    return { fileName: 'animals', data };
  }

  async _getAttachmentsForSurveyId(surveyId: number): Promise<ExportDataBundle[]> {
    const data = await this.surveyService.getAttachmentsData(surveyId);

    return data.attachmentDetails.map((item) => ({ key: item.key }));
  }

  async _getReportAttachmentsForSurveyId(surveyId: number): Promise<ExportDataBundle[]> {
    const data = await this.surveyService.getReportAttachmentsData(surveyId);

    return data.attachmentDetails.map((item) => ({ key: item.key }));
  }

  _getExportS3FileKey(surveyId: number, fileName: string) {
    defaultLog.debug({ label: '_getExportS3Key', message: 'Generating S3 key for export file.' });

    return `exports/${surveyId}_data_${new Date().toISOString()}/${fileName}.json`;
  }

  async _uploadJsonToS3(data: any, s3Key: string, metadata: Metadata) {
    defaultLog.debug({ label: '_uploadJsonToS3', message: 'Uploading JSON data to S3.' });

    return uploadBufferToS3(Buffer.from(JSON.stringify(data)), 'application/json', s3Key, metadata);
  }

  async _getAllSignedURLs(s3Keys: string[]): Promise<string[]> {
    defaultLog.debug({ label: '_getAllSignedURLs', message: 'Generating signed URLs for export file(s).' });

    const signedURLs = await Promise.all(s3Keys.map((key) => getS3SignedURL(key)));

    if (signedURLs.some((item) => item === null)) {
      throw new Error('Failed to generate signed URLs for all export files.');
    }

    return signedURLs as string[];
  }
}
