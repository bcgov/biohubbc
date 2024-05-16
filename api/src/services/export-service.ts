import AdmZip from 'adm-zip';
import { Metadata } from 'aws-sdk/clients/s3';
import * as pg from 'pg';
import SQL from 'sql-template-strings';
import { PassThrough, Transform } from 'stream';
import { getDBPool, IDBConnection } from '../database/db';
import { generateS3SurveyExportKey, getS3SignedURL, uploadBufferToS3, uploadStreamToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { ObservationService } from './observation-service';
import { SampleLocationService } from './sample-location-service';
import { SurveyCritterService } from './survey-critter-service';
import { SurveyService } from './survey-service';
import { TelemetryService } from './telemetry-service';

const defaultLog = getLogger('api/src/services/export-service.ts');

export type SurveyExportConfig = {
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
export class ExportService extends DBService {
  surveyService: SurveyService;
  sampleLocationService: SampleLocationService;
  observationService: ObservationService;
  telemetryService: TelemetryService;
  surveyCritterService: SurveyCritterService;
  //   critterbaseService: CritterbaseService;

  transform = new Transform();
  passthrough = new PassThrough();

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyService = new SurveyService(connection);
    this.sampleLocationService = new SampleLocationService(connection);
    this.observationService = new ObservationService(connection);
    this.telemetryService = new TelemetryService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    // this.critterbaseService = new CritterbaseService({});

    this.transform.pipe(this.passthrough);
  }

  async exportSurveyStream(surveyId: number, _config: SurveyExportConfig) {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const dbPool = await getDBPool();

    if (!dbPool) {
      throw new Error('Failed to get database connection.');
    }

    const client = await dbPool.connect();

    const query = new pg.Query(sqlStatement.text, sqlStatement.values);

    const stream = client.query(query);

    stream
      .on('row', (row, result) => {
        console.log('Stream row', row);
        console.log('Stream result', result);
        this.transform.push(row);
      })
      .on('error', (error: Error) => {
        console.error('Stream error', error);
        client.release();
        this.transform.push(error);
      })
      .on('end', (result) => {
        console.log('Stream end', result);
        client.release();
        this.transform.push(null);
      });

    const result = await uploadStreamToS3(this.transform, 'application/json', 'test_stream.json');

    console.log('Stream upload result', result);

    // dbPool.connect((error, client, done) => {
    //   if (error) {
    //     defaultLog.error({ label: 'exportSurveyStream', message: 'Error', error });
    //     throw error;
    //   }

    //   const query = new QueryStream(sqlStatement.text, sqlStatement.values);

    //   const stream = client.query(query);

    //   stream.on('end', done);
    // });

    // const client = await dbPool.connect();

    // const query = new QueryStream(sqlStatement.text, sqlStatement.values);

    // const stream = client.query(query);

    // stream.on('end', dbPool.end);

    // this.connection.sql(sqlStatement.text, sqlStatement.values);
  }

  async exportSurvey(surveyId: number, config: SurveyExportConfig): Promise<string[]> {
    try {
      defaultLog.debug({ label: 'exportSurvey', message: 'Exporting survey data.' });

      const dataForExport = await this._getAllDataForExport(surveyId, config);

      const exportZipFile = this._zipData(dataForExport);

      const s3Keys = await this._uploadZipFileToS3(surveyId, exportZipFile);

      return this._getAllSignedURLs([s3Keys]);
    } catch (error) {
      defaultLog.error({ label: 'exportSurvey', message: 'Failed to export survey data.', error });
      throw error;
    }
  }

  /**
   * Create a ZIP file.
   *
   * @param {ExportDataBundle[]} dataForZip
   * @return {*}  {AdmZip}
   * @memberof ExportService
   */
  _zipData(dataForZip: ExportDataBundle[]): AdmZip {
    const exportZipFile = new AdmZip();

    for (const data of dataForZip) {
      exportZipFile.addFile(`${data.fileName}.json`, Buffer.from(JSON.stringify(data.data)));
    }

    return exportZipFile;
  }

  /**
   * Upload a ZIP file to S3.
   *
   * @param {number} surveyId
   * @param {AdmZip} zipFile
   * @return {*}  {Promise<string>}
   * @memberof ExportService
   */
  async _uploadZipFileToS3(surveyId: number, zipFile: AdmZip): Promise<string> {
    defaultLog.debug({ label: '_uploadZipFileToS3', message: 'Uploading ZIP file to S3.' });

    const s3Key = generateS3SurveyExportKey({
      surveyId,
      fileName: `sims_survey_${surveyId}_export_${new Date().toISOString()}`,
      extension: 'zip'
    });

    await uploadBufferToS3(zipFile.toBuffer(), 'application/zip', s3Key);

    return s3Key;
  }

  /**
   * Upload JSON files to S3.
   *
   * @param {number} surveyId
   * @param {ExportDataBundle[]} dataForUpload
   * @return {*}  {Promise<string[]>}
   * @memberof ExportService
   */
  async _uploadJsonFilesToS3(surveyId: number, dataForUpload: ExportDataBundle[]): Promise<string[]> {
    defaultLog.debug({ label: '_uploadJsonFilesToS3', message: 'Uploading JSON data file to S3.' });

    const promises = dataForUpload.map(async (data) => {
      const s3Key = generateS3SurveyExportKey({ surveyId, fileName: data.fileName, extension: 'json' });

      await this._uploadJsonFileToS3(data.data, s3Key);

      return s3Key;
    });

    return Promise.all(promises);
  }

  /**
   * Upload a JSON file to S3.
   *
   * @param {*} dataForUpload
   * @param {string} s3Key
   * @param {Metadata} [metadata={}]
   * @return {*}
   * @memberof ExportService
   */
  async _uploadJsonFileToS3(dataForUpload: any, s3Key: string, metadata: Metadata = {}) {
    defaultLog.debug({ label: '_uploadJsonToS3', message: 'Uploading JSON data file to S3.' });

    return uploadBufferToS3(Buffer.from(JSON.stringify(dataForUpload)), 'application/json', s3Key, metadata);
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

    const signedURLs = await Promise.all(s3Keys.map((key) => getS3SignedURL(key)));

    if (signedURLs.some((item) => item === null)) {
      throw new Error('Failed to generate signed URLs for all export files.');
    }

    return signedURLs as string[];
  }

  /**
   * Fetch all data required for the export, based on the provided export configuration.
   *
   * @param {number} surveyId
   * @param {SurveyExportConfig} config
   * @return {*}  {Promise<ExportDataBundle[]>}
   * @memberof ExportService
   */
  async _getAllDataForExport(surveyId: number, config: SurveyExportConfig): Promise<ExportDataBundle[]> {
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
    const data = await this.surveyService.getSurveyById(surveyId);

    return { fileName: 'survey_metadata', data };
  }

  /**
   * Get sample locations for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getSampleLocationsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.sampleLocationService.getSampleLocationsForSurveyId(surveyId);

    return { fileName: 'sample_locations', data };
  }

  /**
   * Get observation data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getObservationDataForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.observationService.getAllSurveyObservations(surveyId);

    return { fileName: 'observations', data };
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
    const data = await this.surveyService.getAttachmentsData(surveyId);

    return { fileName: 'attachments', data };
  }

  /**
   * Get report attachments data for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ExportDataBundle>}
   * @memberof ExportService
   */
  async _getReportAttachmentsForSurveyId(surveyId: number): Promise<ExportDataBundle> {
    const data = await this.surveyService.getReportAttachmentsData(surveyId);

    return { fileName: 'reports', data };
  }
}
