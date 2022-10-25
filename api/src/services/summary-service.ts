import { SUBMISSION_STATUS_TYPE, SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { SubmissionRepository } from '../repositories/submission-repository';
import { ISummarySubmissionMessagesResponse, ISummarySubmissionResponse, ISummaryTemplateSpeciesData, ISurveySummaryDetails, SummaryRepository } from '../repositories/summary-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { ICsvState, IHeaderError, IRowError } from '../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { MessageError, SubmissionError, SummarySubmissionErrorFromMessageType, SummarySubmissionError } from '../utils/submission-error';
import { DBService } from './db-service';
import { ErrorService } from './error-service';
import { SurveyService } from './survey-service';
import { OccurrenceService } from './occurrence-service';
import { PostSummaryDetails } from '../models/summaryresults-create';

const defaultLog = getLogger('services/summary-service');

interface ICsvMediaState {
  csv_state: ICsvState[];
  media_state: IMediaState;
}

export class SummaryService extends DBService {
  summaryRepository: SummaryRepository;
  submissionRepository: SubmissionRepository;
  surveyService: SurveyService;
  occurrenceService: OccurrenceService;
  errorService: ErrorService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.summaryRepository = new SummaryRepository(connection);
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
   * @return {*} {Promise<void>}
   */
  async validateFile(summarySubmissionId: number, surveyId: number): Promise<void> {
    defaultLog.debug({ label: 'validateFile' });
    try {
      // First, prep XLSX
      const submissionPrep = await this.summaryTemplatePreparation(summarySubmissionId);

      // Next, validate the summary template
      await this.summaryTemplateValidation(submissionPrep.xlsx, surveyId);
    } catch (error) {
      if (error instanceof SummarySubmissionError) {
        // If any summary submission parsing or file errors are thrown, persist them
        await this.errorService.insertSummarySubmissionError(summarySubmissionId, error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Update existing `survey_summary_submission` record with key.
   *
   * @param {number} submissionId
   * @param {string} key
   * @return {*}  {Promise<{ survey_summary_submission_id: number }>}
   */
  async updateSurveySummarySubmissionWithKey(
    summarySubmissionId: number,
    key: string,
  ): Promise<{ survey_summary_submission_id: number }> {
    defaultLog.debug({ label: 'updateSurveySummarySubmissionWithKey' });
    return this.summaryRepository.updateSurveySummarySubmissionWithKey(summarySubmissionId, key);
  };

  /**
   * Inserts a new record into the `survey_summary_submission` table.
   *
   * @param {number} surveyId
   * @param {string} source
   * @param {string} file_name
   * @return {*}  {Promise<{ survey_summary_submission_id: number }>}
   */
  async insertSurveySummarySubmission(
    surveyId: number,
    source: string,
    file_name: string,
  ): Promise<{ survey_summary_submission_id: number }> {
    defaultLog.debug({ label: 'insertSurveySummarySubmission' });
    return this.summaryRepository.insertSurveySummarySubmission(surveyId, source, file_name)
  };

  /**
   *Soft deletes the summary submission entry by ID
   *
   * @param {number} summarySubmissionId
   * @returns {*} {{ delete_timestamp: string }}
   */
  async deleteSummarySubmission(summarySubmissionId: number): Promise<{ delete_timestamp: string }> {
    return this.summaryRepository.deleteSummarySubmission(summarySubmissionId);
  }

  /**
   * Upload scraped summary submission data.
   *
   * @param {number} summarySubmissionId
   * @param {any} scrapedSummaryDetail
   * @return {*} {Promise<{ survey_summary_detail_id: number }>}
   */
  async uploadScrapedSummarySubmission(
    summarySubmissionId: number,
    scrapedSummaryDetail: PostSummaryDetails,
  ) {
    return this.summaryRepository.insertSurveySummaryDetails(summarySubmissionId, scrapedSummaryDetail)
  };

  /**
   * Gets the list of messages for a summary submission.
   *
   * @param {number} summarySubmissionId
   * @returns {*} {Promise<ISummarySubmissionMessagesResponse[]>}
   */
  async getSummarySubmissionMessages (
    summarySubmissionId: number
  ): Promise<ISummarySubmissionMessagesResponse[]> {
    return this.summaryRepository.getSummarySubmissionMessages(summarySubmissionId) || []
  }

  /**
   * Gets the record for a single summary submission.
   *
   * @param {number} surveyId
   * @returns {*} {Promise<ISurveySummaryDetails>}
   */
  async findSummarySubmissionById (summarySubmissionId: number): Promise<ISummarySubmissionResponse> {
    return this.summaryRepository.findSummarySubmissionById(summarySubmissionId)
  }

  /**
   * Gets latest summary submission for a survey.
   *
   * @param {number} surveyId
   * @returns {*} {Promise<ISurveySummaryDetails>}
   */
   async getLatestSurveySummarySubmission (surveyId: number): Promise<ISurveySummaryDetails> {
    return this.summaryRepository.getLatestSurveySummarySubmission(surveyId)
  }

  /**
   * done = true
   * @TODO jsdoc
   * Prepares a summary template XLSX
   * @param summarySubmissionId 
   * @returns 
   */
  private async summaryTemplatePreparation(summarySubmissionId: number): Promise<{ s3InputKey: string; xlsx: XLSXCSV }> {
    defaultLog.debug({ label: 'summaryTemplatePreparation' });
    try {
      const summarySubmission = await this.findSummarySubmissionById(summarySubmissionId);
      const s3InputKey = summarySubmission.key; // S3 key
      const s3File = await getFileFromS3(s3InputKey);
      const xlsx = this.prepXLSX(s3File);

      return { s3InputKey: s3InputKey, xlsx: xlsx };
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_SUMMARY_PREPARATION);
      }
      throw error;
    }
  }

  /**
   * done = True
   * 
   * @param xlsx 
   * @param surveyId 
   */
  private async summaryTemplateValidation(xlsx: XLSXCSV, surveyId: number) {
    defaultLog.debug({ label: 'summaryTemplateValidation' });
    try {
      const schema = await this.getValidationSchema(xlsx, surveyId);
      const schemaParser = this.getValidationRules(schema);
      const csvState = this.validateXLSX(xlsx, schemaParser);
      await this.persistSummaryValidationResults(csvState.csv_state, csvState.media_state);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
      }
      throw error;
    }
  }

  /**
   * done = TRUE
   * @todo jsdoc
   * @param file 
   * @returns 
   */
  private prepXLSX(file: any): XLSXCSV {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });
    const parsedMedia = parseUnknownMedia(file);

    // @TODO not sure how to trigger these through testing
    if (!parsedMedia) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    // @TODO not sure how to trigger these through testing
    if (!(parsedMedia instanceof MediaFile)) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_XLSX_CSV);
    }

    const xlsxCsv = new XLSXCSV(parsedMedia);

    const sims_name = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_name;
    const sims_version = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_version;

    if (!sims_name || !sims_version) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TEMPLATE_NAME_VERSION);
    }

    return xlsxCsv;
  }

  /**
   * done = TRUE
   * @todo jsdoc
   * @param file 
   * @param surveyId 
   * @returns 
   */
  private async getSummaryTemplateSpeciesRecord(file: XLSXCSV, surveyId: number): Promise<ISummaryTemplateSpeciesData> {
    const speciesData = await this.surveyService.getSpeciesData(surveyId);
    
    // Summary template name and version
    const sims_name: string = file.workbook.rawWorkbook.Custprops.sims_name;
    const sims_version: string = file.workbook.rawWorkbook.Custprops.sims_version;
    defaultLog.debug({
      label: 'getSummaryTemplateSpeciesRecord',
      data: {
        surveyId,
        species: speciesData,
        sims_name,
        sims_version
      }
    });

    return this.summaryRepository.getSummaryTemplateSpeciesRecord(
      sims_name,
      sims_version,
      speciesData.focal_species[0]
    );
  }

  /**
   * done = TRUE
   * 
   * @param file 
   * @param surveyId 
   * @returns 
   */
  private async getValidationSchema(file: XLSXCSV, surveyId: number): Promise<string> {
    defaultLog.debug({ label: 'getValidationSchema' });
    const summaryTemplateSpeciesRecord = await this.getSummaryTemplateSpeciesRecord(file, surveyId)

    const validationSchema = summaryTemplateSpeciesRecord?.validation;
    defaultLog.debug({ label: 'getValidationSchema', schema: validationSchema });
    if (!validationSchema) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES);
    }
    return validationSchema;
  }

  /**
   * done = TRUE
   * 
   * @param schema 
   * @returns 
   */
  private getValidationRules(schema: string | object): ValidationSchemaParser {
    defaultLog.debug({ label: 'getValidationRules' });
    const validationSchemaParser = new ValidationSchemaParser(schema);
    return validationSchemaParser;
  }

  /**
   * done = TRUE
   * @param file 
   * @param parser 
   * @returns 
   */
  private validateXLSX(file: XLSXCSV, parser: ValidationSchemaParser) {
    defaultLog.debug({ label: 'validateXLSX' });
    const mediaState = file.isMediaValid(parser);

    if (!mediaState.isValid) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const csvState: ICsvState[] = file.isContentValid(parser);
    return {
      csv_state: csvState,
      media_state: mediaState
    } as ICsvMediaState;
  }

  /**
   * done = True?
   * 
   * @param csvState 
   * @param mediaState 
   * @returns 
   */
  private async persistSummaryValidationResults(csvState: ICsvState[], mediaState: IMediaState): Promise<boolean> {
    defaultLog.debug({ label: 'persistSummaryValidationResults', message: 'validationResults' });

    let parseError = false;
    const errors: MessageError<SUMMARY_SUBMISSION_MESSAGE_TYPE>[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      errors.push(new MessageError(SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA, `${fileError}`, 'Miscellaneous'));
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        errors.push(
          new MessageError(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
            this.generateHeaderErrorMessage(csvStateItem.fileName, headerError),
            headerError.errorCode
          )
        );
      });

      csvStateItem.rowErrors?.forEach((rowError) => {
        errors.push(
          new MessageError(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
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
      throw new SummarySubmissionError({ messages: errors });
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
  private generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
    return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
  }

  /**
   * done = true
   * 
   * @param fileName 
   * @param rowError 
   * @returns 
   */
  private generateRowErrorMessage(fileName: string, rowError: IRowError): string {
    return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
  }
}
