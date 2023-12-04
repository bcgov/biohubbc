import { IDBConnection } from '../database/db';
import { TelemetryRepository } from '../repositories/telemetry-repository';
import { generateS3FileKey } from '../utils/file-utils';
import { DBService } from './db-service';

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

  async processTelemetryCsvSubmission(submissionId: number): Promise<any[]> {
    // step 1 get record
    // step 2 get s3 record for given key
    // step 3 parse the file
    // step 4 validate csv
    // step 5 construct workbook/ setup
    // step 6 validate columns
    // step 7 fetch survey deployments
    // step 8 create dictionary of deployments (alias-device_id)
    // step 9 map data from csv/ dictionary into telemetry records
    // step 10 send to telemetry service api
    return [];
  }
}
