import AWS from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { IDBConnection } from '../database/db';
import { generateHeaderErrorMessage, generateRowErrorMessage, insertSubmissionMessage, insertSubmissionStatus } from '../paths/dwc/validate';
import { getTemplateMethodologySpeciesRecord } from '../paths/xlsx/validate';
import { SubmissionRepository } from '../repositories/submission-repsitory';
import { ValidationRepository } from '../repositories/validation-repository';
import { getLogger } from '../utils/logger';
import { ICsvState } from '../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { DBService } from './service';

const defaultLog = getLogger('services/dwc-service');

interface ICsvMediaState {
  csv_state: ICsvState[]
  media_state: IMediaState
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

export class ValidationService extends DBService {
  validationRepository: ValidationRepository
  submissionRepository: SubmissionRepository

  constructor(connection: IDBConnection) {
    super(connection);
    this.validationRepository = new ValidationRepository(connection)
    this.submissionRepository = new SubmissionRepository(connection)
  }

  async processFile(): Promise<void> {}

  // S3 service?
  getS3File(key: string, versionId?: string): Promise<GetObjectOutput> {
    return S3.getObject({
      Bucket: OBJECT_STORE_BUCKET_NAME,
      Key: key,
      VersionId: versionId
    }).promise();
  }

  // validation service?
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

  // validation service
  async getValidationSchemaParser(file: XLSXCSV): Promise<any> {
    const template_id = file.workbook.rawWorkbook.Custprops.sims_template_id;
    const field_method_id = file.workbook.rawWorkbook.Custprops.sims_csm_id;
    
    const templateMethodologySpeciesRecord = await this.validationRepository.getTemplateMethodologySpeciesRecord(
      Number(field_method_id),
      Number(template_id)
    );

    const validationSchema = templateMethodologySpeciesRecord?.validation;
    if (!validationSchema) {
      throw 'Unable to fetch an appropriate template validation schema for your submission';
    }

    
    return validationSchema;
  }
  
  // validation service
  getValidationRules(schema: any) {
    const validationSchemaParser = new ValidationSchemaParser(schema)
    return validationSchemaParser;
  }

  // validation service
  validateXLSX(file: XLSXCSV, parser: ValidationSchemaParser) {
    const mediaState = file.isMediaValid(parser);

    if (!mediaState.isValid) {
      throw 'Media is no valid'
    }

    const csvState: ICsvState[] = file.isContentValid(parser);
    return {
      csv_state: csvState,
      media_state: mediaState
    } as ICsvMediaState;
  }

  async persistValidationResults(submissionId: number, csvState: ICsvState[], mediaState: IMediaState, statusTypeObject: any) {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });
    
    let submissionStatusType = statusTypeObject.initialSubmissionStatusType;
    if (!mediaState.isValid || csvState.some((item) => !item.isValid)) {
      // At least 1 error exists
      submissionStatusType = 'Rejected';
    }

    const submissionStatusId = await this.submissionRepository.insertSubmissionStatus(
      submissionId,
      submissionStatusType
    );

    const promises: Promise<any>[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      promises.push(
        this.submissionRepository.insertSubmissionMessage(submissionStatusId, 'Error', `${fileError}`, 'Miscellaneous')
      );
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        promises.push(
          this.submissionRepository.insertSubmissionMessage(
            submissionStatusId,
            'Error',
            generateHeaderErrorMessage(csvStateItem.fileName, headerError),
            headerError.errorCode
          )
        );
      });

      csvStateItem.rowErrors?.forEach((rowError) => {
        promises.push(
          this.submissionRepository.insertSubmissionMessage(
            submissionStatusId,
            'Error',
            generateRowErrorMessage(csvStateItem.fileName, rowError),
            rowError.errorCode
          )
        );  
      });

      if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists, skip remaining steps
        throw 'An error exists, skip remaining steps';
      }
    });

    await Promise.all(promises);
  }

  

  sendResponse(): Promise<any> {
    return Promise.resolve();
  }
}
