import { default as dayjs } from 'dayjs';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { ITelemetryAdvancedFilters } from '../models/telemetry-view';
import { SurveyCritterRecord } from '../repositories/survey-critter-repository';
import { Deployment, TelemetryRepository, TelemetrySubmissionRecord } from '../repositories/telemetry-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { parseS3File } from '../utils/media/media-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  IXLSXCSVValidator,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BctwService, IAllTelemetry, ICreateManualTelemetry, IDeploymentRecord } from './bctw-service';
import { CritterbaseService, ICritter, ICritterbaseUser } from './critterbase-service';
import { DBService } from './db-service';
import { SurveyCritterService } from './survey-critter-service';

export type IFindTelemetryResponse = { telemetry_id: string } & Pick<
  IAllTelemetry,
  'acquisition_date' | 'latitude' | 'longitude' | 'telemetry_type'
> &
  Pick<IDeploymentRecord, 'device_id'> &
  Pick<Deployment, 'bctw_deployment_id' | 'critter_id' | 'deployment_id'> &
  Pick<SurveyCritterRecord, 'critterbase_critter_id'> &
  Pick<ICritter, 'animal_id'>;

const telemetryCSVColumnValidator: IXLSXCSVValidator = {
  columnNames: ['DEVICE_ID', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'date', 'string', 'number', 'number'],
  columnAliases: {
    LATITUDE: ['LAT'],
    LONGITUDE: ['LON', 'LONG', 'LNG']
  }
};

export class TelemetryService extends DBService {
  telemetryRepository: TelemetryRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.telemetryRepository = new TelemetryRepository(connection);
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
    const submissionId = await this.telemetryRepository.getNextSubmissionId();
    const key = generateS3FileKey({ projectId, surveyId, submissionId, fileName: file.originalname });
    const result = await this.telemetryRepository.insertSurveyTelemetrySubmission(
      submissionId,
      key,
      surveyId,
      file.originalname
    );
    return { submission_id: result.survey_telemetry_submission_id, key };
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
      throw new ApiGeneralError(
        `Failed to process file for importing telemetry. Incorrect file type. Expected CSV received ${mediaFile.mimetype}`
      );
    }

    // step 5 construct workbook/ setup
    const xlsxWorkBook = constructXLSXWorkbook(mediaFile);
    // Get the default XLSX worksheet
    const xlsxWorksheet = getDefaultWorksheet(xlsxWorkBook);

    // step 6 validate columns
    if (!validateCsvFile(xlsxWorksheet, telemetryCSVColumnValidator)) {
      throw new ApiGeneralError('Failed to process file for importing telemetry. Invalid CSV file.');
    }

    const worksheetRowObjects = getWorksheetRowObjects(xlsxWorksheet);

    // step 7 fetch survey deployments
    const bctwService = new BctwService(user);
    const critterService = new SurveyCritterService(this.connection);

    const critters = await critterService.getCrittersInSurvey(submission.survey_id);
    const critterIds = critters.map((item) => item.critterbase_critter_id);

    const deployments = await bctwService.getDeploymentsByCritterId(critterIds);

    // step 8 parse file data and find deployment ids based on device id and attachment dates
    const itemsToAdd: ICreateManualTelemetry[] = [];
    worksheetRowObjects.forEach((row) => {
      const deviceId = Number(row['DEVICE_ID']);
      const start = row['DATE'];
      const time = row['TIME'];
      const dateTime = dayjs(`${start} ${time}`);

      const foundDeployment = deployments.find((item) => {
        const currentStart = dayjs(item.attachment_start);
        const currentEnd = dayjs(item.attachment_end);
        // check the device ids match
        if (item.device_id === deviceId) {
          // check the date is same or after the device deployment start date
          if (dateTime.isAfter(currentStart) || dateTime.isSame(currentStart)) {
            if (item.attachment_end) {
              // check if the date is same or before the device was removed
              if (dateTime.isBefore(currentEnd) || dateTime.isSame(currentEnd)) {
                return true;
              }
            } else {
              // no attachment end date means the device is still active and is a match
              return true;
            }
          }
        }
        return false;
      });

      if (foundDeployment) {
        itemsToAdd.push({
          deployment_id: foundDeployment.deployment_id,
          acquisition_date: dateTime.format('YYYY-MM-DD HH:mm:ss'),
          latitude: row['LATITUDE'],
          longitude: row['LONGITUDE']
        });
      } else {
        throw new ApiGeneralError(
          `No deployment was found for device: ${deviceId} on: ${dateTime.format('YYYY-MM-DD HH:mm:ss')}`
        );
      }
    });

    // step 9 create telemetries
    if (itemsToAdd.length > 0) {
      try {
        return bctwService.createManualTelemetry(itemsToAdd);
      } catch (error) {
        throw new ApiGeneralError('Error adding Manual Telemetry');
      }
    }

    return [];
  }

  async getTelemetrySubmissionById(submissionId: number): Promise<TelemetrySubmissionRecord> {
    return this.telemetryRepository.getTelemetrySubmissionById(submissionId);
  }

  /**
   * Get deployments for the given critter ids.
   *
   * Note: SIMS does not store deployment information, beyond an ID. Deployment details must be fetched from the
   * external BCTW API.
   *
   * @param {number[]} critterIds
   * @return {*}  {Promise<Deployment[]>}
   * @memberof TelemetryService
   */
  async getDeploymentsByCritterIds(critterIds: number[]): Promise<Deployment[]> {
    return this.telemetryRepository.getDeploymentsByCritterIds(critterIds);
  }

  /**
   * Retrieves the paginated list of all telemetry records that are available to the user, based on their permissions
   * and provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ITelemetryAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<IFindTelemetryResponse[]>}
   * @memberof TelemetryService
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: ITelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<IFindTelemetryResponse[]> {
    // --- Step 1 ------------------------------

    // Find all critters that the user has access to
    const surveyCritterService = new SurveyCritterService(this.connection);
    // The sims critter records the user has access to, based on their permissions and filter criteria
    const simsCritters = await surveyCritterService.findCritters(isUserAdmin, systemUserId, filterFields, pagination);

    if (!simsCritters.length) {
      // Exit early if there are no critters, and therefore no telemetry
      return [];
    }

    // --- Step 2 ------------------------------

    const simsCritterIds = simsCritters.map((critter) => critter.critter_id);
    // The sims deployment records for the critters the user has access to
    const simsDeployments = await this.telemetryRepository.getDeploymentsByCritterIds(simsCritterIds);

    if (!simsDeployments.length) {
      // Exit early if there are no deployments, and therefore no telemetry
      return [];
    }

    // --- Step 3 ------------------------------

    // The critterbase critter ids for the critters with deployments the user has access to
    const critterbaseCritterIds = simsCritters
      .filter((simsCritter) =>
        simsDeployments.some((surveyDeployment) => surveyDeployment.critter_id === simsCritter.critter_id)
      )
      .map((critter) => critter.critterbase_critter_id);

    const user: ICritterbaseUser = {
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    };

    // Get critter records from Critterbase
    const critterbaseService = new CritterbaseService(user);
    const critterbaseCritters = await critterbaseService.getMultipleCrittersByIdsDetailed(critterbaseCritterIds);

    // --- Step 4 ------------------------------

    const bctwService = new BctwService(user);
    // The detailed deployment records for the critters with deployments the user has access to
    const allBctwDeploymentsForCritters = await bctwService.getDeploymentsByCritterId(critterbaseCritterIds);

    const usersBctwDeployments = allBctwDeploymentsForCritters.filter((deployment) =>
      simsDeployments.some((item) => item.bctw_deployment_id === deployment.deployment_id)
    );
    const usersBctwDeploymentIds = usersBctwDeployments.map((deployment) => deployment.deployment_id);

    // --- Step 5 ------------------------------

    // The telemetry records for the deployments for the critters the user has access to
    const allTelemetryRecords = await bctwService.getAllTelemetryByDeploymentIds(usersBctwDeploymentIds);

    // --- Step 6 ------------------------------

    // Parse/combine the telemetry, deployment, and critter records into the final response
    const response: IFindTelemetryResponse[] = [];
    for (const telemetryRecord of allTelemetryRecords) {
      const bctwDeployment = usersBctwDeployments.find(
        (usersBctwDeployment) => usersBctwDeployment.deployment_id === telemetryRecord.deployment_id
      );

      if (!bctwDeployment) {
        continue;
      }

      const surveyDeployment = simsDeployments.find(
        (simsDeployment) => simsDeployment.bctw_deployment_id === telemetryRecord.deployment_id
      );

      if (!surveyDeployment) {
        continue;
      }

      const critterbaseCritter = critterbaseCritters.find(
        (critterbaseCritter) => critterbaseCritter.critter_id === bctwDeployment?.critter_id
      );

      if (!critterbaseCritter) {
        continue;
      }

      response.push({
        // IAllTelemetry
        telemetry_id: telemetryRecord.telemetry_id ?? telemetryRecord.telemetry_manual_id,
        acquisition_date: telemetryRecord.acquisition_date,
        latitude: telemetryRecord.latitude,
        longitude: telemetryRecord.longitude,
        telemetry_type: telemetryRecord.telemetry_type,
        // IDeploymentRecord
        device_id: bctwDeployment.device_id,
        // Deployment
        bctw_deployment_id: telemetryRecord.deployment_id,
        critter_id: surveyDeployment.critter_id,
        deployment_id: surveyDeployment.deployment_id,
        // SurveyCritterRecord
        critterbase_critter_id: bctwDeployment.critter_id,
        // ICritter
        animal_id: critterbaseCritter.animal_id
      });
    }

    return response;
  }
}
