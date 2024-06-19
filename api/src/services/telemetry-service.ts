import { default as dayjs } from 'dayjs';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { ITelemetryAdvancedFilters } from '../models/telemetry-view';
import { TelemetryRepository, TelemetrySubmissionRecord } from '../repositories/telemetry-repository';
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
import { BctwService, ICreateManualTelemetry } from './bctw-service';
import { CritterbaseService, ICritterbaseUser } from './critterbase-service';
import { DBService } from './db-service';
import { SurveyCritterService } from './survey-critter-service';

const telemetryCSVColumnValidator: IXLSXCSVValidator = {
  columnNames: ['DEVICE_ID', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
  columnTypes: ['number', 'date', 'string', 'number', 'number'],
  columnAliases: {
    LATITUDE: ['LAT'],
    LONGITUDE: ['LON', 'LONG', 'LNG']
  }
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
    return this.repository.getTelemetrySubmissionById(submissionId);
  }

  /**
   * Retrieves the paginated list of all telemetry records that are available to the user, based on their permissions
   * and provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ITelemetryAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<any[]>}
   * @memberof TelemetryService
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: ITelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<any[]> {
    // Find all critters that the user has access to
    const surveyCritterService = new SurveyCritterService(this.connection);
    const surveyCritters = await surveyCritterService.findCritters(isUserAdmin, systemUserId, filterFields, pagination);

    console.log('11----------------------------------------');
    console.log(surveyCritters);
    console.log('22----------------------------------------');

    // Exit early if there are no critters, and therefore no telemetry
    if (!surveyCritters.length) {
      return [];
    }

    const user: ICritterbaseUser = {
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    };

    const critterbaseCritterIds = surveyCritters.map((critter) => critter.critterbase_critter_id);

    // Get critter records from Critterbase
    const critterbaseService = new CritterbaseService(user);
    const critters = await critterbaseService.getMultipleCrittersByIdsDetailed(critterbaseCritterIds);

    console.log('33----------------------------------------');
    console.log(critters);
    console.log('44----------------------------------------');

    // Get deployments for critters from BCTW
    const bctwService = new BctwService(user);
    const deployments = await bctwService.getDeploymentsByCritterId(critterbaseCritterIds);

    console.log('55----------------------------------------');
    console.log(deployments);
    console.log('66----------------------------------------');

    const deploymentIds = deployments.map((deployment) => deployment.deployment_id);

    // Get telemetry for deployments
    const [vendorTelemetry, manualTelemetry] = await Promise.all([
      bctwService.getVendorTelemetryByDeploymentIds(deploymentIds),
      bctwService.getManualTelemetryByDeploymentIds(deploymentIds)
    ]);

    // const critterDeployments: { animal: ICritter; deployments: IDeploymentRecord[] }[] = critters.map((critter) => {
    //   return {
    //     animal: critters,
    //     deployments: deployments.filter((deployment) => deployment.critter_id === critter.critter_id)
    //   };
    // });

    // Combine deployments with critter information
    // const deployments2 = deployments.flatMap((deployment) => ({
    //   deployment_id: deployment.deployment_id,
    //   device_id: deployment.device_id,
    //   animal: critters.find((critter) => deployment.critter_id === critter.critter_id)
    // }));

    console.log('77----------------------------------------');
    console.log(vendorTelemetry);
    console.log('88----------------------------------------');
    console.log(manualTelemetry);
    console.log('99----------------------------------------');

    const telemetry = vendorTelemetry
      .map((telemetry) => {
        const deployment = deployments.find((item) => item.deployment_id === telemetry.deployment_id);
        const critter_id = deployments.find((item) => item.deployment_id === telemetry.deployment_id)?.critter_id;
        const critter = critters.find((item) => item.critter_id === critter_id);

        const { deployment_id, ...rest } = telemetry;

        return {
          bctw_deployment_id: deployment_id,
          ...rest,
          device_id: deployment?.device_id,
          critterbase_critter_id: critter?.critter_id
        };
      })
      .concat(
        manualTelemetry.map((telemetry) => {
          const deployment = deployments.find((item) => item.deployment_id === telemetry.deployment_id);
          const critter_id = deployments.find((item) => item.deployment_id === telemetry.deployment_id)?.critter_id;
          const critter = critters.find((item) => item.critter_id === critter_id);

          const { deployment_id, ...rest } = telemetry;

          return {
            bctw_deployment_id: deployment_id,
            ...rest,
            device_id: deployment?.device_id,
            critterbase_critter_id: critter?.critter_id
          };
        })
      );

    // const response = vendorTelemetry
    //   .map((vendorTelemetry) => {
    //     return {
    //       ...vendorTelemetry,
    //       animal: critterDeployments.find((critterDeployment) =>
    //         critterDeployment.deployments.find((deployment) => deployment.deployment_id === vendorTelemetry.deployment_id)
    //       ),
    //       device_id: deployments.find((item) => item.deployment_id === vendorTelemetry.deployment_id)?.device_id
    //       deployments: deployments2.filter((deployment) => deployment.deployment_id === telemetry.deployment_id)
    //     };
    //   })
    //   .concat(manualTelemetry.map((telemetry) => {}));

    // // Combine critter, deployment, and telemetry information
    // const telemetry = [
    //   ...vendorTelemetry.map((telemetry) => {
    //     const deployment = deployments2.find((deployment) => deployment.animal);
    //     return {
    //       ...telemetry,
    //       device_id: deployment?.device_id,
    //       animal: deployment?.animal
    //     };
    //   }),
    //   ...manualTelemetry.map((telemetry) => {
    //     const deployment = deployments2.find((deployment) => deployment.animal);
    //     return {
    //       ...telemetry,
    //       device_id: deployment?.device_id,
    //       animal: deployment?.animal
    //     };
    //   })
    // ];

    console.log('XXX----------------------------------------');
    console.log(telemetry);
    console.log('YYY----------------------------------------');

    return telemetry;
  }
}
