import { IDBConnection } from '../database/db';
import { TelemetryRepository, TelemetrySubmissionRecord } from '../repositories/telemetry-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { parseS3File } from '../utils/media/media-utils';
import {
  constructWorksheets,
  constructXLSXWorkbook,
  getWorksheetRowObjects,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { BctwService } from './bctw-service';
import { ICritterbaseUser } from './critterbase-service';
import { DBService } from './db-service';
import { SurveyCritterService } from './survey-critter-service';

const telemetryCSVColumnValidator = {
  columnNames: ['DEVICE_ID', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'date', 'string', 'number', 'number']
};

export class TelemetryService extends DBService {
  repository: TelemetryRepository;
  constructor(connection: IDBConnection) {
    super(connection);
    this.repository = new TelemetryRepository(connection);
  }

  /**
   *
   * Inserts a survey telemetry submission record into the database and returns the key
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof ObservationService
   */
  async insertSurveyTelemetrySubmission(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number
  ): Promise<{ submission_id: number; key: string }> {
    const submissionId = await this.repository.getNextSubmissionId();
    const key = generateS3FileKey({ projectId, surveyId, submissionId, fileName: file.originalname });
    const result = await this.repository.insertSurveyTelemetrySubmission(
      submissionId,
      key,
      surveyId,
      file.originalname
    );
    return { submission_id: result.submission_id, key };
  }

  async processTelemetryCsvSubmission(submissionId: number, user: ICritterbaseUser): Promise<any[]> {
    // step 1 get submission record
    const submission = await this.getTelemetrySubmissionById(submissionId);

    // step 2 get s3 record for given key
    const s3Object = await getFileFromS3(submission.key);

    // step 3 parse the file
    const mediaFile = parseS3File(s3Object);

    // step 4 validate csv
    if (mediaFile.mimetype !== 'text/csv') {
      throw new Error(
        'Failed to process file for importing telemetry. Incorrect file type. Expected CSV received ' +
          mediaFile.mimetype
      );
    }

    // step 5 construct workbook/ setup
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);
    const xlsxWorksheets = constructWorksheets(xlsxWorkBook);

    // step 6 validate columns
    if (validateCsvFile(xlsxWorksheets, telemetryCSVColumnValidator)) {
      throw new Error('Failed to process file for importing telemetry. Invalid CSV file.');
    }

    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheets['Sheet1']);

    // step 7 fetch survey deployments
    const bctwService = new BctwService(user);
    const critterService = new SurveyCritterService(this.connection);

    const critters = await critterService.getCrittersInSurvey(submission.survey_id);
    const critterIds = critters.map((item) => item.critterbase_critter_id);

    const deployments = await bctwService.getDeploymentsByCritterId(critterIds);

    await bctwService.createManualTelemetry([]);

    // step 8 create dictionary of deployments (alias-device_id)
    // step 9 map data from csv/ dictionary into telemetry records
    // step 10 send to telemetry service api
    return [];
  }

  async getTelemetrySubmissionById(submissionId: number): Promise<TelemetrySubmissionRecord> {
    return this.repository.getTelemetrySubmissionById(submissionId);
  }
}
