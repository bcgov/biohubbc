import { IDBConnection } from '../database/db';
import {
  InsertObservation,
  ObservationRecord,
  ObservationRepository,
  ObservationSubmissionRecord,
  UpdateObservation
} from '../repositories/observation-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { MediaFile } from '../utils/media/media-file';
import { parseS3File } from '../utils/media/media-utils';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { DBService } from './db-service';

const defaultLog = getLogger('services/observation-queries');

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * Checks if the given media file is valid for importing observations. Returns
   * `true` if the given file is valid, `false` otherwise.
   *
   * @param {MediaFile} file
   * @return {*}  {boolean}
   * @memberof ObservationService
   */
  validateCsvFile(file: MediaFile): boolean {
    if (file.mimetype !== 'text/csv') {
      return false;
    }

    const xlsxCSV = new XLSXCSV(file);
    console.log('xlsxCSV.workbook', xlsxCSV.workbook);

    return true;
  }

  /**
   * Performs an upsert for all observation records belonging to the given survey, while removing
   * any records associated for the survey that aren't included in the given records, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async insertUpdateDeleteSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    const retainedObservationIds = observations
      .filter((observation): observation is UpdateObservation => {
        return 'survey_observation_id' in observation && Boolean(observation.survey_observation_id);
      })
      .map((observation) => observation.survey_observation_id);

    await this.observationRepository.deleteObservationsNotInArray(surveyId, retainedObservationIds);

    return this.observationRepository.insertUpdateSurveyObservations(surveyId, observations);
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async getSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    return this.observationRepository.getSurveyObservations(surveyId);
  }

  /**
   * Inserts a survey observation submission record into the database and returns the key
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof ObservationService
   */
  async insertSurveyObservationSubmission(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number
  ): Promise<{ submission_id: number; key: string }> {
    const submissionId = await this.observationRepository.getNextSubmissionId();

    const key = generateS3FileKey({
      projectId: projectId,
      surveyId: surveyId,
      submissionId: submissionId,
      fileName: file.originalname
    });

    const insertResult = await this.observationRepository.insertSurveyObservationSubmission(
      submissionId,
      key,
      surveyId,
      file.originalname
    );

    return { submission_id: insertResult.submission_id, key };
  }

  /**
   * Retrieves the observation submission record by the given submission ID.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationService
   */
  async getObservationSubmissionById(submissionId: number): Promise<ObservationSubmissionRecord> {
    return this.observationRepository.getObservationSubmissionById(submissionId);
  }

  async processObservationCsvSubmission(submissionId: number) {
    defaultLog.debug({ label: 'processObservationCsvSubmission', submissionId });

    // Step 1. Retrieve the observation submission record
    const submission = await this.getObservationSubmissionById(submissionId);
    console.log('submission', submission);

    // Step 2. Retrieve the S3 object containing the uploaded CSV file
    const s3Object = await getFileFromS3(submission.key);
    console.log('s3Object', s3Object);

    // Step 3. Get the contents of the S3 object
    const csvFile = parseS3File(s3Object);
    console.log('csvFile', csvFile);

    if (!this.validateCsvFile(csvFile)) {
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Step 4. Validate the CSV

    // Step 5. Merge all the table rows into an array of ObservationInsert[]

    // Step 6.
    // this.insertUpdateDeleteSurveyObservations(surveyId, theProcessedRows)
    return csvFile.fileName;
  }
}
