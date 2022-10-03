import AWS from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { IDBConnection } from '../database/db';
import { insertSubmissionMessage, insertSubmissionStatus } from '../paths/dwc/validate';
import { getTemplateMethodologySpeciesRecord } from '../paths/xlsx/validate';
import { ValidationRepository } from '../repositories/validation-repository';
import { getLogger } from '../utils/logger';
import { MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { DBService } from './service';

const defaultLog = getLogger('services/dwc-service');

export class ValidationService extends DBService {
  validationRepository: ValidationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.validationRepository = new ValidationRepository(connection);
  }

  async create(): Promise<void> {}
}

const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME || '';
const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
const AWS_ENDPOINT = new AWS.Endpoint(OBJECT_STORE_URL);
const S3 = new AWS.S3({
  endpoint: AWS_ENDPOINT.href,
  accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
  secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID,
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
  region: 'ca-central-1'
});

export class FileProcessingService extends DBService {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  async processFile(): Promise<void> {}

  // general setup
  // process_step1_getOccurrenceSubmission(): RequestHandler {
  //     return async (req, res, next) => {}
  // }
  // process_step2_getOccurrenceSubmissionInputS3Key(): RequestHandler {
  //     return async (req, res, next) => {}
  // }

  getS3File(key: string, versionId?: string): Promise<GetObjectOutput> {
    return S3.getObject({
      Bucket: OBJECT_STORE_BUCKET_NAME,
      Key: key,
      VersionId: versionId
    }).promise();
  }

  // how do we want errors
  prepXLSX(file: any): XLSXCSV {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });
    try {
      const parsedMedia = parseUnknownMedia(file);

      if (!parsedMedia) {
        // parseError on req
        throw 'Failed to parse submission, file was empty';
      }

      if (!(parsedMedia instanceof MediaFile)) {
        // parseError on req
        throw 'Failed to parse submission, not a valid XLSX CSV file';
      }

      const xlsxCsv = new XLSXCSV(parsedMedia);

      const template_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_template_id;
      const csm_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_csm_id;

      if (!template_id || !csm_id) {
        // parseError on req
        throw 'Failed to parse submission, template identification properties are missing';
      }

      return xlsxCsv;
    } catch (error) {
      defaultLog.error({ label: 'prepXLSX', message: 'error', error });
      throw error;
    }
  }

  // should be part of new error service
  async persistParseErrors(submissionId: number, parseError: string) {
    defaultLog.debug({ label: 'persistParseErrors', message: 'parseError', parseError });

    try {
      await this.connection.open();

      const statusId = await insertSubmissionStatus(submissionId, 'Rejected', this.connection);
      insertSubmissionMessage(statusId, 'Error', parseError, 'Miscellaneous', this.connection);
      await this.connection.commit();
    } catch (error) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
      await this.connection.rollback();
      throw error;
    } finally {
      this.connection.release();
    }
  }

  async getValidationSchema(file: XLSXCSV): Promise<any> {
    const template_id = file.workbook.rawWorkbook.Custprops.sims_template_id;
    const field_method_id = file.workbook.rawWorkbook.Custprops.sims_csm_id;

    const templateMethodologySpeciesRecord = await getTemplateMethodologySpeciesRecord(
      Number(field_method_id),
      Number(template_id),
      this.connection
    );

    const validationSchema = templateMethodologySpeciesRecord?.validation;
    if (!validationSchema) {
      throw 'Unable to fetch an appropriate template validation schema for your submission';
    }

    return validationSchema;
  }

  sendResponse(): Promise<any> {
    return Promise.resolve();
  }

  process_step5_persistParseErrors(): RequestHandler {
    return async (req, res, next) => {};
  }

  process_step6_sendResponse(): RequestHandler {
    return async (req, res, next) => {};
  }

  // xlsx validation
  process_step7_getValidationSchema(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step8_getValidationRules(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step9_validateXLSX(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step10_persistValidationResults(): RequestHandler {
    return async (req, res, next) => {};
  }

  // xlsx transform functions
  process_step11_getTransofrmationSchema(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step12_getTransformationRules(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step13_transformXLSX(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step14_persistTransformationResults(): RequestHandler {
    return async (req, res, next) => {};
  }

  // scrape functions
  process_step15_getOccurrenceSubmission(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step16_getSubmissionOutputS3Key(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step17_getS3File(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step18_prepDWCArchive(): RequestHandler {
    return async (req, res, next) => {};
  }
  process_step19_scrapeAndUploadOccurrences(): RequestHandler {
    return async (req, res, next) => {};
  }
}
