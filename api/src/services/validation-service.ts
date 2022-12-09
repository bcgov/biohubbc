import AdmZip from 'adm-zip';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { SubmissionRepository } from '../repositories/submission-repository';
import { ITemplateMethodologyData, ValidationRepository } from '../repositories/validation-repository';
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
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/validation-service');

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
  surveyService: SurveyService;
  occurrenceService: OccurrenceService;
  errorService: ErrorService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.validationRepository = new ValidationRepository(connection);
    this.submissionRepository = new SubmissionRepository(connection);
    this.surveyService = new SurveyService(connection);
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

  async transformFile(submissionId: number, surveyId: number) {
    try {
      const submissionPrep = await this.templatePreparation(submissionId);
      await this.templateTransformation(submissionId, submissionPrep.xlsx, submissionPrep.s3InputKey, surveyId);

      // insert template validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async validateFile(submissionId: number, surveyId: number) {
    try {
      const submissionPrep = await this.templatePreparation(submissionId);
      await this.templateValidation(submissionPrep.xlsx, surveyId);

      // insert template validated status
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
      const dwcPrep = await this.dwcPreparation(submissionId);
      // validate dwc
      const csvState = this.validateDWC(dwcPrep.archive);
      // update submission
      await this.persistValidationResults(csvState.csv_state, csvState.media_state);

      await this.occurrenceService.updateSurveyOccurrenceSubmission(
        submissionId,
        dwcPrep.archive.rawFile.fileName,
        dwcPrep.s3InputKey
      );

      // insert validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);

      // Parse Archive into JSON file for custom validation
      await this.parseDWCToJSON(submissionId, dwcPrep.archive);

      await this.templateScrapeAndUploadOccurrences(submissionId);
    } catch (error) {
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  async processFile(submissionId: number, surveyId: number) {
    try {
      // template preparation
      const submissionPrep = await this.templatePreparation(submissionId);

      // template validation
      await this.templateValidation(submissionPrep.xlsx, surveyId);

      // insert template validated status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);

      // template transformation
      await this.templateTransformation(submissionId, submissionPrep.xlsx, submissionPrep.s3InputKey, surveyId);

      // insert template transformed status
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

      return csvState;
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
      }
      throw error;
    }
  }

  async dwcPreparation(submissionId: number): Promise<{ archive: DWCArchive; s3InputKey: string }> {
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

  async templatePreparation(submissionId: number): Promise<{ s3InputKey: string; xlsx: XLSXCSV }> {
    try {
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

  async templateScrapeAndUploadOccurrences(submissionId: number) {
    try {
      const occurrenceSubmission = await this.occurrenceService.getOccurrenceSubmission(submissionId);
      const s3OutputKey = occurrenceSubmission.output_key;
      const s3File = await getFileFromS3(s3OutputKey);
      const archive = this.prepDWCArchive(s3File);
      await this.occurrenceService.scrapeAndUploadOccurrences(submissionId, archive);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
      }
      throw error;
    }
  }

  async templateValidation(xlsx: XLSXCSV, surveyId: number) {
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

  async templateTransformation(submissionId: number, xlsx: XLSXCSV, s3InputKey: string, surveyId: number) {
    try {
      const xlsxSchema = await this.getTransformationSchema(xlsx, surveyId);
      const xlsxParser = this.getTransformationRules(xlsxSchema);
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

    // not sure how to trigger these through testing
    if (!parsedMedia) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    // not sure how to trigger these through testing
    if (!(parsedMedia instanceof MediaFile)) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const xlsxCsv = new XLSXCSV(parsedMedia);

    const templateName = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_name;
    const templateVersion = xlsxCsv.workbook.rawWorkbook.Custprops?.sims_version;

    if (!templateName || !templateVersion) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA);
    }

    return xlsxCsv;
  }

  async getTemplateMethodologySpeciesRecord(file: XLSXCSV, surveyId: number): Promise<ITemplateMethodologyData> {
    const templateName = file.workbook.rawWorkbook.Custprops.sims_name;
    const templateVersion = file.workbook.rawWorkbook.Custprops.sims_version;

    const surveyData = await this.surveyService.getSurveyById(surveyId);

    const surveyFieldMethodId = surveyData.purpose_and_methodology.field_method_id;
    const surveySpecies = surveyData.species.focal_species;

    return this.validationRepository.getTemplateMethodologySpeciesRecord(
      templateName,
      templateVersion,
      surveyFieldMethodId,
      surveySpecies
    );
  }

  async getValidationSchema(file: XLSXCSV, surveyId: number): Promise<any> {
    const templateMethodologySpeciesRecord = await this.getTemplateMethodologySpeciesRecord(file, surveyId);

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

    const csvState: ICsvState[] = [
      ...file.isWorkbookValid(parser),
      ...file.isContentValid(parser)
    ];

    return {
      csv_state: csvState,
      media_state: mediaState
    } as ICsvMediaState;
  }

  /**
   * Return normalized dwca file data
   *
   * @param {DWCArchive} dwcArchiveFile
   * @return {*}  {string}
   * @memberof DarwinCoreService
   */
  normalizeDWCArchive(dwcArchiveFile: DWCArchive): string {
    const normalized = {};

    Object.entries(dwcArchiveFile.worksheets).forEach(([key, value]) => {
      if (value) {
        normalized[key] = value.getRowObjects();
      }
    });

    return JSON.stringify(normalized);
  }

  async parseDWCToJSON(submissionId: number, archive: DWCArchive) {
    const json = this.normalizeDWCArchive(archive);
    await this.occurrenceService.updateDWCSourceForOccurrenceSubmission(submissionId, json);
  }

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

  async getTransformationSchema(file: XLSXCSV, surveyId: number): Promise<any> {
    const templateMethodologySpeciesRecord = await this.getTemplateMethodologySpeciesRecord(file, surveyId);

    const transformationSchema = templateMethodologySpeciesRecord?.transform;
    if (!transformationSchema) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES);
    }

    return transformationSchema;
  }

  // does this need a new error? could be an issue if we aren't maintaining things here
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

    // insert template validated status
    await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);
  }

  prepDWCArchive(s3File: any): DWCArchive {
    defaultLog.debug({ label: 'prepDWCArchive', message: 's3File' });

    const parsedMedia = parseUnknownMedia(s3File);
    if (!parsedMedia) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    if (!(parsedMedia instanceof ArchiveFile)) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
    }

    const dwcArchive = new DWCArchive(parsedMedia);
    return dwcArchive;
  }

  validateDWCArchive(dwc: DWCArchive, parser: ValidationSchemaParser): ICsvMediaState {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'dwcArchive' });
    const mediaState = dwc.isMediaValid(parser);
    if (!mediaState.isValid) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    const csvState: ICsvState[] = [
      ...dwc.isWorkbookValid(parser),
      ...dwc.isContentValid(parser)
    ];

    return {
      csv_state: csvState,
      media_state: mediaState
    };
  }

  generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
    return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
  }

  generateRowErrorMessage(fileName: string, rowError: IRowError): string {
    return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
  }
}
