import AdmZip from 'adm-zip';
import AWS from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { PostOccurrence } from '../models/occurrence-create';
import { getHeadersAndRowsFromFile, uploadScrapedOccurrence } from '../paths/dwc/scrape-occurrences';
import { generateHeaderErrorMessage, generateRowErrorMessage, updateSurveyOccurrenceSubmissionWithOutputKey } from '../paths/dwc/validate';
import { OccurrenceRepository } from '../repositories/occurrence-repository';
import { SubmissionRepository } from '../repositories/submission-repsitory';
import { ValidationRepository } from '../repositories/validation-repository';
import { uploadBufferToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { ICsvState } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformationSchemaParser } from '../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../utils/media/xlsx/transformation/xlsx-transformation';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { DBService } from './service';

const defaultLog = getLogger('services/dwc-service');

interface ICsvMediaState {
  csv_state: ICsvState[]
  media_state: IMediaState
}

interface IFileBuffer { 
  name: string
  buffer: Buffer
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
  occurrenceRepository: OccurrenceRepository

  constructor(connection: IDBConnection) {
    super(connection);
    this.validationRepository = new ValidationRepository(connection);
    this.submissionRepository = new SubmissionRepository(connection);
    this.occurrenceRepository = new OccurrenceRepository(connection);
  }

  async processFile(submissionId: number): Promise<void> {
    console.log("_________ START _________")
    console.log(`Submission ID: ${submissionId}`);
    const occurrenceSubmission = await this.occurrenceRepository.getOccurrenceSubmission(submissionId)

  }

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
  // async persistParseErrors(submissionId: number, parseError: string) {
  //   defaultLog.debug({ label: 'persistParseErrors', message: 'parseError', parseError });

  //   try {
  //     await this.connection.open();

  //     const statusId = await insertSubmissionStatus(submissionId, 'Rejected', this.connection);
  //     insertSubmissionMessage(statusId, 'Error', parseError, 'Miscellaneous', this.connection);
  //     await this.connection.commit();
  //   } catch (error) {
  //     defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
  //     await this.connection.rollback();
  //     throw error;
  //   } finally {
  //     this.connection.release();
  //   }
  // }

  // validation service
  async getValidationSchema(file: XLSXCSV): Promise<any> {
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

  // ---------------------- TRANSFORMATION SERVICE?
  async getTranformationSchema(file: XLSXCSV): Promise<any> {
    const template_id = file.workbook.rawWorkbook.Custprops.sims_template_id;
    const field_method_id = file.workbook.rawWorkbook.Custprops.sims_csm_id;
    
    const templateMethodologySpeciesRecord = await this.validationRepository.getTemplateMethodologySpeciesRecord(
      Number(field_method_id),
      Number(template_id)
    );

    const validationSchema = templateMethodologySpeciesRecord?.transform;
    if (!validationSchema) {
      throw 'Unable to fetch an appropriate template validation schema for your submission';
    }
    
    return validationSchema;
  }

  async getTransformationRules(schema: any) {
    const validationSchemaParser = new TransformationSchemaParser(schema)
    return validationSchemaParser;
  }

  async transformXLSX(file: XLSXCSV, parser: TransformationSchemaParser): Promise<IFileBuffer[]> {
    const xlsxTransformation = new XLSXTransformation(parser, file);
    const transformedData = await xlsxTransformation.transform();
    const worksheets = xlsxTransformation.dataToSheet(transformedData);

    const fileBuffers: IFileBuffer[] = Object.entries(worksheets).map(([fileName, worksheet]) => {
      return {
        name: fileName,
        buffer: file.worksheetToBuffer(worksheet)
      };
    });

    return fileBuffers;
  }

  async persistTransformationResults(submissionId: number, fileBuffers: IFileBuffer[], s3Key: string, xlsxCsv: XLSXCSV) {

    // Build the archive zip file
    const dwcArchiveZip = new AdmZip();
    fileBuffers.forEach((file) => dwcArchiveZip.addFile(`${file.name}.csv`, file.buffer));

    // Remove the filename from original s3Key
    // project/1/survey/1/submission/file_name.txt -> project/1/survey/1/submission
    const outputS3KeyPrefix = s3Key.split('/').slice(0, -1).join('/');

    const outputFileName = `${xlsxCsv.rawFile.name}.zip`;
    const outputS3Key = `${outputS3KeyPrefix}/${outputFileName}`;

    // Upload transformed archive to s3
    await uploadBufferToS3(dwcArchiveZip.toBuffer(), 'application/zip', outputS3Key);

    await updateSurveyOccurrenceSubmissionWithOutputKey(
      submissionId,
      outputFileName,
      outputS3Key,
      this.connection
    );

    await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED)
  }


  // ---------------------- SCRAPE FUNCTIONS
  // need to get a fresh copy of the occurrence submission
  async prepDWCArchive(s3File: any) {
    const parsedMedia = parseUnknownMedia(s3File);
    if (!parsedMedia) {
      throw 'Failed to parse submission, file was empty';
    }

    if (!(parsedMedia instanceof ArchiveFile)) {
      throw 'Failed to parse submission, not a valid DwC Archive Zip file';
    }

    const dwcArchive = new DWCArchive(parsedMedia);
    return dwcArchive;
  }

  async scrapeAndUploadOccurrences(submissionId: number, archive: DWCArchive) {
    const {
      occurrenceRows,
      occurrenceIdHeader,
      associatedTaxaHeader,
      eventRows,
      lifeStageHeader,
      sexHeader,
      individualCountHeader,
      organismQuantityHeader,
      organismQuantityTypeHeader,
      occurrenceHeaders,
      eventIdHeader,
      eventDateHeader,
      eventVerbatimCoordinatesHeader,
      taxonRows,
      taxonIdHeader,
      vernacularNameHeader
    } = getHeadersAndRowsFromFile(archive);

    const scrapedOccurrences = occurrenceRows?.map((row: any) => {
        const occurrenceId = row[occurrenceIdHeader];
        const associatedTaxa = row[associatedTaxaHeader];
        const lifeStage = row[lifeStageHeader];
        const sex = row[sexHeader];
        const individualCount = row[individualCountHeader];
        const organismQuantity = row[organismQuantityHeader];
        const organismQuantityType = row[organismQuantityTypeHeader];

        const data = { headers: occurrenceHeaders, rows: row };

        let verbatimCoordinates;
        let eventDate;
        let vernacularName;

        eventRows?.forEach((eventRow: any) => {
          if (eventRow[eventIdHeader] === occurrenceId) {
            eventDate = eventRow[eventDateHeader];
            verbatimCoordinates = eventRow[eventVerbatimCoordinatesHeader];
          }
        });

        taxonRows?.forEach((taxonRow: any) => {
          if (taxonRow[taxonIdHeader] === occurrenceId) {
            vernacularName = taxonRow[vernacularNameHeader];
          }
        });

        return new PostOccurrence({
          associatedTaxa: associatedTaxa,
          lifeStage: lifeStage,
          sex: sex,
          individualCount: individualCount,
          vernacularName: vernacularName,
          data,
          verbatimCoordinates: verbatimCoordinates,
          organismQuantity: organismQuantity,
          organismQuantityType: organismQuantityType,
          eventDate: eventDate
        });
    });

    await Promise.all(scrapedOccurrences?.map((scrappedOccurrence) =>{
      uploadScrapedOccurrence(submissionId, scrappedOccurrence, this.connection)
    }) || [])
  }
}
