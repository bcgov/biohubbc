import xlsx from 'xlsx';
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
import { CSVWorkBook } from '../utils/media/csv/csv-file';
import { MediaFile } from '../utils/media/media-file';
import { parseS3File } from '../utils/media/media-utils';
import { DBService } from './db-service';

const defaultLog = getLogger('services/observation-service');

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

    // TODO perform validation on columns

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
      projectId,
      surveyId,
      submissionId,
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

  /**
   * Processes a observation upload submission. This method recieves an ID belonging to an
   * observation submission, gets the CSV file associated with the submisison, and appends
   * all of the records in the CSV file to the observations for the survey. If the CSV
   * file fails validation, this method fails.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async processObservationCsvSubmission(submissionId: number): Promise<ObservationRecord[]> {
    defaultLog.debug({ label: 'processObservationCsvSubmission', submissionId });

    // Step 1. Retrieve the observation submission record
    const submission = await this.getObservationSubmissionById(submissionId);
    const surveyId = submission.survey_id;

    // Step 2. Retrieve the S3 object containing the uploaded CSV file
    const s3Object = await getFileFromS3(submission.key);

    // Step 3. Get the contents of the S3 object
    const mediaFile = parseS3File(s3Object);

    // Step 4. Validate the CSV
    if (!this.validateCsvFile(mediaFile)) {
      throw new Error('Failed to process file for importing observations. Invalid CSV file.');
    }

    // Step 5. Merge all the table rows into an array of ObservationInsert[]
    const workbook = new CSVWorkBook(xlsx.read(mediaFile.buffer, { cellDates: true, cellNF: true, cellHTML: false }));
    const worksheet = Object.values(workbook.worksheets)[0];

    const insertRows: InsertObservation[] = worksheet.getRowObjects().map((row) => ({
      survey_id: surveyId,
      wldtaxonomic_units_id: row['SPECIES_TAXONOMIC_ID'],
      survey_sample_site_id: null,
      survey_sample_method_id: null,
      survey_sample_period_id: null,
      latitude: row['LATITUDE'],
      longitude: row['LONGITUDE'],
      count: row['COUNT'],
      observation_time: row['TIME'],
      observation_date: row['DATE']
    }));

    // Step 6. Insert new rows and return them
    return this.insertUpdateDeleteSurveyObservations(surveyId, insertRows);
  }
}
