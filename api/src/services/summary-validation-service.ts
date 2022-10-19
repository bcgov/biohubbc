import AdmZip from 'adm-zip';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { SubmissionRepository } from '../repositories/submission-repository';
import { ISummaryTemplateSpeciesData, SummaryValidationRepository } from '../repositories/summary-validation-repository';
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
import { SurveyService } from './survey-service';
import { OccurrenceService } from './occurrence-service';

const defaultLog = getLogger('services/summary-validation-service');

interface ICsvMediaState {
  csv_state: ICsvState[];
  media_state: IMediaState;
}

interface IFileBuffer {
  name: string;
  buffer: Buffer;
}
export class SummaryValidationService extends DBService {
  summaryValidationRepository: SummaryValidationRepository;
  submissionRepository: SubmissionRepository;
  surveyService: SurveyService;
  occurrenceService: OccurrenceService;
  errorService: ErrorService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.summaryValidationRepository = new SummaryValidationRepository(connection);
    this.submissionRepository = new SubmissionRepository(connection);
    this.occurrenceService = new OccurrenceService(connection);
    this.surveyService = new SurveyService(connection);
    this.errorService = new ErrorService(connection);
  }

  /**
   * done = TRUE
   * Validates a summary submission file based on given summary submission ID and survey ID.
   * @param summarySubmissionId 
   * @param surveyId 
   */
  async validateFile(summarySubmissionId: number, surveyId: number) {
    try {
      // First, prep XLSX
      const submissionPrep = await this.summaryTemplatePreparation(summarySubmissionId);

      // Next, validate the summary template
      await this.summaryTemplateValidation(submissionPrep.xlsx, surveyId);
    } catch (error) {
      if (error instanceof SubmissionError) {
        // If any summary submission parsing or file errors are thrown, persist them
        await this.errorService.insertSummarySubmissionError(summarySubmissionId, error);
      } else {
        throw error;
      }
    }
  }

  /**
   * done = false
   * Prepares a summary template XLSX
   * @param summarySubmissionId 
   * @returns 
   */
  async summaryTemplatePreparation(summarySubmissionId: number): Promise<{ s3InputKey: string; xlsx: XLSXCSV }> {
    try {
      /**
       * @TODO Move the code from /summary/submission/get.ts into a new method called getSurveySummarySubmission in the submission
       * repository. Next, call this method instead of calling the occurrenceService method
       */
      const occurrenceSubmission = await this.occurrenceService.getOccurrenceSubmission(submissionId);
      const s3InputKey = occurrenceSubmission.input_key;
      const s3File = await getFileFromS3(s3InputKey);
      const xlsx = this.prepXLSX(s3File);

      return { s3InputKey: s3InputKey, xlsx: xlsx };
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION);
      }
      throw error;
    }
  }

  /**
   * done = false
   * 
   * @param xlsx 
   * @param surveyId 
   */
  async summaryTemplateValidation(xlsx: XLSXCSV, surveyId: number) {
    try {
      const schema = await this.getValidationSchema(xlsx, surveyId);
      const schemaParser = this.getValidationRules(schema);
      const csvState = this.validateXLSX(xlsx, schemaParser);
      await this.persistValidationResults(csvState.csv_state, csvState.media_state);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
      }
      throw error;
    }
  }

  /**
   * done = TRUE
   * 
   * @param file 
   * @returns 
   */
  prepXLSX(file: any): XLSXCSV {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });
    const parsedMedia = parseUnknownMedia(file);

    // @TODO not sure how to trigger these through testing
    if (!parsedMedia) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    // @TODO not sure how to trigger these through testing
    if (!(parsedMedia instanceof MediaFile)) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_XLSX_CSV);
    }

    const xlsxCsv = new XLSXCSV(parsedMedia);

    const sims_name = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_name;
    const sims_version = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_version;

    if (!sims_name || !sims_version) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TEMPLATE_NAME_VERSION);
    }

    return xlsxCsv;
  }

  /**
   * done = TRUE
   * 
   * @param file 
   * @param surveyId 
   * @returns 
   */
  async getSummaryTemplateSpeciesRecord(file: XLSXCSV, surveyId: number): Promise<ISummaryTemplateSpeciesData> {
    // Summary template name
    const sims_name: string = file.workbook.rawWorkbook.Custprops.sims_name;
    
    // Summary template version
    const sims_version: string = file.workbook.rawWorkbook.Custprops.sims_version;

    const surveyData = await this.surveyService.getSurveyById(surveyId);
    const surveySpecies = surveyData.species.focal_species;
  
    return this.summaryValidationRepository.getSummaryTemplateSpeciesRecord(
      sims_name,
      sims_version,
      surveySpecies[0]
    );
  }

  /**
   * done = TRUE
   * 
   * @param file 
   * @param surveyId 
   * @returns 
   */
  async getValidationSchema(file: XLSXCSV, surveyId: number): Promise<string> {
    const summaryTemplateSpeciesRecord = await this.getSummaryTemplateSpeciesRecord(file, surveyId)

    const validationSchema = summaryTemplateSpeciesRecord?.validation;
    if (!validationSchema) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES);
    }

    return validationSchema;
  }

  /**
   * done = TRUE
   * 
   * @param schema 
   * @returns 
   */
  getValidationRules(schema: string | object): ValidationSchemaParser {
    const validationSchemaParser = new ValidationSchemaParser(schema);
    return validationSchemaParser;
  }

  /**
   * done = TRUE
   * @param file 
   * @param parser 
   * @returns 
   */
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

  /**
   * done = false
   * 
   * @param csvState 
   * @param mediaState 
   * @returns 
   */
  async persistValidationResults(csvState: ICsvState[], mediaState: IMediaState): Promise<boolean> {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    let parseError = false;
    const errors: MessageError[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      errors.push(new MessageError(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA, `${fileError}`, 'Miscellaneous'));
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        errors.push(
          new MessageError(
            SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
            this.generateHeaderErrorMessage(csvStateItem.fileName, headerError),
            headerError.errorCode
          )
        );
      });

      csvStateItem.rowErrors?.forEach((rowError) => {
        errors.push(
          new MessageError(
            SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
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

  /**
   * done = true
   * 
   * @param fileName 
   * @param headerError 
   * @returns 
   */
  generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
    return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
  }

  /**
   * done = true
   * 
   * @param fileName 
   * @param rowError 
   * @returns 
   */
  generateRowErrorMessage(fileName: string, rowError: IRowError): string {
    return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
  }
}
