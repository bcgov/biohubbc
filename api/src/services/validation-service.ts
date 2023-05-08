import AdmZip from 'adm-zip';
import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { SubmissionRepository } from '../repositories/submission-repository';
import { ITemplateMethodologyData, ValidationRepository } from '../repositories/validation-repository';
import { getFileFromS3, uploadBufferToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { ICsvState, IHeaderError, IKeyError, IRowError } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { XLSXTransform } from '../utils/media/xlsx/transformation/xlsx-transform';
import { TransformSchema } from '../utils/media/xlsx/transformation/xlsx-transform-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { MessageError, SubmissionError, SubmissionErrorFromMessageType } from '../utils/submission-error';
import { DBService } from './db-service';
import { DwCService } from './dwc-service';
import { ErrorService } from './error-service';
import { OccurrenceService } from './occurrence-service';
import { SpatialService } from './spatial-service';
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
  spatialService: SpatialService;
  dwCService: DwCService;
  errorService: ErrorService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.validationRepository = new ValidationRepository(connection);
    this.submissionRepository = new SubmissionRepository(connection);
    this.surveyService = new SurveyService(connection);
    this.occurrenceService = new OccurrenceService(connection);
    this.spatialService = new SpatialService(connection);
    this.dwCService = new DwCService(connection);
    this.errorService = new ErrorService(connection);
  }

  async transformFile(submissionId: number, surveyId: number) {
    defaultLog.debug({ label: 'transformFile', submissionId, surveyId });
    try {
      const submissionPrep = await this.templatePreparation(submissionId);
      await this.templateTransformation(submissionPrep.xlsx, surveyId);

      // insert template transformed status
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
    defaultLog.debug({ label: 'validateFile', submissionId, surveyId });
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

  /**
   * Process a DwCA file.
   *
   * @param {number} submissionId
   * @memberof ValidationService
   */
  async processDWCFile(submissionId: number) {
    defaultLog.debug({ label: 'processDWCFile', submissionId });
    try {
      // Prepare DwC
      const dwcPrep = await this.dwcPreparation(submissionId);

      // Run DwC validations
      const csvState = this.validateDWC(dwcPrep.archive);

      // Insert results of validation
      await this.persistValidationResults(csvState.csv_state, csvState.media_state);

      // Insert validation complete status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);

      // Normalize DwC source
      const normalizedDWC = this.normalizeDWCArchive(dwcPrep.archive);

      // Apply decorations to DwC
      const decoratedDWC = await this.dwCService.decorateDwCJSON(normalizedDWC);

      await this.occurrenceService.updateDWCSourceForOccurrenceSubmission(submissionId, JSON.stringify(decoratedDWC));

      // Run transforms to create and insert spatial components
      await this.scrapeDwCAndUploadOccurrences(submissionId);

      const workbookBuffer = this.createWorkbookFromJSON(decoratedDWC);

      const { outputFileName, s3OutputKey } = await this.uploadDwCWorkbookToS3(
        submissionId,
        workbookBuffer,
        dwcPrep.s3InputKey,
        dwcPrep.archive
      );

      // Update occurrence submission with output filename and key
      await this.occurrenceService.updateSurveyOccurrenceSubmissionWithOutputKey(
        submissionId,
        outputFileName,
        s3OutputKey
      );
    } catch (error) {
      defaultLog.debug({ label: 'processDWCFile', message: 'error', error });
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Process an XLSX file.
   *
   * @param {number} submissionId
   * @param {number} surveyId
   * @memberof ValidationService
   */
  async processXLSXFile(submissionId: number, surveyId: number) {
    defaultLog.debug({ label: 'processXLSXFile', submissionId, surveyId });
    try {
      // Prepare template
      const submissionPrep = await this.templatePreparation(submissionId);

      // Run template validations
      await this.templateValidation(submissionPrep.xlsx, surveyId);

      // Insert validation complete status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED);

      // Run template transformations
      const transformedObject = await this.templateTransformation(submissionPrep.xlsx, surveyId);

      // Insert transformation complete status
      await this.submissionRepository.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED);

      // Apply decorations to DwC
      const decoratedDWC = await this.dwCService.decorateDwCJSON(transformedObject);

      await this.occurrenceService.updateDWCSourceForOccurrenceSubmission(submissionId, JSON.stringify(decoratedDWC));

      // Run transforms to create and insert spatial components
      await this.scrapeDwCAndUploadOccurrences(submissionId);

      const workbookBuffer = this.createWorkbookFromJSON(decoratedDWC);

      const { outputFileName, s3OutputKey } = await this.uploadDwCWorkbookToS3(
        submissionId,
        workbookBuffer,
        submissionPrep.s3InputKey,
        submissionPrep.xlsx
      );

      // Update occurrence submission with output filename and key
      await this.occurrenceService.updateSurveyOccurrenceSubmissionWithOutputKey(
        submissionId,
        outputFileName,
        s3OutputKey
      );
    } catch (error) {
      defaultLog.debug({ label: 'processXLSXFile', message: 'error', error });
      if (error instanceof SubmissionError) {
        await this.errorService.insertSubmissionError(submissionId, error);
      } else {
        throw error;
      }
    }
  }

  validateDWC(archive: DWCArchive): ICsvMediaState {
    defaultLog.debug({ label: 'validateDWC' });
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
    defaultLog.debug({ label: 'dwcPreparation', submissionId });
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
    defaultLog.debug({ label: 'templatePreparation', submissionId });
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

  async scrapeDwCAndUploadOccurrences(submissionId: number) {
    defaultLog.debug({ label: 'scrapeDwCAndUploadOccurrences', submissionId });
    try {
      await this.spatialService.runSpatialTransforms(submissionId);
    } catch (error) {
      if (error instanceof SubmissionError) {
        error.setStatus(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
      }
      throw error;
    }
  }

  async templateValidation(xlsx: XLSXCSV, surveyId: number) {
    defaultLog.debug({ label: 'templateValidation' });
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

  async templateTransformation(xlsx: XLSXCSV, surveyId: number) {
    defaultLog.debug({ label: 'templateTransformation' });
    try {
      const xlsxSchema = await this.getTransformationSchema(xlsx, surveyId);

      return this.transformXLSX(xlsx.workbook.rawWorkbook, xlsxSchema);
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

    const templateName = xlsxCsv.workbook.rawWorkbook.Custprops?.['sims_name'];
    const templateVersion = xlsxCsv.workbook.rawWorkbook.Custprops?.['sims_version'];

    defaultLog.debug({
      label: 'prepXLSX',
      message: 'template properties',
      sims_name: templateName,
      sims_version: templateVersion
    });

    if (!templateName || !templateVersion) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA);
    }

    return xlsxCsv;
  }

  async getTemplateMethodologySpeciesRecord(file: XLSXCSV, surveyId: number): Promise<ITemplateMethodologyData> {
    const templateName = file.workbook.rawWorkbook.Custprops?.['sims_name'];
    const templateVersion = file.workbook.rawWorkbook.Custprops?.['sims_version'];

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

  getValidationRules(schema: any): ValidationSchemaParser {
    const validationSchemaParser = new ValidationSchemaParser(schema);
    return validationSchemaParser;
  }

  validateXLSX(file: XLSXCSV, parser: ValidationSchemaParser) {
    defaultLog.debug({ label: 'validateXLSX' });
    file.validateMedia(parser);

    const media_state = file.getMediaState();

    if (!media_state.isValid) {
      return {
        csv_state: [],
        media_state
      };
    }

    file.validateContent(parser);
    const csv_state = file.getContentState();

    return { csv_state, media_state };
  }

  /**
   * Return normalized DwCA data
   *
   * @param {DWCArchive} dwcArchiveFile
   * @return {*}  {Record<string, Record<string, any>[]>}
   * @memberof DarwinCoreService
   */
  normalizeDWCArchive(dwcArchiveFile: DWCArchive): Record<string, Record<string, any>[]> {
    const normalized: Record<string, Record<string, any>[]> = {};

    Object.entries(dwcArchiveFile.worksheets).forEach(([worksheetName, worksheet]) => {
      if (worksheet) {
        normalized[worksheetName] = worksheet.getRowObjects();
      }
    });

    return normalized;
  }

  async persistValidationResults(csvState: ICsvState[], mediaState: IMediaState): Promise<void> {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    const errors: MessageError[] = [];

    mediaState.fileErrors?.forEach((fileError) => {
      errors.push(
        new MessageError(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA, `${fileError}`, SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA)
      );
    });

    csvState?.forEach((csvStateItem) => {
      csvStateItem.headerErrors?.forEach((headerError) => {
        errors.push(
          new MessageError(
            headerError.errorCode,
            this.generateHeaderErrorMessage(csvStateItem.fileName, headerError),
            headerError.errorCode
          )
        );
      });

      csvStateItem.rowErrors?.forEach((rowError) => {
        errors.push(
          new MessageError(
            rowError.errorCode,
            this.generateRowErrorMessage(csvStateItem.fileName, rowError),
            rowError.errorCode
          )
        );
      });

      csvStateItem.keyErrors?.forEach((keyError) => {
        errors.push(
          new MessageError(
            keyError.errorCode,
            this.generateKeyErrorMessage(csvStateItem.fileName, keyError),
            keyError.errorCode
          )
        );
      });
    });

    if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
      // At least 1 error exists, skip remaining steps
      throw new SubmissionError({ messages: errors });
    }
  }

  async getTransformationSchema(file: XLSXCSV, surveyId: number): Promise<TransformSchema> {
    const templateMethodologySpeciesRecord = await this.getTemplateMethodologySpeciesRecord(file, surveyId);

    const transformationSchema = templateMethodologySpeciesRecord?.transform;

    if (!transformationSchema) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES);
    }

    return transformationSchema;
  }

  transformXLSX(workbook: xlsx.WorkBook, transformSchema: TransformSchema): Record<string, Record<string, string>[]> {
    const xlsxTransform = new XLSXTransform(workbook, transformSchema);

    return xlsxTransform.start();
  }

  createWorkbookFromJSON(preparedRowObjectsForJSONToSheet: Record<string, Record<string, string>[]>): IFileBuffer[] {
    const dwcWorkbook = xlsx.utils.book_new();
    return Object.entries(preparedRowObjectsForJSONToSheet).map(([key, value]) => {
      const worksheet = xlsx.utils.json_to_sheet(value);

      const newWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
      xlsx.utils.book_append_sheet(dwcWorkbook, worksheet, key);

      const buffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' });

      return {
        name: key,
        buffer
      } as IFileBuffer;
    });
  }

  async uploadDwCWorkbookToS3(
    submissionId: number,
    fileBuffers: IFileBuffer[],
    s3InputKey: string,
    data: XLSXCSV | DWCArchive
  ) {
    defaultLog.debug({
      label: 'uploadDwCWorkbookToS3',
      submissionId,
      s3InputKey
    });

    // Build the archive zip file
    const dwcArchiveZip = new AdmZip();
    fileBuffers.forEach((file) => dwcArchiveZip.addFile(`${file.name}.csv`, file.buffer));

    // Remove the filename from original s3Key
    // Example: project/1/survey/1/submission/file_name.txt -> project/1/survey/1/submission
    const s3OutputKeyPrefix = s3InputKey.split('/').slice(0, -1).join('/');

    const outputFileName = `${data.rawFile.name}_dwc.zip`;
    const s3OutputKey = `${s3OutputKeyPrefix}/${outputFileName}`;

    // Upload transformed archive to s3
    await uploadBufferToS3(dwcArchiveZip.toBuffer(), 'application/zip', s3OutputKey);

    return { outputFileName, s3OutputKey };
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

    // Run DwC media validations
    dwc.validateMedia(parser);

    const media_state = dwc.getMediaState();
    if (!media_state.isValid) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
    }

    // Run DwC content validations
    dwc.validateContent(parser);
    const csv_state = dwc.getContentState();

    return { csv_state, media_state };
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
