import { default as dayjs } from 'dayjs';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { IAllTelemetryAdvancedFilters } from '../models/telemetry-view';
import { SurveyCritterRecord } from '../repositories/survey-critter-repository';
import { Deployment, TelemetryRepository, TelemetrySubmissionRecord } from '../repositories/telemetry-repository';
import { generateS3FileKey, getFileFromS3 } from '../utils/file-utils';
import { parseS3File } from '../utils/media/media-utils';
import {
  IXLSXCSVValidator,
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../utils/xlsx-utils/worksheet-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BctwDeploymentService } from './bctw-service/bctw-deployment-service';
import {
  BctwTelemetryService,
  IAllTelemetry,
  ICreateManualTelemetry,
  IDeploymentRecord
} from './bctw-service/bctw-telemetry-service';
import { ICritter, ICritterbaseUser } from './critterbase-service';
import { DBService } from './db-service';
import { DeploymentService } from './deployment-service';
import { SurveyCritterService } from './survey-critter-service';

export type FindTelemetryResponse = { telemetry_id: string } & Pick<
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
    const mediaFile = await parseS3File(s3Object);

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
    const deploymentService = new DeploymentService(this.connection);
    const bctwDeploymentService = new BctwDeploymentService(user);

    const surveyDeployments = await deploymentService.getDeploymentsForSurveyId(submission.survey_id);
    const deployments = await bctwDeploymentService.getDeploymentsByIds(
      surveyDeployments.map((deployment) => deployment.bctw_deployment_id)
    );

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

    const bctwTelemetryService = new BctwTelemetryService(user);

    if (itemsToAdd.length > 0) {
      try {
        return bctwTelemetryService.createManualTelemetry(itemsToAdd);
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
   * @param {IAllTelemetryAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindTelemetryResponse[]>}
   * @memberof TelemetryService
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAllTelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindTelemetryResponse[]> {
    // --- Step 1 -----------------------------

    const surveyCritterService = new SurveyCritterService(this.connection);
    // The SIMS critter records the user has access to
    const simsCritters = await surveyCritterService.findCritters(
      isUserAdmin,
      systemUserId,
      filterFields,
      // Remove the sort and order from the pagination object as these are based on the telemetry sort columns and
      // may not be valid for the critter columns
      // TODO: Is there a better way to achieve this pagination safety?
      pagination
        ? {
            ...pagination,
            sort: undefined,
            order: undefined
          }
        : undefined
    );

    if (!simsCritters.length) {
      // Exit early if there are no SIMS critters, and therefore no telemetry
      return [];
    }

    // --- Step 2 ------------------------------

    const simsCritterIds = simsCritters.map((critter) => critter.critter_id);
    // The sims deployment records the user has access to
    const simsDeployments = await this.telemetryRepository.getDeploymentsByCritterIds(simsCritterIds);

    if (!simsDeployments.length) {
      // Exit early if there are no SIMS deployments, and therefore no telemetry
      return [];
    }

    // --- Step 3 ------------------------------

    const critterbaseCritterIds = simsCritters
      .filter((simsCritter) =>
        simsDeployments.some((surveyDeployment) => surveyDeployment.critter_id === simsCritter.critter_id)
      )
      .map((critter) => critter.critterbase_critter_id);

    if (!critterbaseCritterIds.length) {
      // Exit early if there are no critterbase critters, and therefore no telemetry
      return [];
    }

    const user = {
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    };

    const bctwDeploymentService = new BctwDeploymentService(user);
    const bctwTelemetryService = new BctwTelemetryService(user);

    // The detailed deployment records from BCTW
    // Note: This may include records the user does not have acces to (A critter may have multiple deployments over its
    // lifespan, but the user may only have access to a subset of them).
    const allBctwDeploymentsForCritters = await bctwDeploymentService.getDeploymentsByCritterId(critterbaseCritterIds);

    // Remove records the user does not have access to
    const usersBctwDeployments = allBctwDeploymentsForCritters.filter((deployment) =>
      simsDeployments.some((item) => item.bctw_deployment_id === deployment.deployment_id)
    );
    const usersBctwDeploymentIds = usersBctwDeployments.map((deployment) => deployment.deployment_id);

    if (!usersBctwDeploymentIds.length) {
      // Exit early if there are no BCTW deployments the user has access to, and therefore no telemetry
      return [];
    }

    // --- Step 4 ------------------------------

    // The telemetry records for the deployments the user has access to
    const allTelemetryRecords = await bctwTelemetryService.getAllTelemetryByDeploymentIds(usersBctwDeploymentIds);

    // --- Step 5 ------------------------------

    // Parse/combine the telemetry, deployment, and critter records into the final response
    const response: FindTelemetryResponse[] = [];
    for (const telemetryRecord of allTelemetryRecords) {
      const usersBctwDeployment = usersBctwDeployments.find(
        (usersBctwDeployment) => usersBctwDeployment.deployment_id === telemetryRecord.deployment_id
      );

      if (!usersBctwDeployment) {
        continue;
      }

      const simsDeployment = simsDeployments.find(
        (simsDeployment) => simsDeployment.bctw_deployment_id === telemetryRecord.deployment_id
      );

      if (!simsDeployment) {
        continue;
      }

      const simsCritter = simsCritters.find(
        (simsCritter) => simsCritter.critterbase_critter_id === usersBctwDeployment?.critter_id
      );

      if (!simsCritter) {
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
        device_id: usersBctwDeployment.device_id,
        // Deployment
        bctw_deployment_id: telemetryRecord.deployment_id,
        critter_id: simsDeployment.critter_id,
        deployment_id: simsDeployment.deployment_id,
        // SurveyCritterRecord
        critterbase_critter_id: usersBctwDeployment.critter_id,
        // ICritter
        animal_id: simsCritter.animal_id
      });
    }

    return response;
  }
}
