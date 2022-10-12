import AdmZip from 'adm-zip';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { SubmissionRepository } from '../repositories/submission-repsitory';
import { ValidationRepository } from '../repositories/validation-repository';
import { getFileFromS3, uploadBufferToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { ICsvState, IHeaderError, IRowError } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformationSchemaParser } from '../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../utils/media/xlsx/transformation/xlsx-transformation';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { MessageError, SubmissionError, SubmissionErrorFromMessageType } from '../utils/submission-error';
import { DBService } from './db-service';
import { ErrorService } from './error-service';
import { OccurrenceService } from './occurrence-service';

const defaultLog = getLogger('services/dwc-service');

interface ICsvMediaState {
  csv_state: ICsvState[];
  media_state: IMediaState;
}

interface IFileBuffer {
  name: string;
  buffer: Buffer;
}
export class ValidationService extends DBService {
  validationRepository: ValidationRepository;
  submissionRepository: SubmissionRepository;
  occurrenceService: OccurrenceService;
  errorService: ErrorService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.validationRepository = new ValidationRepository(connection);
    this.submissionRepository = new SubmissionRepository(connection);
    this.occurrenceService = new OccurrenceService(connection);
    this.errorService = new ErrorService(connection);
  }

  async scrapeOccurrences(submissionId: number) {
    try {
      await this.templateScrapeAndUploadOccurrences(submissionId);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async transformFile(submissionId: number) {
    try {
      const submissionPrep = await this.templatePreperation(submissionId);
      await this.templateTransformation(submissionId, submissionPrep.xlsx, submissionPrep.s3InputKey);

      // insert tempalte validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async validateFile(submissionId: number) {
    try {
      const submissionPrep = await this.templatePreperation(submissionId);
      await this.templateValidation(submissionId, submissionPrep.xlsx);

      // insert tempalte validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async processDWCFile(submissionId: number) {
    try {
      // prep dwc
      const dwcPrep = await this.dwcPreperation(submissionId);

      // validate dwc
      const csvState = this.validateDWC(dwcPrep.archive);

      // update submission
      await this.persistValidationResults(csvState.csv_state, csvState.media_state);
      await this.occurrenceService.updateSurveyOccurrenceSubmission(
        submissionId,
        dwcPrep.archive.rawFile.fileName,
        dwcPrep.s3InputKey
      );
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async processFile(submissionId: number) {
    try {
      // template preperation
      const submissionPrep = await this.templatePreperation(submissionId);

      // template validation
      await this.templateValidation(submissionId, submissionPrep.xlsx);
      // insert tempalte validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);

      // template transformation
      await this.templateTransformation(submissionId, submissionPrep.xlsx, submissionPrep.s3InputKey);
      // insert tempalte validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);

      // occurrence scraping
      await this.templateScrapeAndUploadOccurrences(submissionId);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  validateDWC(archive: DWCArchive): ICsvMediaState {
    try {
      const validationSchema = {};
      const rules = this.getValidationRules(validationSchema);
      const csvState = this.validateDWCArchive(archive, rules);

      return csvState as ICsvMediaState;
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
      }
      throw error;
    }
  }

  async dwcPreperation(submissionId: number): Promise<{ archive: DWCArchive; s3InputKey: string }> {
    try {
      const occurrenceSubmission = await this.occurrenceService.getOccurrenceSubmission(submissionId);
      const s3InputKey = occurrenceSubmission.input_key;
      const s3File = await getFileFromS3(s3InputKey);
      const archive = this.prepDWCArchive(s3File);

      return { archive, s3InputKey };
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
      }
      throw error;
    }
  }

  async templatePreperation(submissionId: number): Promise<{ s3InputKey: string; xlsx: XLSXCSV }> {
    try {
      const occurrenceSubmission = await this.occurrenceService.getOccurrenceSubmission(submissionId);
      const s3InputKey = occurrenceSubmission.input_key;
      const s3File = await getFileFromS3(s3InputKey);
      const xlsx = await this.prepXLSX(s3File);

      return { s3InputKey: s3InputKey, xlsx: xlsx };
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPERATION);
      }
      throw error;
    }
  }

  async templateScrapeAndUploadOccurrences(submissionId: number) {
    try {
      const occurrenceSubmission = await this.occurrenceService.getOccurrenceSubmission(submissionId);
      const s3OutputKey = occurrenceSubmission.output_key;
      const s3File = await getFileFromS3(s3OutputKey);
      const archive = await this.prepDWCArchive(s3File);
      await this.occurrenceService.scrapeAndUploadOccurrences(submissionId, archive);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
      }
      throw error;
    }
  }

  async templateValidation(submissionId: number, xlsx: XLSXCSV) {
    try {
      const schema = await this.getValidationSchema(xlsx);
      const schemaParser = await this.getValidationRules(schema);
      const csvState = await this.validateXLSX(xlsx, schemaParser);
      await this.persistValidationResults(csvState.csv_state, csvState.media_state);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
      }
      throw error;
    }
  }

  async templateTransformation(submissionId: number, xlsx: XLSXCSV, s3InputKey: string) {
    try {
      const xlsxSchema = await this.getTransformationSchema(xlsx);
      const xlsxParser = await this.getTransformationRules(xlsxSchema);
      const fileBuffer = await this.transformXLSX(xlsx, xlsxParser);
      await this.persistTransformationResults(submissionId, fileBuffer, s3InputKey, xlsx);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_TRANSFORMED);
      }
      throw error;
    }
  }

  prepXLSX(file: any): XLSXCSV {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });
    const parsedMedia = parseUnknownMedia(file);

    if (!parsedMedia) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    if (!(parsedMedia instanceof MediaFile)) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const xlsxCsv = new XLSXCSV(parsedMedia);

    const template_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_template_id;
    const csm_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_csm_id;

    if (!template_id || !csm_id) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA);
    }

    return xlsxCsv;
  }

  async getValidationSchema(file: XLSXCSV): Promise<any> {
    const template_id = file.workbook.rawWorkbook.Custprops.sims_template_id;
    const field_method_id = file.workbook.rawWorkbook.Custprops.sims_csm_id;

    const templateMethodologySpeciesRecord = await this.validationRepository.getTemplateMethodologySpeciesRecord(
      Number(field_method_id),
      Number(template_id)
    );

    const validationSchema = templateMethodologySpeciesRecord?.validation;
    if (!validationSchema) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES);
    }

    return validationSchema;
  }

  // validation service
  getValidationRules(schema: any): ValidationSchemaParser {
    const validationSchemaParser = new ValidationSchemaParser(schema);
    return validationSchemaParser;
  }

  // validation service
  validateXLSX(file: XLSXCSV, parser: ValidationSchemaParser) {
    const mediaState = file.isMediaValid(parser);

    if (!mediaState.isValid) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const csvState: ICsvState[] = file.isContentValid(parser);
    return {
      csv_state: csvState,
      media_state: mediaState
    } as ICsvMediaState;
  }

  async persistValidationResults(csvState: ICsvState[], mediaState: IMediaState): Promise<boolean> {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    let parseError = false;
    const errors: MessageError[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      errors.push(new MessageError(SUBMISSION_MESSAGE_TYPE.ERROR, `${fileError}`, 'Miscellaneous'));
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        errors.push(
          new MessageError(
            SUBMISSION_MESSAGE_TYPE.ERROR,
            this.generateHeaderErrorMessage(csvStateItem.fileName, headerError),
            headerError.errorCode
          )
        );
      });

      csvStateItem.rowErrors?.forEach((rowError) => {
        errors.push(
          new MessageError(
            SUBMISSION_MESSAGE_TYPE.ERROR,
            this.generateRowErrorMessage(csvStateItem.fileName, rowError),
            rowError.errorCode
          )
        );
      });

      if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists, skip remaining steps
        parseError = true;
      }
    });

    if (parseError) {
      throw new SubmissionError({ messages: errors });
    }

    return parseError;
  }

  async getTransformationSchema(file: XLSXCSV): Promise<any> {
    const template_id = file.workbook.rawWorkbook.Custprops.sims_template_id;
    const field_method_id = file.workbook.rawWorkbook.Custprops.sims_csm_id;

    const templateMethodologySpeciesRecord = await this.validationRepository.getTemplateMethodologySpeciesRecord(
      Number(field_method_id),
      Number(template_id)
    );

    const transformationSchema = templateMethodologySpeciesRecord?.transform;
    if (!transformationSchema) {
      throw SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES;
    }

    return transformationSchema;
  }

  getTransformationRules(schema: any): TransformationSchemaParser {
    const validationSchemaParser = new TransformationSchemaParser(schema);
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

  async persistTransformationResults(
    submissionId: number,
    fileBuffers: IFileBuffer[],
    s3OutputKey: string,
    xlsxCsv: XLSXCSV
  ) {
    // Build the archive zip file
    const dwcArchiveZip = new AdmZip();
    fileBuffers.forEach((file) => dwcArchiveZip.addFile(`${file.name}.csv`, file.buffer));

    // Remove the filename from original s3Key
    // project/1/survey/1/submission/file_name.txt -> project/1/survey/1/submission
    const outputS3KeyPrefix = s3OutputKey.split('/').slice(0, -1).join('/');

    const outputFileName = `${xlsxCsv.rawFile.name}.zip`;
    const outputS3Key = `${outputS3KeyPrefix}/${outputFileName}`;

    // Upload transformed archive to s3
    await uploadBufferToS3(dwcArchiveZip.toBuffer(), 'application/zip', outputS3Key);

    // update occurrence submission
    await this.occurrenceService.updateSurveyOccurrenceSubmission(submissionId, outputFileName, outputS3Key);

    // insert tempalte validated status
    await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);
  }

  prepDWCArchive(s3File: any): DWCArchive {
    defaultLog.debug({ label: 'prepDWCArchive', message: 's3File' });

    const parsedMedia = parseUnknownMedia(s3File);
    if (!parsedMedia) {
      throw SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE;
    }

    if (!(parsedMedia instanceof ArchiveFile)) {
      throw SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE;
    }

    const dwcArchive = new DWCArchive(parsedMedia);
    return dwcArchive;
  }

  validateDWCArchive(dwc: DWCArchive, parser: ValidationSchemaParser) {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'dwcArchive' });
    const mediaState = dwc.isMediaValid(parser);
    if (!mediaState.isValid) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const csvState: ICsvState[] = dwc.isContentValid(parser);

    return {
      csv_state: csvState,
      media_state: mediaState
    } as ICsvMediaState;
  }

  generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
    return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
  }

  generateRowErrorMessage(fileName: string, rowError: IRowError): string {
    return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
  }
}
