import { SUBMISSION_STATUS_TYPE, SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { PostSummaryDetails } from '../models/summaryresults-create';
import {
  ISummarySubmissionMessagesResponse,
  ISummarySubmissionResponse,
  ISummaryTemplateSpeciesData,
  ISurveySummaryDetails,
  SummaryRepository
} from '../repositories/summary-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { ICsvState, IHeaderError, IKeyError, IRowError } from '../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import {
  MessageError,
  SubmissionError,
  SummarySubmissionError,
  SummarySubmissionErrorFromMessageType
} from '../utils/submission-error';
import { DBService } from './db-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/summary-service');

interface ICsvMediaState {
  csv_state: ICsvState[];
  media_state: IMediaState;
}

export class SummaryService extends DBService {
  summaryRepository: SummaryRepository;
  surveyService: SurveyService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.summaryRepository = new SummaryRepository(connection);
    this.surveyService = new SurveyService(connection);
  }

  /**
   * Validates a summary submission file based on given summary submission ID and survey ID.
   * @param summarySubmissionId
   * @param surveyId
   * @return {Promise<void>}
   */
  async validateFile(summarySubmissionId: number, surveyId: number): Promise<void> {
    defaultLog.debug({ label: 'validateFile' });
    try {
      // First, prep XLSX
      const submissionPrep = await this.summaryTemplatePreparation(summarySubmissionId);

      // Next, validate the summary template
      await this.summaryTemplateValidation(submissionPrep.xlsx, surveyId, summarySubmissionId);
    } catch (error) {
      if (error instanceof SummarySubmissionError) {
        // If any summary submission parsing or file errors are thrown, persist them
        await this.insertSummarySubmissionError(summarySubmissionId, error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Update existing `survey_summary_submission` record with an S3 key.
   *
   * @param {number} submissionId
   * @param {string} key
   * @return {Promise<{ survey_summary_submission_id: number }>}
   */
  async updateSurveySummarySubmissionWithKey(
    summarySubmissionId: number,
    key: string
  ): Promise<{ survey_summary_submission_id: number }> {
    defaultLog.debug({ label: 'updateSurveySummarySubmissionWithKey' });
    return this.summaryRepository.updateSurveySummarySubmissionWithKey(summarySubmissionId, key);
  }

  /**
   * Inserts a new record into the `survey_summary_submission` table.
   *
   * @param {number} surveyId
   * @param {string} source
   * @param {string} file_name
   * @return {Promise<{ survey_summary_submission_id: number }>}
   */
  async insertSurveySummarySubmission(
    surveyId: number,
    source: string,
    file_name: string
  ): Promise<{ survey_summary_submission_id: number }> {
    defaultLog.debug({ label: 'insertSurveySummarySubmission' });
    return this.summaryRepository.insertSurveySummarySubmission(surveyId, source, file_name);
  }

  /**
   * Soft deletes the summary submission entry by ID
   *
   * @param {number} summarySubmissionId
   * @returns {Promise<number | null>} row count if delete is successful, null otherwise.
   */
  async deleteSummarySubmission(summarySubmissionId: number): Promise<number | null> {
    return this.summaryRepository.deleteSummarySubmission(summarySubmissionId);
  }

  /**
   * Upload scraped summary submission data.
   *
   * TODO: Remove this and all related "scraping" code for summary submissions? I don't think we plan to scrape
   * summary report submissions anymore. I don't think the "survey_summary_detail" table exists anymore.
   *
   * @param {number} summarySubmissionId
   * @param {any} scrapedSummaryDetail
   * @return {Promise<{ survey_summary_detail_id: number }>}
   */
  async uploadScrapedSummarySubmission(
    summarySubmissionId: number,
    scrapedSummaryDetail: PostSummaryDetails
  ): Promise<{ survey_summary_detail_id: number }> {
    return this.summaryRepository.insertSurveySummaryDetails(summarySubmissionId, scrapedSummaryDetail);
  }

  /**
   * Gets the list of messages for a summary submission.
   *
   * @param {number} summarySubmissionId
   * @returns {*} {Promise<ISummarySubmissionMessagesResponse[]>}
   */
  async getSummarySubmissionMessages(summarySubmissionId: number): Promise<ISummarySubmissionMessagesResponse[]> {
    return this.summaryRepository.getSummarySubmissionMessages(summarySubmissionId);
  }

  /**
   * Gets the record for a single summary submission.
   *
   * @param {number} surveyId
   * @returns {Promise<ISurveySummaryDetails>}
   */
  async findSummarySubmissionById(summarySubmissionId: number): Promise<ISummarySubmissionResponse> {
    return this.summaryRepository.findSummarySubmissionById(summarySubmissionId);
  }

  /**
   * Gets latest summary submission for a survey.
   *
   * @param {number} surveyId
   * @returns {Promise<ISurveySummaryDetails>}
   */
  async getLatestSurveySummarySubmission(surveyId: number): Promise<ISurveySummaryDetails | undefined> {
    return this.summaryRepository.getLatestSurveySummarySubmission(surveyId);
  }

  /**
   * Prepares a summary template submission
   * @param summarySubmissionId
   * @returns {Promise<{ s3InputKey: string; xlsx: XLSXCSV }>}
   */
  async summaryTemplatePreparation(summarySubmissionId: number): Promise<{ s3InputKey: string; xlsx: XLSXCSV }> {
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
   * Retrieves template validation schema for the given XLSX file and survey, and validates the
   * XLSX. If a summary submission ID is given, details about template validation schema selection
   * are logged.
   * @param {XLSXCSV} xlsx
   * @param {number} surveyId
   * @param {number} [summarySubmissionId]
   */
  async summaryTemplateValidation(xlsx: XLSXCSV, surveyId: number, summarySubmissionId?: number) {
    defaultLog.debug({ label: 'summaryTemplateValidation', data: { surveyId, summarySubmissionId } });
    try {
      const summaryTemplateSpeciesRecords = await this.getSummaryTemplateSpeciesRecords(xlsx, surveyId);

      // In the absence of hard requirements for selecting validation schema in the case when focal species matching
      // yields many validation schema, we select the first resulting validation schema.
      const templateRecord = summaryTemplateSpeciesRecords[0];
      const validationSchema = templateRecord?.validation;

      // If no validation schema is found, throw an error and abort validation.
      if (!validationSchema) {
        throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES);
      }

      // If summarySubmissionId is given, log the particular validation schema that was found.
      if (summarySubmissionId) {
        const { summary_template_species_id } = templateRecord;
        const count = summaryTemplateSpeciesRecords.length;
        await this.summaryRepository.insertSummarySubmissionMessage(
          summarySubmissionId,
          SUMMARY_SUBMISSION_MESSAGE_TYPE.FOUND_VALIDATION,
          `Found validation having summary template species ID '${summary_template_species_id}' among ${count} record(s).`
        );
      }

      const schemaParser = this.getValidationRules(validationSchema);
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
   * Prepares a file for validation.
   * @param {any} file
   * @returns {XLSXCSV}
   */
  prepXLSX(file: any): XLSXCSV {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });
    const parsedMedia = parseUnknownMedia(file);

    // TODO not sure how to trigger these through testing
    if (!parsedMedia) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    // TODO not sure how to trigger these through testing
    if (!(parsedMedia instanceof MediaFile)) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_XLSX_CSV);
    }

    const xlsxCsv = new XLSXCSV(parsedMedia);

    const sims_name = xlsxCsv.workbook.rawWorkbook.Custprops?.['sims_name'];
    const sims_version = xlsxCsv.workbook.rawWorkbook.Custprops?.['sims_version'];

    if (!sims_name || !sims_version) {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TEMPLATE_NAME_VERSION);
    }

    return xlsxCsv;
  }

  /**
   * Retrieves all summary template species records that are constrained by the template
   * name, version and survey focal species.
   * @param file
   * @param surveyId
   * @returns {Promise<ISummaryTemplateSpeciesData[]>}
   */
  async getSummaryTemplateSpeciesRecords(file: XLSXCSV, surveyId: number): Promise<ISummaryTemplateSpeciesData[]> {
    const speciesData = await this.surveyService.getSpeciesData(surveyId);

    // Summary template name and version
    const sims_name: string = file.workbook.rawWorkbook.Custprops?.['sims_name'];
    const sims_version: string = file.workbook.rawWorkbook.Custprops?.['sims_version'];
    defaultLog.debug({
      label: 'getSummaryTemplateSpeciesRecord',
      data: {
        surveyId,
        species: speciesData,
        sims_name,
        sims_version
      }
    });

    const speciesIds = speciesData.focal_species.map((species) => species.tsn);

    return this.summaryRepository.getSummaryTemplateSpeciesRecords(sims_name, sims_version, speciesIds);
  }

  /**
   * Retrieves validation rules for the given validation schema.
   *
   * @param {string | object} schema
   * @returns {ValidationSchemaParser}
   */
  getValidationRules(schema: string | object): ValidationSchemaParser {
    defaultLog.debug({ label: 'getValidationRules' });
    try {
      const validationSchemaParser = new ValidationSchemaParser(schema);
      return validationSchemaParser;
    } catch {
      throw SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_VALIDATION_SCHEMA);
    }
  }

  /**
   * Validates a given XLSX file.
   * @param {XLSXCSV} file
   * @param {ValidationSchemaParser} parser
   * @returns {ICsvMediaState}
   */
  validateXLSX(file: XLSXCSV, parser: ValidationSchemaParser): ICsvMediaState {
    defaultLog.debug({ label: 'validateXLSX' });

    // Run media validations
    file.validateMedia(parser);

    const media_state = file.getMediaState();
    if (!media_state.isValid) {
      return { csv_state: [], media_state };
    }

    // Run CSV content validations
    file.validateContent(parser);
    const csv_state = file.getContentState();

    return { csv_state, media_state };
  }

  /**
   * Persists summary template CSV validation results in the summary submission messages table.
   *
   * @param {ICsvState[]} csvState
   * @param {IMediaState} mediaState
   */
  async persistSummaryValidationResults(csvState: ICsvState[], mediaState: IMediaState): Promise<void> {
    defaultLog.debug({ label: 'persistSummaryValidationResults', message: 'validationResults' });

    const errors: MessageError<SUMMARY_SUBMISSION_MESSAGE_TYPE>[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      errors.push(
        new MessageError(
          SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA,
          `${fileError}`,
          SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA
        )
      );
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        errors.push(
          new MessageError(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
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

      csvStateItem.keyErrors?.forEach((keyError) => {
        errors.push(
          new MessageError(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
            this.generateKeyErrorMessage(csvStateItem.fileName, keyError),
            keyError.errorCode
          )
        );
      });
    });

    if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
      // At least 1 error exists, skip remaining steps
      throw new SummarySubmissionError({ messages: errors });
    }
  }

  /**
   * Inserts a message into the summary submission messages table.
   * @param {SummarySubmissionError} summarySubmissionId
   * @param {SummarySubmissionError} error
   * @return {Promise<void>}
   */
  async insertSummarySubmissionError(summarySubmissionId: number, error: SummarySubmissionError): Promise<void> {
    defaultLog.debug({ label: 'insertSummarySubmissionError', summarySubmissionId, error });
    const promises = error.summarySubmissionMessages.map((message) => {
      return this.summaryRepository.insertSummarySubmissionMessage(
        summarySubmissionId,
        message.type,
        message.description
      );
    });

    await Promise.all(promises);
  }

  /**
   * Generates error messages relating to CSV headers.
   *
   * @param fileName
   * @param headerError
   * @returns {string}
   */
  generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
    return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
  }

  /**
   * Generates error messages relating to CSV rows.
   *
   * @param fileName
   * @param rowError
   * @returns {string}
   */
  generateRowErrorMessage(fileName: string, rowError: IRowError): string {
    return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
  }

  /**
   * Generates error messages relating to CSV workbook keys.
   *
   * @param fileName
   * @param keyError
   * @returns {string}
   */
  generateKeyErrorMessage(fileName: string, keyError: IKeyError): string {
    return `${fileName} - ${keyError.message} - Rows: ${keyError.rows.join(', ')}`;
  }
}
